import * as XMPP from 'stanza';
import { MessageStore } from "@/store/messages";
import { XEPStore } from "@/store/xeps";
import { Store } from "@/store";
import {loadFromSecure} from "assets/storage";
import features from "stanza/plugins/features";

const client = XMPP.createClient(undefined);

const determineRelatedParty = m => {
    // Lack of 'from' means it's from us
    if(!m.from) {
        return m.to;
    }

    // If our bare JID matches up with the sender's bare JID, then it's also us
    if(XMPP.JID.equalBare(m.from, client.jid)) {
        return m.to;
    }

    // Otherwise, it's the sender
    return m.from;
};

const determineSendingParty = m => m.from || client.jid;

const toBare = jid => XMPP.JID.toBare(jid);
const getResource = jid => XMPP.JID.getResource(jid);
const getDomain = jid => XMPP.JID.getDomain(jid);
const getLocal = jid => XMPP.JID.getLocal(jid);

const generateFunctions = (ctx) => ({
    determineRelatedParty,
    toBare, getResource, getDomain, getLocal,
    updateConfig(...args) {
        client.updateConfig(...args);
    },
    connect() {
        client.connect();
    },
    disconnect() {
        client.disconnect();
    },
    logout() {
        this.disconnect();

        ctx.store.commit(Store.$mutations.updateLoginState, {
            loggedIn: false,
            loggingIn: false,
            loginFailed: false,
            authFailed: false,
        });
        ctx.store.commit(Store.$mutations.unsetPassword, null);
    },
    sendMessage(message) {
        client.sendMessage(message);
    },
    ranks: Object.freeze(['online', 'away', 'xa', 'dnd', 'offline']),
    getRankFromOnlineState(state) {
        return this.ranks.findIndex(s => s.toLowerCase() === state);
    },
    getOnlineStateFromRank(rank) {
        return this.ranks[rank];
    },
    setOnlineStatus(status) {
        return ctx.store.dispatch(Store.$actions.updateOnlineStatus, {status});
    },
    setStatusMessage(message) {
        return ctx.store.dispatch(Store.$actions.updateStatusMessage, {message});
    },
    async goInvisible() {
        return ctx.store.dispatch(Store.$actions.updateInvisibility, true);
    },
    async goVisible() {
        return ctx.store.dispatch(Store.$actions.updateInvisibility, false);
    },
    async serverDisco() {
        const disco = {};
        disco.info = await client.getDiscoInfo(getDomain(client.jid));
        disco.items = (await client.getDiscoItems(getDomain(client.jid))).items;
        disco.items = await Promise.all(disco.items.map(async i => ({...i, info: await client.getDiscoInfo(i.jid)})));
        disco.self = await client.getDiscoInfo(toBare(client.jid));
        disco.services = (await client.getServices(getDomain(client.jid))).services;
        return disco;
    },
});

const setupListeners = ctx => {
    function commit(mutation, ...args) {
        return ctx.store.commit(`${MessageStore.namespace}/${mutation}`, ...args);
    }

    function dispatch(action, ...args) {
        return ctx.store.dispatch(`${MessageStore.namespace}/${action}`, ...args);
    }

    function get(getter, ...args) {
        return ctx.store.getters[`${MessageStore.namespace}/${getter}`](...args);
    }

    async function bind() {
        const [show, status] = loadFromSecure(Store.$states.onlineStatus, Store.$states.statusMessage);
        client.sendPresence({show, status});
        ctx.store.commit(Store.$mutations.setOnlineStatus, show);
        ctx.store.commit(Store.$mutations.setStatusMessage, status);

        await ctx.store.dispatch(`${XEPStore.namespace}/${XEPStore.$actions.updateXepsWithDisco}`);

        // TODO: enable only if supported
        await client.enableCarbons();
        await client.getRoster().then(roster => {
            ctx.store.commit(Store.$mutations.setRoster, roster);
        });
        ctx.store.commit(Store.$mutations.stanzaInitialized);

        Notification.requestPermission();
    }

    client.on('session:started', bind);
    client.on('stream:management:resumed', bind);

    client.on('features', features => {
        console.log(features);

        if(features.rosterVersioning) {
            ctx.store.commit(`${XEPStore.namespace}/${XEPStore.$mutations.setServerXep}`,
                {xep: 'RFC 6121', value: true});
        }

        if(features.streamManagement) {
            ctx.store.commit(`${XEPStore.namespace}/${XEPStore.$mutations.setServerXep}`,
                {xep: 'XEP-0198', value: true});
        }

        if(features.legacyCapabilities?.[0]?.value) {
            ctx.store.commit(`${XEPStore.namespace}/${XEPStore.$mutations.setServerXep}`,
                {xep: 'XEP-0115', value: true});
        }
    });

    client.on('iq:set:roster', ({roster}) => {
        let items = ctx.store.state[Store.$states.roster]?.items || [];
        for (let item of roster.items) {
            const idx = items.findIndex(i => i.jid == item.jid);
            if (idx > 0) {
                if (item.subscription == "remove") {
                    items.splice(idx, 1);
                }
            } else {
                if (item.subscription == "to" || item.subscription == "both") {
                    items.push(item);
                }
            }
        }
        ctx.store.commit(Store.$mutations.setRoster, {...roster, items});
    });

    /**
     * INCOMING PRESENCE/MOOD DATA
     */

    client.on('available', presence => {
        ctx.store.commit(Store.$mutations.updatePresence, {available: true, ...presence});
    });

    client.on('unavailable', presence => {
        ctx.store.commit(Store.$mutations.updatePresence, {available: false, ...presence});
    });

    client.on('avatar', async event => {
        // TODO: look more into the relevant XEPs for avatars
        if(event.avatars[0].id !== await ctx.store.dispatch(Store.$actions.getAvatarId, event.jid))
            ctx.store.dispatch(Store.$actions.downloadAvatar, {jid: event.jid, id: event.avatars[0].id});
    });


    /**
     * INCOMING (DIRECT) CHAT MESSAGES
     */

    client.on('chat', message => {
        const jid = XMPP.JID.toBare(determineRelatedParty(message));
        message.from ||= client.jid;
        message.from = XMPP.JID.toBare(message.from);
        // if message isn't from the client, show a notification
        if (message.from != XMPP.JID.toBare(client.jid)) {
            new Notification(`Bonfire - ${jid}`, {
                body: message.body,
            });
        }
        dispatch(MessageStore.$actions.addMessage, { jid, message });
    });

    /**
     * STREAM RESUMPTION (MESSAGE DELIVERY STATE) HANDLING
     */

    client.on('message:sent', (m, carbon) => {
        commit(MessageStore.$mutations.updateMessageState, {
            id: m.id,
            state: {
                server: carbon,
                muc: false,
                hibernated: false,
                failed: false,
                retry: false
            }
        });

        // Having a 'body' means it is not a receipt, which means we sent an actual message
        if(m.body) {
            client.emit('chat', m);
        }
    });

    client.on('message:acked', m => {
        if (get(MessageStore.$getters.hasMessage, m.id)) {
            commit(MessageStore.$mutations.updateMessageState, {
                id: m.id,
                state: {
                    server: true,
                    muc: false,
                }
            });
        }
    });

    client.on('message:hibernated', m => {
        if (get(MessageStore.$getters.hasMessage, m.id)) {
            commit(MessageStore.$mutations.updateMessageState, {
                id: m.id,
                state: {
                    hibernated: true,
                }
            });
        }
    });

    client.on('message:retry', m => {
        if (get(MessageStore.$getters.hasMessage, m.id)) {
            commit(MessageStore.$mutations.updateMessageState, {
                id: m.id,
                state: {
                    retry: true,
                }
            });
        }
    });

    client.on('message:failed', m => {
        if (get(MessageStore.$getters.hasMessage, m.id)) {
            commit(MessageStore.$mutations.updateMessageState, {
                id: m.id,
                state: {
                    failed: true,
                }
            });
        }
    });

    client.on('iq:set:roster', ({roster}) => {
        let items = (ctx.store.state[Store.$states.roster] || {items: []}).items.slice();
        for (let item of roster.items) {
            let idx = items.findIndex(i => i.jid == item.jid);
            if (idx > 0) {
                if (item.subscription == "remove") {
                    items.splice(idx, 1);
                }
            } else {
                if (item.subscription != "remove") {
                    items.push(item);
                }
            }
        }
        ctx.store.commit(Store.$mutations.setRoster, {
            ...roster,
            items: items,
        });
    });

    /** DEBUG  **/
    client.on("*", (...args) => {
        // console.log(args);
    });

    /** STREAM MANAGEMENT RESUMPTION DATA CACHING **/
    client.sm.cache(cache => {
        ctx.store.commit(Store.$mutations.setStreamManagement, cache);
    });
}

export default (ctx, inject) => {
    setupListeners(ctx);

    inject("stanza", {
        client,
        ...generateFunctions(ctx),
    });
}

import * as XMPP from 'stanza';
import { MessageStore } from "@/store/messages";
import { Store } from "@/store";

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
}

const stripResource = jid => XMPP.JID.toBare(jid);

const generateFunctions = (ctx) => ({
    determineRelatedParty,
    stripResource,
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
        this.ranks[rank];
    }
});

const setupListeners = ctx => {
    function commit(mutation, ...args) {
        return ctx.store.commit(`${MessageStore.namespace}/${mutation}`, ...args);
    }

    function get(getter, ...args) {
        return ctx.store.getters[`${MessageStore.namespace}/${getter}`](...args);
    }

    function bind() {
        client.getRoster().then(roster => {
            ctx.store.commit(Store.$mutations.setRoster, roster);
            client.sendPresence();
        });
    }

    client.on('session:started', bind);
    client.on('stream:management:resumed', bind);

    client.on('iq:set:roster', ({roster}) => {
        ctx.store.commit(Store.$mutations.setRoster, {
            ...roster,
            items: roster.items.filter(x => x.subscription !== "remove")
        });
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

    client.on('avatar', event => {
        console.log(event);
        ctx.store.dispatch(Store.$actions.downloadAvatar, {jid: event.jid});
    });


    /**
     * INCOMING (DIRECT) CHAT MESSAGES
     */

    client.on('chat', message => {
        const jid = determineRelatedParty(message);
        commit(MessageStore.$mutations.addMessage, {
            jid,
            message,
        });
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

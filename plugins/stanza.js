import * as XMPP from 'stanza';
import { MessageStore } from "@/store/messages";
import { Store } from "@/store";

const client = XMPP.createClient(undefined);

const determineMessageMapKey = (ctx, m) => {
    const me = ctx.store.state[ Store.$states.jid ];
    if(m.from === me) {
        return m.to;
    }

    return m.from;
}

const generateFunctions = (ctx) => ({
    determineMessageMapKey: m => determineMessageMapKey(ctx, m),
});

const setupListeners = ctx => {
    function commit(mutation, ...args) {
        return ctx.store.commit(`${MessageStore.namespace}/${mutation}`, ...args);
    }

    function get(getter, ...args) {
        return ctx.store.getters[`${MessageStore.namespace}/${getter}`](...args);
    }

    client.on('session:started', () => {
        client.getRoster().then(roster => {
            ctx.store.commit(Store.$mutations.setRoster, roster);
        });
        client.sendPresence();
    });

    /**
     * INCOMING (DIRECT) CHAT MESSAGES
     */

    client.on('chat', message => {
        const jid = determineMessageMapKey(ctx, message);
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
    });

    client.on('message:acked', m => {
        console.log("message:acked", m)
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

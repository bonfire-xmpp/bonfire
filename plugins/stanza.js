import * as XMPP from 'stanza';
import { MessageStore } from "@/store/messages";
import { Store } from "@/store";

const client = XMPP.createClient(undefined);

const determineMessageMapKey = (ctx, m) => {
    // Lack of 'from' means it's from us
    if(!m.from) {
        return m.to;
    }

    return m.from;
}

const generateFunctions = (ctx) => ({
    determineMessageMapKey(m) {
        determineMessageMapKey(ctx, m)
    },
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
    }
});

const setupListeners = ctx => {
    function commit(mutation, ...args) {
        return ctx.store.commit(`${MessageStore.namespace}/${mutation}`, ...args);
    }

    function get(getter, ...args) {
        return ctx.store.getters[`${MessageStore.namespace}/${getter}`](...args);
    }

    // TODO: Sometimes successful connections don't trigger session:started
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

        // Having a 'body' means it is not a receipt
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

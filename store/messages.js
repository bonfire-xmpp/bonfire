import messageDb from '@/assets/messageDb.js';

/**
 * Message state definition. Due to a lack of typescript, this will have to settle:
 * {
 *     retry: message is being resent automatically
 *     failed: message couldn't be resent (reqs user interaction)
 *     hibernated: no network, different from retry?
 *     server: has our server recieved the message
 *     muc: has the destination MUC received
 * }
 *
 * Messages really only have a couple of delivery states:
 *  NotReceived (sending, retrying, hibernated), Received (MUC and server), Failed (failed or error)
 *
 */
const $states = {
    // Map< JID -> [Message] >
    messages: 'MESSAGES',

    // Map< ID -> Message >
    messagesById: 'MESSAGES_BY_ID',

    // Map< ID -> MessageState >
    messageStateById: 'MESSAGE_STATE_BY_ID',
};

const $getters = {
    hasMessage: 'HAS_MESSAGE',
};
const $actions = {
    restoreMessagesFromStorage: 'RESTORE_MESSAGES_FROM_STORAGE',
};
const $mutations = {
    setMessages: 'SET_MESSAGES',
    setMessagesById: 'SET_MESSAGES_BY_ID',
    setMessageStateById: 'SET_MESSAGE_STATE_BY_ID',

    addMessage: 'ADD_MESSAGE',
    updateMessageState: 'SET_MESSAGE_STATE',
}

export const state = () => ({
    [$states.messages]: new Map(),
    [$states.messagesById]: new Map(),
    [$states.messageStateById]: new Map(),
});

export const getters = {
    [$getters.hasMessage]: state => id => {
        return state[$states.messagesById].has(id);
    },
};
export const actions = {
    async [$actions.restoreMessagesFromStorage] ( { commit } ) {
        try {
            const withs = await messageDb.messages.orderBy('with').uniqueKeys();

            const messagesByJid = new Map();
            const messageStateById = new Map();
            const messagesById = new Map();

            for (const jid of withs) {
                // Last 100 messages with each JID present
                const lastHundred = (await messageDb.messages
                    .where('with').equals(jid)
                    .sortBy('timestamp'))
                    .slice(0, 100);

                console.log(jid, lastHundred);
                messagesByJid.set(jid, lastHundred);

                const ids = []
                lastHundred.map(m => {
                    messagesById.set(m.id, m);
                    ids.push(m.id);
                });

                (await messageDb.messageStates
                    .where('id').anyOf(ids)
                    .toArray()).map(s => messageStateById.set(s.id, s));
            }

            commit($mutations.setMessages, messagesByJid);
            commit($mutations.setMessagesById, messagesById);
            commit($mutations.setMessageStateById, messageStateById);
        } catch (e) {
            console.error("Couldn't restore messages from storage!", e);
        }
    }
};

const resourceRegex = new RegExp("\\/.+$");
export const mutations = {
    [$mutations.setMessages] ( state, data ) {
        state[$states.messages] = data;
    },

    [$mutations.setMessagesById] ( state, data ) {
        state[$states.messagesById] = data;
    },

    [$mutations.setMessageStateById] ( state, data ) {
        state[$states.messageStateById] = data;
    },

    [$mutations.addMessage] ( state, { jid, message, state: messageState } ) {
        const bareJid = jid.replace(resourceRegex, "");
        if(!state[$states.messages].has(bareJid))
            state[$states.messages].set(bareJid, []);

        message.timestamp = new Date();
        message.with = bareJid;

        const size = state[$states.messages].get(bareJid).push(message);

        // Rolling buffer of 100 items/JID
        if(size > 100) {
            const message = state[$states.messages].get(bareJid).splice(0, 1);
            state[$states.messagesById].delete(message[0].id);
        }

        state[$states.messagesById].set(message.id, message);

        messageDb.messages.add(message);

        if(messageState) {
            state[$states.messageStateById].set(message.id, messageState)
            messageDb.messageStates.put({id: message.id, ...messageState});
        }
    },

    [$mutations.updateMessageState] (state, { id, state: messageState } ) {
        state[$states.messageStateById].set(id, messageState)

        messageDb.messageStates.put({id, ...messageState});
    }
};

export const MessageStore = {
    namespace: 'messages',
    $getters, $mutations, $actions, $states
};

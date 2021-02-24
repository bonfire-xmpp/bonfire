import * as storage from '@/assets/storage'

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
    setMessage: 'SET_MESSAGE',
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
    [$actions.restoreMessagesFromStorage] ( { commit } ) {
        try {
            const messages = new Map(JSON.parse(storage.permanent.getItem($states.messages)));
            const messagesById = new Map(JSON.parse(storage.permanent.getItem($states.messagesById)));
            const messageStateById = new Map(JSON.parse(storage.permanent.getItem($states.messageStateById)));

            commit($mutations.setMessages, messages);
            commit($mutations.setMessagesById, messagesById);
            commit($mutations.setMessageStateById, messageStateById);
        } catch (e) {

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

        state[$states.messages].get(bareJid).push(message);
        state[$states.messagesById].set(message.id, message);

        if(messageState)
            state[$states.messageStateById].set(message.id, messageState)

        // TODO: store these in a more efficient manner
        storage.permanent.setItem($states.messages, JSON.stringify(Array.from(state[$states.messages])));
        storage.permanent.setItem($states.messagesById, JSON.stringify(Array.from(state[$states.messagesById])));
        storage.permanent.setItem($states.messageStateById, JSON.stringify(Array.from(state[$states.messageStateById])));
    },

    [$mutations.setMessage] ( state, { jid, message, state: messageState } ) {
        // This tests if the two maps really point to the same objects...
        if(data.jid)
            state[$states.messages].set(jid, message);
        else if(data.id)
            state[$states.messagesById].set(message.id, message);

        // TODO: store these in a more efficient manner
        storage.permanent.setItem($states.messages, JSON.stringify(Array.from(state[$states.messages])));
        storage.permanent.setItem($states.messagesById, JSON.stringify(Array.from(state[$states.messagesById])));

        if(messageState) {
            state[$states.messageStateById].set(message.id, messageState);

            // TODO: store these in a more efficient manner
            storage.permanent.setItem($states.messageStateById, JSON.stringify(Array.from(state[$states.messageStateById])));
        }
    },

    [$mutations.updateMessageState] (state, { id, state: messageState } ) {
        state[$states.messageStateById].set(id, messageState)

        // TODO: store these in a more efficient manner
        storage.permanent.setItem($states.messageStateById, JSON.stringify(Array.from(state[$states.messageStateById])));
    }
};

export const MessageStore = {
    namespace: 'messages',
    $getters, $mutations, $actions, $states
};

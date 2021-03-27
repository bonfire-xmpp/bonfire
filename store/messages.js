import messageDb from '@/assets/messageDb.js';
import { Store } from "@/store/index";
import Vue from "vue";
import * as msgpack from "@msgpack/msgpack";
import { populateSearchIndex } from "./search";
import * as XMPP from 'stanza';
const lz4 = require("lz4js");

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
 * Message definition
 * {
 *     body: String
 *     from: String
 *     to: String
 *     originId: String
 *     timestamp: String
 *     type: String
 *     with: String
 * }
 */
const $states = {
    // Map< JID -> [Message] >
    messages: 'MESSAGES',

    // Map< ID -> Message >
    messagesById: 'MESSAGES_BY_ID',

    // Map< ID -> MessageState >
    messageStateById: 'MESSAGE_STATE_BY_ID',

    chatComposing: 'CHAT_COMPOSING',
};

const $getters = {
    hasMessage: 'HAS_MESSAGE',
};

const $actions = {
    syncMessages: 'SYNC_MESSAGES',
    loadCurrentMessages: 'LOAD_CURRENT_MESSAGES',
    addMessage: 'ADD_MESSAGE',
};

const $mutations = {
    setMessages: 'SET_MESSAGES',
    setMessagesById: 'SET_MESSAGES_BY_ID',
    setMessageStateById: 'SET_MESSAGE_STATE_BY_ID',

    addMessage: 'ADD_MESSAGE',
    updateMessageState: 'SET_MESSAGE_STATE',

    setComposing: 'SET_COMPOSING',
};

export const state = () => ({
    [$states.messages]: {},
    [$states.messagesById]: {},
    [$states.messageStateById]: {},
    [$states.chatComposing]: {},
});

export const getters = {
    [$getters.hasMessage]: state => id => {
        return !!state[$states.messagesById][id];
    },
};

const delayIterator = async (cb, delay) => {
    while (await cb()) await new Promise(resolve => setTimeout(resolve, delay));
};

const kBlockSize = 10;

async function insertBlock(messages, jid) {
    let timestamp = messages[0].timestamp;
    let compblock = lz4.compress(Buffer.from(msgpack.encode(messages)));
    console.log({ block: compblock, timestamp, with: jid });
    let id = await messageDb.messageArchive.add({ block: compblock, timestamp, with: jid });
    await populateSearchIndex(messageDb, id, messages);
}

export const actions = {
    /** LOAD_CURRENT_MESSAGES **/
    async [$actions.loadCurrentMessages] ({ commit }, jid) {
        commit($mutations.setMessages, { jid, messages: await messageDb.messages.where("with").equals(jid).toArray() });
    },

    /** SYNC_MESSAGES **/
    async [$actions.syncMessages] ( { dispatch }, jid ) {
        // QUERY SERVER FOR MESSAGES
        let curmessages =
            await messageDb.messageArchive.where("with").equals(jid).sortBy("timestamp") ||
            await messageDb.messages.where("with").equals(jid).sortBy("timestamp");
        let lastTimestamp;
        if (curmessages?.length) {
            lastTimestamp = new Date(curmessages[0].timestamp - 1);
        }
        
        let messagesSeen = 0;
        let messages = [];
        let lastID = "";
        await delayIterator(async () => {
            // search from the first ID in the last page, but only messages before the earliest stored timestamp
            let history = await this.$stanza.client.searchHistory({
                with: jid,
                paging: { before: lastID },
                end: lastTimestamp,
            });
            // console.log(history);
            
            for (let { item: { message, delay } } of history.results) {
                if (message.body) {
                    message.from = XMPP.JID.toBare(message.from);
                    message.to = XMPP.JID.toBare(message.to);
                    message.with = XMPP.JID.toBare(message.with);
                    message.timestamp = delay.timestamp.getTime();
                    messages.push(message);
                    ++messagesSeen;
                }
            }
            
            if (messages.length >= kBlockSize) {
                await messageDb.transaction("rw", messageDb.messageArchive, messageDb.prefixIndex, async () => {
                    await insertBlock(messages.sort((a, b) => a.timestamp - b.timestamp), jid);
                });
                messages = [];
            }
            lastID = history.paging.first;
            
            return messagesSeen < 40 && !history.complete;
        }, 50);
        
        // add remaining messages to a block
        if (messages.length) {
            await messageDb.transaction("rw", messageDb.messageArchive, messageDb.prefixIndex, async () => {
                await insertBlock(messages, jid);
            });
        }
        await dispatch($actions.loadCurrentMessages, jid);
    },
        
    /** ADD_MESSAGE **/
    async [$actions.addMessage] ({ commit }, { jid, message, state: messageState }) {
        const bareJid = XMPP.JID.toBare(jid);
        message.timestamp ||= Date.now();
        message.with = bareJid;
        
        commit($mutations.addMessage, { bareJid, message, messageState });
        if (messageState) {
            messageDb.messageStates.put({id: message.id, ...messageState});
        }

        try {
            await messageDb.messages.put(message);
        } catch (_) {
            return;
        }

        // message block archive
        await messageDb.transaction("rw", messageDb.messages, messageDb.messageArchive, messageDb.prefixIndex, async () => {
            const query = messageDb.messages.where("with").equals(bareJid);
            if ((await query.count()) >= kBlockSize) {
                // block timestamp is first message timestamp
                await insertBlock(await query.sortBy("timestamp"), bareJid);
                await query.delete();
            }
        });
    },
};

export const mutations = {
    /** SET_MESSAGES **/
    [$mutations.setMessages] ( state, { jid, messages }) {
        Vue.set(state[$states.messages], jid, messages);
    },
    
    /** SET_MESSAGES_BY_ID **/
    [$mutations.setMessagesById] ( state, data ) {
        state[$states.messagesById] = data;
    },
    
    /** SET_MESSAGE_STATE_BY_ID **/
    [$mutations.setMessageStateById] ( state, data ) {
        state[$states.messageStateById] = data;
    },

    /** ADD_MESSAGES **/
    [$mutations.addMessage] ( state, { bareJid, message, messageState } ) {
        if(!state[$states.messages][bareJid])
            Vue.set(state[$states.messages], bareJid, []);

        state[$states.messages][bareJid].push(message);

        Vue.set(state[$states.messagesById], message.id, message);

        if(messageState) {
            Vue.set(state[$states.messageStateById], message.id, messageState);
        }
    },

    [$mutations.updateMessageState] (state, { id, state: messageState } ) {
        Vue.set(state[$states.messageStateById], id, messageState);

        messageDb.messageStates.put({id, ...messageState});
    },

    [$mutations.setComposing] (state, { user, composing }) {
        Vue.set(state[$states.chatComposing], user, composing);
    },
};

export const MessageStore = {
    namespace: 'messages',
    $getters, $mutations, $actions, $states
};

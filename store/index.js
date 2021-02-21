import * as XMPP from 'stanza';

const $states = {
    jid: 'JID',

    // In case the domain in the JID doesn't match
    server: 'SERVER',

    password: 'PASSWORD',

    // When a .well-known/host-meta.json file isn't present on the host server,
    //  there should be a way for the user to manually configure BOSH/WSS URLs.
    // @see stanza.js/createClient()
    transports: 'TRANSPORTS',

    loggedIn: 'LOGGED_IN',
};

const $getters = {};
const $actions = {
    login: 'LOGIN',
};
const $mutations = {
    setJid: 'SET_JID',
    setServer: 'SET_SERVER',
    setPassword: 'SET_PASSWORD',
    setTransports: 'SET_TRANSPORTS',
    setLoggedIn: 'SET_LOGGED_IN',
}

export const state = () => ({
    [$states.jid]: '',
    [$states.server]: '',
    [$states.password]: '',
    [$states.transports]: {},
    [$states.loggedIn]: false,
});

export const getters = {};
export const actions = {
    // TODO: support custom transport options
    async [$actions.login]({ commit, state }, { jid, password, server, transports }) {
        // TODO: preemptively auto-discover a way to connect to the server, show manual transports fields if unable
        // TODO: Avoid creating a new client every time ('transports' only work when passed to the constructor like this)
        let options = { jid, password, server, transports: transports || {bosh:true,websocket:true} };
        this.$stanza.client = XMPP.createClient(options);

        // TODO: figure out a way to detect when host is unreachable
        this.$stanza.client.connect();

        this.$stanza.client.on("auth:success", () => {
            commit($mutations.setLoggedIn, true);
            commit($mutations.setJid, jid);
            commit($mutations.setPassword, password);
        });
    }
};
export const mutations = {
    [$mutations.setJid] ( state, data ) {
        state[$states.jid] = data;
    },

    [$mutations.setServer] ( state, data ) {
        state[$states.server] = data;
    },

    [$mutations.setPassword] ( state, data ) {
        state[$states.password] = data;
    },

    [$mutations.setTransports] ( state, data ) {
        state[$states.transports] = data;
    },

    [$mutations.setLoggedIn] ( state, data ) {
        state[$states.loggedIn] = data;
    },
};

export const Store = {
    $getters, $mutations, $actions, $states
};

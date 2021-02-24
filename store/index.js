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

    streamManagement: 'STREAM_MANAGEMENT',

    // See stanza.js/AccountManagement
    account: 'ACCOUNT',

    // See stanza.js/Roster
    roster: 'ROSTER',
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
    setStreamManagement: 'SET_STREAM_MANAGEMENT',
    setAccount: 'SET_ACCOUNT',
    setRoster: 'SET_ROSTER',
}

export const state = () => ({
    [$states.jid]: '',
    [$states.server]: '',
    [$states.password]: '',
    [$states.transports]: {},
    [$states.loggedIn]: false,
    [$states.streamManagement]: null,
    [$states.account]: null,
    [$states.roster]: null,
});

export const getters = {};
export const actions = {
    async [$actions.login]({ commit, state }, { jid, password, server, transports }) {
        let options = { jid, password, server, transports: transports || {bosh:true,websocket:true} };
        this.$stanza.client.updateConfig(options);

        this.$stanza.client.connect();
        this.$stanza.client.once("auth:success", () => {
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

    [$mutations.setStreamManagement] ( state, data ) {
        // TODO: save to session cache
        state[$states.streamManagement] = data;
    },

    [$mutations.setAccount] ( state, data ) {
        state[$states.account] = data;
    },

    [$mutations.setRoster] ( state, data ) {
        state[$states.roster] = data;
    },
};

export const Store = {
    $getters, $mutations, $actions, $states
};

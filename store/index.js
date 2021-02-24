import { Utils } from 'stanza';

import * as storage from '@/assets/storage'
import {loadFromSecure} from "@/assets/storage";

const $states = {
    jid: 'JID',

    // In case the domain in the JID doesn't match
    server: 'SERVER',

    password: 'PASSWORD',

    // When a .well-known/host-meta.json file isn't present on the host server,
    //  there should be a way for the user to manually configure BOSH/WSS URLs.
    // @see stanza.js/createClient()
    transports: 'TRANSPORTS',

    loggingIn: 'LOGIN_IN',
    loggedIn: 'LOGGED_IN',
    loginFailed: 'LOGIN_FAILED',
    authFailed: 'AUTH_FAILED',

    streamManagement: 'STREAM_MANAGEMENT',

    // See stanza.js/AccountManagement
    account: 'ACCOUNT',

    // See stanza.js/Roster
    roster: 'ROSTER',
};

const $getters = {};

const $actions = {
    login: 'LOGIN',
    tryRestoreSession: 'TRY_RESTORE_SESSION',
};

const $mutations = {
    setJid: 'SET_JID',
    setServer: 'SET_SERVER',
    setPassword: 'SET_PASSWORD',
    setTransports: 'SET_TRANSPORTS',

    setLoggedIn: 'SET_LOGGED_IN',
    setLoggingIn: 'SET_LOGGING_IN',
    setLoginFailed: 'SET_LOGIN_FAILED',
    setAuthFailed: 'SET_AUTH_FAILED',

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
    [$states.loggingIn]: false,
    [$states.loginFailed]: false,

    [$states.streamManagement]: null,
    [$states.account]: null,
    [$states.roster]: null,
});

export const getters = {};
export const actions = {
    async [$actions.tryRestoreSession]({ commit, dispatch }) {
        try {
            const smString = storage.session.getItem($states.streamManagement);
            const cached = JSON.parse(smString, Utils.reviveData);

            if(cached) {
                this.$stanza.client.sm.load(cached);
                commit($mutations.setStreamManagement, smString)
            }
        } catch (e) {
            console.debug("Couldn't restore session management cache", e);
        }

        try {
            const [jid, server, password, transports] = loadFromSecure(
                $states.jid, $states.server, $states.password, $states.transports
            );

            await dispatch($actions.login, {jid, server, password, transports});
        } catch (e) {
            console.debug("Couldn't restore credentials", e);
        }
    },

    async [$actions.login]({ commit }, { jid, password, server, transports }) {
        console.debug("Indeed im trying to log in", jid, password, server, transports)
        let options = { jid, password, server: server || undefined, transports: transports || {bosh:true,websocket:true} };
        this.$stanza.client.updateConfig(options);

        this.$stanza.client.connect();
        commit($mutations.setLoggingIn, true);

        this.$stanza.client.on("auth:failed", () => {
            commit($mutations.setLoggedIn, false);
            commit($mutations.setLoginFailed, true);
            commit($mutations.setAuthFailed, true);
        });

        await Promise.any([new Promise(resolve => this.$stanza.client.once("connected", () => {
            commit($mutations.setLoggedIn, true);
            commit($mutations.setLoggingIn, false);
            commit($mutations.setLoginFailed, false);
            commit($mutations.setAuthFailed, false);

            commit($mutations.setJid, jid);
            commit($mutations.setPassword, password);
            resolve()
        })),

        new Promise(resolve => this.$stanza.client.once("disconnected", () => {
            commit($mutations.setLoggedIn, false);
            commit($mutations.setLoggingIn, false);
            commit($mutations.setLoginFailed, true);
            commit($mutations.setAuthFailed, false);

            commit($mutations.setJid, "");
            commit($mutations.setPassword, "");
            resolve()
        }))]);

        this.$stanza.client.sm.cache(cache => {
            commit($mutations.setStreamManagement, cache);
        });
    }
};
export const mutations = {
    [$mutations.setJid] ( state, data ) {
        state[$states.jid] = data;
        storage.secure.setItem($states.jid, JSON.stringify(data));
    },

    [$mutations.setServer] ( state, data ) {
        state[$states.server] = data;
        storage.secure.setItem($states.server, JSON.stringify(data));
    },

    [$mutations.setPassword] ( state, data ) {
        state[$states.password] = data;
        storage.secure.setItem($states.password, JSON.stringify(data));
    },

    [$mutations.setTransports] ( state, data ) {
        state[$states.transports] = data;
        storage.secure.setItem($states.transports, JSON.stringify(data));
    },

    [$mutations.setLoggingIn] ( state, data ) {
        state[$states.loggingIn] = data;
    },

    [$mutations.setAuthFailed] ( state, data ) {
        state[$states.authFailed] = data;
    },

    [$mutations.setLoginFailed] ( state, data ) {
        state[$states.loginFailed] = data;
    },

    [$mutations.setLoggedIn] ( state, data ) {
        state[$states.loggedIn] = data;
    },

    [$mutations.setStreamManagement] ( state, data ) {
        const string = JSON.stringify(data);
        storage.session.setItem($states.streamManagement, string);
        state[$states.streamManagement] = string;
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

import { MessageStore } from "@/store/messages";

import {Utils} from 'stanza';

import * as storage from '@/assets/storage'
import {loadFromSecure} from '@/assets/storage'

const $states = {
    jid: 'JID',

    // In case the domain in the JID doesn't match
    server: 'SERVER',

    password: 'PASSWORD',

    // When a .well-known/host-meta.json file isn't present on the host server,
    //  there should be a way for the user to manually configure BOSH/WSS URLs.
    // @see stanza.js/createClient()
    transports: 'TRANSPORTS',

    /**
     * {
     *     loggedIn: boolean,
     *     loginFailed: boolean,
     *     authFailed: boolean,
     *     loggingIn: boolean
     * }
     */
    loginState: 'LOGIN_STATE',

    streamManagement: 'STREAM_MANAGEMENT',

    // See stanza.js/AccountManagement
    account: 'ACCOUNT',

    // See stanza.js/Roster
    roster: 'ROSTER',
};

const $getters = {
    loggedIn: 'LOGGED_IN',
    loggingIn: 'LOGGING_IN',
    loginFailed: 'LOGIN_FAILED',
    authFailed: 'AUTH_FAILED',
};

const $actions = {
    login: 'LOGIN',
    tryRestoreSession: 'TRY_RESTORE_SESSION',
};

const $mutations = {
    setJid: 'SET_JID',
    setServer: 'SET_SERVER',
    setPassword: 'SET_PASSWORD',
    unsetPassword: 'UNSET_PASSWORD',
    setTransports: 'SET_TRANSPORTS',

    updateLoginState: 'UPDATE_LOGIN_STATE',

    setStreamManagement: 'SET_STREAM_MANAGEMENT',
    setAccount: 'SET_ACCOUNT',
    setRoster: 'SET_ROSTER',
}

export const state = () => ({
    [$states.jid]: '',
    [$states.server]: '',
    [$states.password]: '',
    [$states.transports]: {},

    [$states.loginState]: {
        loggedIn: false,
        loginFailed: false,
        authFailed: false,
        loggingIn: false
    },

    [$states.streamManagement]: null,
    [$states.account]: null,
    [$states.roster]: null,
});

export const getters = {
    [$getters.loggedIn] ( state ) {
        return state[$states.loginState].loggedIn;
    },

    [$getters.authFailed] ( state ) {
        return state[$states.loginState].authFailed;
    },

    [$getters.loginFailed] ( state ) {
        return state[$states.loginState].loginFailed;
    },

    [$getters.loggingIn] ( state ) {
        return state[$states.loginState].loggingIn;
    },
};

export const actions = {
    async [$actions.tryRestoreSession]({ commit, dispatch, state }) {
        try {
            const cached = JSON.parse(storage.session.getItem($states.streamManagement), Utils.reviveData);

            if(cached) {
                this.$stanza.client.sm.load(cached);
                commit($mutations.setStreamManagement, cached)
            }
        } catch (e) {
            console.debug("Couldn't restore session management cache", e);
        }

        try {
            const [jid, server, password, transports] = loadFromSecure(
                $states.jid, $states.server, $states.password, $states.transports
            );

            if(jid && password) await dispatch($actions.login, {jid, server, password, transports});
        } catch (e) {
            console.debug("Couldn't restore credentials", e);
        }

        // If we logged in, try restoring messages too
        if(state[$states.loginState].loggedIn) {
            await dispatch(`${MessageStore.namespace}/${MessageStore.$actions.restoreMessagesFromStorage}`);
        }
    },

    async [$actions.login]({ commit }, { jid, password, server, transports, resource }) {
        let options = {
            jid,
            password,
            server: server || undefined,
            transports: transports || {bosh: true, websocket: true},
            resource: resource || `${Math.round(Math.random() * 100)}-bonfire`,
            allowReconnect: true,
        };
        this.$stanza.client.updateConfig(options);

        this.$stanza.client.connect();
        commit($mutations.updateLoginState, {
            loggedIn: false,
            loginFailed: false,
            authFailed: false,
            loggingIn: true
        });

        this.$stanza.client.on("auth:failed", () => {
            commit($mutations.updateLoginState, {
                loggedIn: false,
                loginFailed: true,
                authFailed: true,
                loggingIn: false
            });
        });

        await Promise.any([new Promise(resolve => this.$stanza.client.once("auth:success", () => {
            commit($mutations.updateLoginState, {
                loggedIn: true,
                loginFailed: false,
                authFailed: false,
                loggingIn: false
            });

            commit($mutations.setJid, jid);
            commit($mutations.setPassword, password);
            resolve()
        })),

        new Promise(resolve => this.$stanza.client.once("disconnected", () => {
            commit($mutations.updateLoginState, {
                loggedIn: false,
                loginFailed: true,
                loggingIn: false
            });
            resolve()
        }))]);
    }
};


/**
 * Generates mutators by prepending SET_ to passed names.
 * If `storage` is an object, it will generate mutations that also call storage.setItem(name, JSON.stringify(data))
 * @param storage An object with method setItem(key, value). Optional.
 * @param names Varargs list of $states field names
 * @returns An object of mutations, for use with the object spread operator
 */
const generateMutations = (storage, ...names) => {
    const mutations = {};

    // Avoid putting this 'if' inside the generated functions, because it would get checked redundantly on each call
    // The closest to a macro/constexpr if. Sadly, creates a lot of duplicate code
    if( typeof storage === "object" ) {
        for (let name of names) {
            const mutationName = `SET_${name}`;

            mutations[mutationName] = (state, data) => {
                state[name] = data;
                storage.setItem(name, JSON.stringify(data));
            }
        }
    } else if( typeof storage === "string") {
        names.push(storage);

        for (let name of names) {
            const mutationName = `SET_${name}`;

            mutations[mutationName] = (state, data) => {
                state[name] = data;
            }
        }
    }

    return mutations;
}

export const mutations = {
    ...generateMutations(storage.secure,
        $states.jid, $states.password, $states.server, $states.transports),

    ...generateMutations($states.account, $states.roster),

    [$mutations.unsetPassword] ( state ) {
        state[$states.password] = "";
        storage.secure.removeItem($states.password);
    },

    [$mutations.updateLoginState] ( state, data ) {
        state[$states.loginState] = Object.assign(state[$states.loginState], data);
    },

    [$mutations.setStreamManagement] ( state, data ) {
        const string = JSON.stringify(data);
        storage.session.setItem($states.streamManagement, string);
        state[$states.streamManagement] = string;
    },
};

export const Store = {
    $getters, $mutations, $actions, $states
};

import { SettingsStore } from "@/store/settings";

import { Utils } from 'stanza';

import * as storage from '@/assets/storage'
import {loadFromSecure, loadFromSession} from '@/assets/storage'

import Vue from 'vue';

const $states = {
    pageTitle: 'PAGE_TITLE',

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

    loginDate: 'LOGIN_DATE',

    /**
     * {
     *     type: muc | chat
     *     entity: jid
     * }
     */
    activeChat: 'ACTIVE_CHAT',

    stanzaInitialized: 'STANZA_INITIALIZED',
    streamManagement: 'STREAM_MANAGEMENT',

    // See stanza.js/AccountManagement
    account: 'ACCOUNT',

    // See stanza.js/Roster
    roster: 'ROSTER',

    avatars: 'AVATARS',

    resources: 'RESOURCES',
    presences: 'PRESENCES',

    onlineStatus: 'ONLINE_STATUS',
    statusMessage: 'STATUS_MESSAGE',
    invisibility: 'INVISIBILITY'
};

const $getters = {
    loggedIn: 'LOGGED_IN',
    loggingIn: 'LOGGING_IN',
    loginFailed: 'LOGIN_FAILED',
    authFailed: 'AUTH_FAILED',
    presence: 'GET_PRESENCE',
};

const $actions = {
    login: 'LOGIN',
    tryRestoreSession: 'TRY_RESTORE_SESSION',
    downloadAvatar: 'DOWNLOAD_AVATAR',
    getAvatar: 'GET_AVATAR',

    updateOnlineStatus: 'UPDATE_ONLINE_STATUS',
    updateStatusMessage: 'UPDATE_STATUS_MESSAGE',
    updateInvisibility: 'UPDATE_INVISIBILITY'
};

const $mutations = {
    setPageTitle: 'SET_PAGE_TITLE',

    setJid: 'SET_JID',
    setServer: 'SET_SERVER',
    setPassword: 'SET_PASSWORD',
    unsetPassword: 'UNSET_PASSWORD',
    setTransports: 'SET_TRANSPORTS',

    stanzaInitialized: 'STANZA_INITIALIZED',
    setLoginDate: 'SET_LOGIN_DATE',

    setActiveChat: 'SET_ACTIVE_CHAT',

    updateLoginState: 'UPDATE_LOGIN_STATE',

    updatePresence: 'UPDATE_PRESENCE',
    setPresence: 'SET_PRESENCE',

    updateAvatar: 'UPDATE_AVATAR',

    setStreamManagement: 'SET_STREAM_MANAGEMENT',
    setAccount: 'SET_ACCOUNT',
    setRoster: 'SET_ROSTER',

    setOnlineStatus: 'SET_ONLINE_STATUS',
    setStatusMessage: 'SET_STATUS_MESSAGE',
    setInvisibility: 'SET_INVISIBILITY'
}

export const state = () => ({
    [$states.pageTitle]: '',

    [$states.jid]: '',
    [$states.server]: '',
    [$states.password]: '',
    [$states.transports]: {},

    [$states.loginDate]: undefined,
    [$states.loginState]: {
        loggedIn: false,
        loginFailed: false,
        authFailed: false,
        loggingIn: false
    },

    [$states.stanzaInitialized]: false,
    [$states.streamManagement]: null,
    [$states.account]: null,
    [$states.activeChat]: null,
    [$states.roster]: {},
    [$states.avatars]: {},
    [$states.resources]: {},
    [$states.presences]: {},

    [$states.onlineStatus]: undefined,
    [$states.statusMessage]: undefined,
    [$states.invisibility]: false,
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

    [$getters.presence] ( state ) { return function(jid) {
        return state[$states.presences]?.[this.$stanza.toBare(jid)]?.['_/computed'];
    }},
};

const downloadAvatarJidThrottleMap = {};
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
            const [presenceData] = loadFromSession($states.presences);
            if(presenceData) {
                for (const presenceDatum in presenceData)
                    Vue.set(presenceData, presenceDatum, presenceData[presenceDatum]);
                commit($mutations.setPresence, presenceData);
            }
        }

        // Restore user settings
        dispatch(`${SettingsStore.namespace}/${SettingsStore.$actions.restoreUserSettings}`);
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

            commit($mutations.setLoginDate, new Date());

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
    },

    async [$actions.downloadAvatar]({ commit, state }, { jid }) {
        const bare = this.$stanza.toBare(jid);
        const download = async () => {
            try {
                const avatar = await this.$stanza.client.getAvatar(bare);
                commit($mutations.updateAvatar, {jid, avatar: avatar.content.data})
            } catch (e) {
                console.error(e);
                if(e?.error?.condition === "timeout") {
                    return await download();
                } else {
                    commit($mutations.updateAvatar, {jid, default: true})
                }
            }

            return state[$states.avatars][this.$stanza.toBare(jid)];
        }

        // If this JID's avatar is already being downloaded, return that promise instead
        if(downloadAvatarJidThrottleMap[bare]) return downloadAvatarJidThrottleMap[bare];

        // If not, get a fresh promise and add it to the map
        const promise = download();
        downloadAvatarJidThrottleMap[bare] = promise;

        // Remove it from the map on completion
        promise.then(() => delete downloadAvatarJidThrottleMap[bare]);

        // And return it to the user
        return promise;
    },

    async [$actions.getAvatar]({ dispatch, commit, state }, { jid }) {
        const bare = this.$stanza.toBare(jid);

        const url = state[$states.avatars][bare];

        // Default avatar
        if(url === null) return null;

        // Missing
        if(!url) {
            // Try restoring from storage
            const avatarBase64 = storage.permanent.getItem('avatar-' + bare)
            if(avatarBase64) {
                const avatar = await (await fetch(avatarBase64)).blob();
                commit($mutations.updateAvatar, { jid, avatar, restore: true });
                return state[$states.avatars][bare];
            }

            // Nothing in storage, download it
            return await dispatch($actions.downloadAvatar, {jid});
        }

        // Downloaded
        return url;
    },

    async [$actions.updateOnlineStatus]({ commit, state, dispatch }, {status: show}) {
        const status = state[$states.statusMessage];
        const invisibility = state[$states.invisibility];

        // No show: pure online
        if(!show || show === 'online') {
            this.$stanza.client.sendPresence({status});
            commit($mutations.setOnlineStatus, show);
            return;
        }

        this.$stanza.client.sendPresence({show, status});
        await dispatch($actions.updateInvisibility, false);
        commit($mutations.setOnlineStatus, show);
    },

    [$actions.updateStatusMessage]({ commit, state }, {message: status}) {
        const show = state[$states.onlineStatus];
        this.$stanza.client.sendPresence({show, status});
        commit($mutations.setStatusMessage, status);
    },

    async [$actions.updateInvisibility]({ commit, state }, invisible) {
        // TODO: selectively enable communication with select contacts after going invisible
        const invisibility = state[$states.invisibility];

        if(invisible && !invisibility) await this.$stanza.client.goInvisible(true);
        else if(!invisible && invisibility) {
            await this.$stanza.client.goVisible();
            this.$stanza.client.sendPresence();
        }

        commit($mutations.setInvisibility, invisible);
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
        $states.jid, $states.password, $states.server, $states.transports, $states.onlineStatus, $states.statusMessage),

    ...generateMutations($states.account, $states.roster, $states.loginDate, $states.pageTitle, $states.invisibility),

    [$mutations.setActiveChat] ( state, data ) {
        if(state.settings[SettingsStore.$states.activeChatReceipts]) {
            // Last chat is now inactive
            if (state[$states.activeChat]?.entity) {
                this.$stanza.client.sendMessage({
                    type: "chat",
                    to: state[$states.activeChat].entity,
                    chatState: "inactive",
                });
            }
        }

        state[$states.activeChat] = data;

        if(state.settings[SettingsStore.$states.activeChatReceipts]) {
            // New chat is now active
            this.$stanza.client.sendMessage({
                type: "chat",
                to: state[$states.activeChat].entity,
                chatState: "active",
            });
        }
    },

    [$mutations.stanzaInitialized] ( state ) {
        state[$states.stanzaInitialized] = true;
    },

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

    [$mutations.updateAvatar] ( state, data ) {
        const bare = this.$stanza.toBare(data.jid);

        // Default avatar
        if(data.default) {
            return Vue.set(state[$states.avatars], bare, null);
        }

        if(state[$states.avatars][bare] !== null) {
            URL.revokeObjectURL(state[$states.avatars][bare]);
        }

        const blob = new Blob([data.avatar], {'type': 'image/png'});
        const url = URL.createObjectURL(blob);

        // Data passed is restored from storage; don't save it again
        if(!data.restore) {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            // This async callback is okay because it doesn't touch the store state
            reader.onloadend = function() {
                const base64data = reader.result;
                storage.permanent.setItem('avatar-' + bare, base64data)
            }
        }

        Vue.set(state[$states.avatars], bare, url);
    },

    [$mutations.setPresence] ( state, data ) {
        state[$states.presences] = data;
    },

    [$mutations.updatePresence] ( state, data ) {
        const bare = this.$stanza.toBare(data.from);
        const resource = this.$stanza.getResource(data.from);

        const priority = data.priority;
        if(priority !== undefined) {
            const oldResources = state[$states.resources][bare];
            const oldResource = state[$states.resources][bare]?.[resource];
            Vue.set(state[$states.resources], bare, {
                ...oldResources,
                [resource]: { ...oldResource, priority },
            });
        }

        let oldPresences = state[$states.presences][bare];
        Vue.set(state[$states.presences], bare, {
            ...oldPresences,
            [resource]: { show: data.show, status: data.status, available: data.available, },
        });

        let max = { available: false };
        for(const resource of Object.getOwnPropertyNames(state[$states.presences][bare])) {
            // Workaround to iterate through Vuex store reactive object keys
            // computed is ignored, as that's what we're calculating here
            if(resource === '__ob__' || resource === '_/computed') continue;

            // Create a deep copy to avoid race conditions
            const presence = JSON.parse(JSON.stringify(state[$states.presences][bare][resource]));

            // No `show` means 100% pure online; i.e. the most online you can be
            if(presence.available && !presence.show) {
                max = presence;
                break;
            }

            // The current max is offline; anything that isn't offline is better
            if(!max.available && presence.available) {
                max = presence;
                continue;
            }

            // Choose the 'most online' one out of the two.
            if(this.$stanza.getRankFromOnlineState(max.show)
                < this.$stanza.getRankFromOnlineState(presence.show)) {
                max = presence;
                continue;
            }
        }

        oldPresences = state[$states.presences][bare];
        Vue.set(state[$states.presences], bare, {
            ...oldPresences,
            // A name like this is guaranteed to never be a resource name
            '_/computed': max,
        });

        // Presences don't get updated on stream resumption
        // ...and stream resumption uses data cached in sessionStorage
        // So, cache presences in sessionStorage, too
        storage.session.setItem($states.presences, JSON.stringify(state[$states.presences]));
    },
};

export const Store = {
    $getters, $mutations, $actions, $states
};

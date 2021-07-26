import SettingsStore from "@/store/settings";

import {Utils} from '@bonfire-xmpp/verse';

import * as storage from '@/assets/storage'
import {loadFromPermanent, loadFromSecure, loadFromSession, secure} from '@/assets/storage'

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
    pending: 'PENDING',
    rosterAcceptPrivacyRead: 'ROSTER_ACCEPT_PRIVACY_READ',

    avatars: 'AVATARS',
    avatarIds: 'AVATAR_IDS',

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
    getAvatarId: 'GET_AVATAR_ID',

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
    updateAvatarId: 'UPDATE_AVATAR_ID',

    setStreamManagement: 'SET_STREAM_MANAGEMENT',
    setAccount: 'SET_ACCOUNT',
    setRoster: 'SET_ROSTER',
    diffUpdateRoster: 'DIFF_UPDATE_ROSTER',
    addPending: 'ADD_PENDING',
    removePending: 'REMOVE_PENDING',

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
    [$states.pending]: [],
    [$states.rosterAcceptPrivacyRead]: false,

    [$states.avatars]: {},
    [$states.avatarIds]: {},

    [$states.resources]: {},
    [$states.presences]: {},

    [$states.onlineStatus]: "online",
    [$states.statusMessage]: "",
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
            const [jid, server, password, transports, roster] = loadFromSecure(
                $states.jid, $states.server, $states.password, $states.transports, $states.roster
            );

            if(jid && password) await dispatch($actions.login, {jid, server, password, transports, roster});
        } catch (e) {
            console.debug("Couldn't restore credentials", e);
        }

        // If we logged in, try restoring messages too
        if(state[$states.loginState].loggedIn) {
            const [presenceData] = loadFromSession($states.presences);
            if(presenceData) {
                commit($mutations.setPresence, presenceData);
            }

            const [pending, rosterAcceptPrivacyRead] = loadFromPermanent($states.pending, $states.rosterAcceptPrivacyRead);
            if(pending) commit('SET_PENDING', pending);
            if(rosterAcceptPrivacyRead) commit('SET_ROSTER_ACCEPT_PRIVACY_READ', rosterAcceptPrivacyRead);
        }

        // Restore user settings
        dispatch(`${SettingsStore.namespace}/${SettingsStore.$actions.restoreUserSettings}`);
    },

    async [$actions.login]({ commit }, { jid, password, server, transports, resource, roster }) {
        const options = {
            jid,
            password,
            server: server || undefined,
            transports: transports || {bosh: true, websocket: true},
            resource: resource || `${Math.round(Math.random() * 100)}-bonfire`,
            allowReconnect: true,
            rosterVer: roster?.version,
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

            roster && commit($mutations.setRoster, roster);
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

    /**
     * Downloads the avatar for a given JID, optionally updating the avatar ID.
     * Downloaded avatars are stored as Blobs, with data URLs being saved in the store.
     * Avatar IDs are saved in the store (and LocalStorage) so as to improve
     * @param jid Target user JID
     * @param id Avatar ID. Optional
     * @returns {Promise<String>} Data URL to downloaded avatar
     */
    async [$actions.downloadAvatar]({ commit, state }, { jid, id }) {
        const bare = this.$stanza.toBare(jid);
        const download = async () => {
            try {
                // TODO: get avatar ID here, too
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
        promise.then(() => {
            delete downloadAvatarJidThrottleMap[bare];

            // Save the avatar ID
            commit($mutations.updateAvatarId, {jid, id});
        });

        // And return it to the user
        return promise;
    },

    /**
     * Gets the avatar for `jid`, downloading it if necessary.
     * @param jid Target user JID
     * @returns {Promise<String | null>} The data URL to the avatar, or null if none.
     */
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

    /**
     * Grabs the latest stored avatar ID for the target JID.
     * @param jid Target user JID
     * @returns {String | undefined} The avatar ID, if any.
     */
    [$actions.getAvatarId] ({ commit, state }, jid) {
        const bare = this.$stanza.toBare(jid);
        let id = state[$states.avatarIds][bare]

        // We don't have one in the store, try restoring from permanent storage
        if(!id) {
            id = storage.permanent.getItem('avatarId-' + bare);
            if(id) {
                // Save it to store
                commit($mutations.updateAvatarId, {jid: bare, id});
            }
        }

        return id;
    },

    async [$actions.updateOnlineStatus]({ commit, dispatch }, {status: show}) {
        // No show: pure online
        if(!show || show === 'online') {
            commit($mutations.setOnlineStatus, show);
            return;
        }

        await dispatch($actions.updateInvisibility, false);
        commit($mutations.setOnlineStatus, show);
    },

    [$actions.updateStatusMessage]({ commit }, {message: status}) {
        commit($mutations.setStatusMessage, status);
    },

    async [$actions.updateInvisibility]({ commit, state }, invisible) {
        // TODO: selectively enable communication with select contacts after going invisible
        const invisibility = state[$states.invisibility];

        if(invisible && !invisibility) await this.$stanza.client.goInvisible(true);
        else if(!invisible && invisibility) {
            await this.$stanza.client.goVisible();
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
        for (const name of names) {
            const mutationName = `SET_${name}`;

            mutations[mutationName] = (state, data) => {
                state[name] = data;
                storage.setItem(name, JSON.stringify(data));
            }
        }
    } else if( typeof storage === "string") {
        names.push(storage);

        for (const name of names) {
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

    ...generateMutations(storage.permanent,
        $states.rosterAcceptPrivacyRead),

    ...generateMutations($states.account, $states.loginDate, $states.pageTitle, $states.invisibility, $states.pending),

    // Necessary custom 'set' mutation because the roster object is a complex, deep object,
    // so it needs special care to be Vuex reactive.
    [$mutations.setRoster] ( state, roster ) {
        state[$states.roster]['version'] = roster.version;
        if(!state[$states.roster].items) state[$states.roster]['items'] = [];
        roster.items.forEach((x, i) => state[$states.roster].items[i] = x);
        secure.setItem($states.roster, JSON.stringify(roster));
    },

    /**
     * Updates the current roster using the provided diff
     * @param state The current vuex state
     * @param roster The roster diff object
     */
    [$mutations.diffUpdateRoster] ( state, roster ) {
        // We're already up to date
        if(state[$states.roster].version === roster.version) return;

        // The current roster
        const items = state[$states.roster]?.items || [];

        // For each item in the diff
        for (const item of roster.items) {
            const idx = items.findIndex(i => i.jid === item.jid);

            // If the current item exists in the current roster, update it
            if(idx !== -1) {
                // If we have no subscription, or the item is removed,
                // find it in the current roster and remove it from there
                if (item.subscription === "remove" || (item.subscription === "none" && !item.pending)) {
                    items.splice(idx, 1);
                } else {
                    items[idx] = item;
                }

            // If the current doesn't exist in the current roster, add it
            } else {
                if (["to", "from", "both"].includes(item.subscription) || item.pending)
                    items.push(item);
            }
        }

        // Set the roster with the updated items and new version
        const data = {version: roster.version, items};
        secure.setItem($states.roster, JSON.stringify(data));

        // Just need to set the version, everything else in the items array happens reactively
        roster.version && (state[$states.roster]['version'] = roster.version);
    },

    /**
     * Adds a JID to the list of pending subscriptions
     * @param state Current Vuex state
     * @param jid
     */
    [$mutations.addPending] ( state, jid ) {
        state[$states.pending].push(jid);
        secure.setItem($states.pending, JSON.stringify(state[$states.pending]));
    },

    /**
     * Removes a JID from the list of pending subscriptions, if it exists
     * @param state Current Vuex state
     * @param jid
     */
    [$mutations.removePending] ( state, jid ) {
        const idx = state[$states.pending].indexOf(jid);
        if(idx !== -1) state[$states.pending].splice(idx, 1);
        secure.setItem($states.pending, JSON.stringify(state[$states.pending]));
    },

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
            return state[$states.avatars][bare] = null;
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

        state[$states.avatars][bare] = url;
    },

    [$mutations.updateAvatarId] ( state, {jid, id} ) {
        const bare = this.$stanza.toBare(jid);

        state[$states.avatarIds][bare] = id;
        storage.permanent.setItem('avatarId-' + bare, id);
    },

    [$mutations.setPresence] ( state, data ) {
        state[$states.presences] = data;
    },

    [$mutations.updatePresence] ( state, data ) {
        const bare = this.$stanza.toBare(data.from);
        const resource = this.$stanza.getResource(data.from);

        // Set up structure if missing
        if(state[$states.resources][bare] === undefined) {
            state[$states.resources][bare] = {}
        }
        if(state[$states.resources][bare]
            && state[$states.resources][bare][resource] === undefined) {
            state[$states.resources][bare][resource] = {}
        }

        const priority = data.priority;
        if(priority !== undefined) {
            state[$states.resources][bare][resource].priority = priority;
        }

        let oldPresences = state[$states.presences][bare];
        state[$states.presences][bare] = {
            ...oldPresences,
            [resource]: { show: data.show, status: data.status, available: data.available, },
        };

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
        state[$states.presences][bare] = {
            ...oldPresences,
            // A name like this is guaranteed to never be a resource name
            '_/computed': max,
        };

        // Presences don't get updated on stream resumption
        // ...and stream resumption uses data cached in sessionStorage
        // So, cache presences in sessionStorage, too
        storage.session.setItem($states.presences, JSON.stringify(state[$states.presences]));
    },
};

export default {
    $getters, $mutations, $actions, $states
};

import { permanent, loadFromPermanent } from '@/assets/storage'

const $states = {
    sendTypingReceipts: 'SEND_TYPING_RECEIPTS',
    messageReadReceipts: 'MESSAGE_READ_RECEIPTS',
    activeChatReceipts: 'ACTIVE_CHAT_RECEIPTS',
    resourcePriority: 'RESOURCE_PRIORITY',
};

const $actions = {
    restoreUserSettings: 'RESTORE_USER_SETTINGS',
};

const $getters = {};

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

const $mutations = {
    setActiveChatReceipts: 'SET_ACTIVE_CHAT_RECEIPTS',
    setMessageReadReceipts: 'SET_MESSAGE_READ_RECEIPTS',
    setSendTypingReceipts: 'SET_SEND_TYPING_RECEIPTS',
}

export const state = () => ({
    [$states.activeChatReceipts]: false,
    [$states.messageReadReceipts]: true,
    [$states.sendTypingReceipts]: true,
    [$states.resourcePriority]: 1,
});

export const mutations = {
    ...generateMutations(permanent,
        ...Object.values($states))
}

export const actions = {
    [$actions.restoreUserSettings]({ commit }) {
        for (const $state in $states) {
            let [result] = loadFromPermanent($states[$state]);
            if(result !== undefined) commit('SET_' + $states[$state], result);
        }
    }
};

export const SettingsStore = {
    namespace: 'settings',
    $getters, $mutations, $actions, $states
};

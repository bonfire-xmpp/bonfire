const $states = {
    server: "SERVER",
};

const $actions = {
    updateXepsWithDisco: "UPDATE_XEP_WITH_DISCO",
};

const $getters = {
    getServerXep: "GET_SERVER_XEP",
};

const $mutations = {
    setServerXep: "SET_SERVER_XEP",
}

export const state = () => ({
    [$states.server]: {
        "XEP-0030": false,
        "RFC 6121": false,
        "XEP-0045": false,
        "XEP-0163": false,
        "XEP-0313": false,
        "XEP-0363": false,
        "XEP-0411": false,
        "XEP-0215": false,
        "XEP-0065": false,
        "XEP-0191": false,
        "TURN": false,
        "STUN": false,
        "XEP-0115": false,
        "XEP-0198": false,
        "XEP-0352": false,
        "XEP-0280": false,
        "XEP-0357": false,
    }
});

export const mutations = {
    [$mutations.setServerXep] (state, {xep, value} ) {
        state[$states.server][xep] = !!value;
    },
}

import checks from "@/assets/xeps/server/checks";

export const actions = {
    async [$actions.updateXepsWithDisco] ({ commit }) {
        let data;
        try { data = await this.$stanza.serverDisco() }
        catch (e) {
            // The server doesn't support Service Discovery (or we're offline?)
            return commit($mutations.setServerXep, {xep: "XEP-0030", value: false});
        }

        commit($mutations.setServerXep, {xep: "XEP-0030", value: true});
        for (const [xep, check] of checks.entries()) {
            const value = check(data);
            if(typeof value === "boolean")
                commit($mutations.setServerXep, {xep, value});
        }
    },
};

export const getters = {
    [$getters.getServerXep]: state => flag => state[$states.server][flag],
}

export default {
    namespace: 'xeps',
    $getters, $mutations, $actions, $states
};

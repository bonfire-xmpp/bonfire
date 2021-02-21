import * as XMPP from 'stanza';

let client;

const generateFunctions = (ctx) => ({

    /**
     * Probes transport URLs for a given domain.
     *
     * It will try to GET `/.well-known/host-meta.json`. If it succeeds, it will return the string URL to that file.
     *
     * If that fails, it will try default URLs for wss and BOSH, in that order, and return a tranports object to be used with stanza.
     *
     * If all fails, returns undefined.
     * @param domain XMPP server host domain name
     * @return {Promise<Object | String | undefined>}
     * @see XMPP.createClient()
     */
    async probeTransports(domain) {
        const wellknownHostMeta = `https://${domain}/.well-known/host-meta.json`;
        const wssUrl = `wss://${domain}:5281/xmpp-websocket`;
        const boshUrl = `https://${domain}:5281/http-bind`;

        let hostmeta_res, wss_res, bosh_res;
        try { hostmeta_res = await ctx.$axios.$get(wellknownHostMeta); } catch (e) { console.error(e) }

        // TODO: add wss detection
        wss_res = true;

        try { bosh_res = await ctx.$axios.$get(boshUrl); } catch (e) { console.error(e) }

        if (hostmeta_res) return wellknownHostMeta;

        if (wss_res || bosh_res) {
            return {
                websocket: wssUrl,
                bosh: bosh_res && boshUrl,
            }
        } else {
            return undefined;
        }
    },
});

export default (ctx, inject) => {
    inject("stanza", {
        client,
        ...generateFunctions(ctx),
    });
}

/**
 * Server feature discovery data gets collected once,
 * and is then passed to these checks to check their respective extension.
 *
 * See the Service Discovery XEP for more info, and each individual XEP on how to detect it
 *
 * The data looks like this:
 * {
 *     // disco info on own bare JID
 *     self: {
 *         extensions: [],
 *         features:   [],
 *         identities: [],
 *     },
 *
 *     info: {
 *         extensions: [],
 *         features:   [],
 *         identities: [],
 *     },
 *     items: [{
 *         jid: "", name: "Natural Language Name",
 *
 *         // The respective disco info for the JID
 *         info: {
 *             extensions: [],
 *             features:   [],
 *             identities: [],
 *         }
 *     }],
 *     services: [{
 *         host, port, transport, type, username?, password?
 *     }]
 * }
 */
export default new Map([
    // ["RFC 6121", ({info: {features}}) => features.includes("jabber:iq:roster")],

    ["XEP-0045", ({info: {features}, items}) =>
        features.includes("http://jabber.org/protocol/muc")
        || items.some(i => i.info.features.includes("http://jabber.org/protocol/muc"))],

    ["XEP-0163", ({info: {identities}}) =>
        identities.some(i => i.category.toLocaleLowerCase() === 'pubsub'
            && i.type.toLocaleLowerCase() === 'pep')],

    // Latest XEP revision (as of May 20, 2021) says to suffix with :2, but :0, :1 are still in the wild
    ["XEP-0313", ({info: {features}}) => features.some(str => str.startsWith("urn:xmpp:mam"))],

    ["XEP-0363", ({info: {features}, items}) => features.includes("urn:xmpp:http:upload")
        || items.some(i => i.info.features.includes("urn:xmpp:http:upload"))],

    ["XEP-0411", ({self: {features}}) => features.includes("urn:xmpp:bookmarks-conversion:0")],

    ["XEP-0215", ({info: {features}}) => features.includes("urn:xmpp:extdisco:1")
        || features.includes("urn:xmpp:extdisco:2")],

    ["XEP-0065", ({info: {identities}, items}) =>
        (identities.some(i => i.category.toLocaleLowerCase() === 'proxy'
            && i.type.toLocaleLowerCase() === 'bytestreams'))
    || (items.identities.some(i => i.category.toLocaleLowerCase() === 'proxy'
        && i.type.toLocaleLowerCase() === 'bytestreams'))],

    ["XEP-0191", ({info: {features}}) => features.includes("urn:xmpp:blocking")],


    ["TURN", ({services}) => services.some(s => s.type.toLocaleLowerCase() === "turn")],
    ["STUN", ({services}) => services.some(s => s.type.toLocaleLowerCase() === "stun")],


    // ["XEP-0115", ({features}) => {}],

    // ["XEP-0198", ({features}) => {}],

    ["XEP-0352", ({features}) => {
        // TODO: to detect this, we need to check for a <csi xmlns='urn:xmpp:csi:0'/> in <stream:features/> when connecting. Stanza doesn't support atm.
    }],

    ["XEP-0280", ({info: {features}}) => features.includes("urn:xmpp:carbons:1")
        || features.includes("urn:xmpp:carbons:2")],

    ["XEP-0357", ({self: {features}}) => features.includes("urn:xmpp:push:0")],
]);

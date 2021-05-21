export default new Map([
    ["RFC 6121", {
        name: "Roster Versioning",
        desc: "Efficient roster updating by versioning and exchanging only the changed parts of roster."
    }],
    ["XEP-0030", {
        name: "Service Discovery",
        desc: "Protocol for discovering what the server supports. Nearly all other XEPs are discovered through this!"
    }],
    ["XEP-0045", {
        name: "Multi-User Chat",
        desc: "Support for rooms, moderation, roles, bans, and invites for multi-user chat rooms."
    }],
    ["XEP-0163", {
        name: "Personal Eventing Protocol",
        desc: "Lets users send events to people in their roster. Used for avatars and enabling OMEMO encryption"
    }],
    ["XEP-0313", {
        name: "Message Archive Management",
        desc: "Mechanism for querying and controlling messages archived on the server. This will be used to sync messages on first login, and subsequently as fallback if <b>Message Carbons</b> aren't supported"
    }],
    ["XEP-0363", {
        name: "HTTP File Upload",
        desc: "Allows for a way to transfer files between users by uploading the file to an intermediary HTTP server"
    }],
    ["XEP-0411", {
        name: "Bookmarks Conversion",
        desc: "Converts between <b>Private XMP-</b> and <b>PEP-based bookmarks</b>"
    }],
    ["XEP-0215", {
        name: "External Service Discovery",
        desc: "Lets clients discover services external to the XMPP network."
    }],
    ["XEP-0065", {
        name: "SOCKS5 Bytestreams Proxy",
        desc: "Provides a way for clients to stream binary data between themselves, directly or mediated. Used for things such as file transfer. This check passes if the server can act as a proxy between clients."
    }],
    ["XEP-0191", {
        name: "Blocking Command",
        desc: "Easy to implement, server-side user blocking."
    }],
    ["TURN", {
        name: "TURN Service",
        desc: "The server has a TURN service discoverable through <b>XEP-0215 External Service Discovery.</b>"
    }],
    ["STUN", {
        name: "STUN Service",
        desc: "The server has a STUN service discoverable through <b>XEP-0215 External Service Discovery.</b>"
    }],
    ["XEP-0115", {
        name: "Entity Capabilities",
        desc: "A robust, scalable way for exchanging info about capabilities supported by clients."
    }],
    ["XEP-0198", {
        name: "Stream Management",
        desc: "Improves network reliability by resuming interrupted streams, as well as delivery status."
    }],
    ["XEP-0352", {
        name: "Client State Indication",
        desc: "Lets a client tell the server when it's (in)active, so that the server can optimize traffic.",
        warning: "Currently isn't detected, even when present."
    }],
    ["XEP-0280", {
        name: "Message Carbons",
        desc: "Send carbon copies of messages to all of your devices, keeping them up-to-date."
    }],
    ["XEP-0357", {
        name: "Push Notifications",
        desc: "The server knows how and when to send you push notifications."
    }],
]);

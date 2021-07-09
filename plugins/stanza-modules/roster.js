import {Store} from "@/store";
import {JID} from "@bonfire-xmpp/verse";

export const bind = async ({ctx, client}) => {
    await client.getRoster().then(roster => {
        ctx.store.commit(Store.$mutations.diffUpdateRoster, roster);
    });
}

export const install = ({ctx, client}) => {
    // Handle roster updates. The server is aware of the client's
    // current roster version, and all updates are sent as diffs
    // of the current roster version
    client.on('roster:update', ({roster}) => {
        ctx.store.commit(Store.$mutations.diffUpdateRoster, roster);

        // Subsequent roster updates mean they probably happened on another client.
        // The user, then, must have interacted with the mentioned JIDs: remove them from the pending list.
        // At worst, we'll get the subscription request on next presence (i.e. refresh).
        roster.items.forEach(i => ctx.store.commit(Store.$mutations.removePending, JID.toBare(i.jid)))
    });

    // Somebody wants to subscribe to _us_
    client.on('subscribe', presence => {
        const jid = JID.toBare(presence.from);

        // Automatically accept if we're already subscribed to them
        const item = ctx.store.state[Store.$states.roster].items?.find(i => i.jid === jid);
        if(item && item.subscription === "to") return client.acceptSubscription(presence.from);

        // Otherwise, if the request isn't already pending, ask the user to manually interact
        else if(!ctx.store.state[Store.$states.pending].includes(jid)) {
            ctx.store.commit(Store.$mutations.addPending, presence.from);
            try {
                new Notification(`Bonfire`, {
                    body: `Friend request from ${jid}`,
                    image: ctx.store.state[Store.$states.avatars][jid],
                    icon: ctx.store.state[Store.$states.avatars][jid],
                });
            } catch (e) {}
        }
    })

    // Somebody unsubscribed from us (but our subscription to them is the same)... Do nothing!
    // The roster:update will handle the change in roster status
    // client.on('unsubscribe', presence => {});

    // We subscribed to somebody (successfully)... Do nothing!
    // The roster:update will handle the change in roster status
    // client.on('subscribed', presence => {});

    // Our request was rejected, or we were removed.
    // Remove their access to our presence, too.
    client.on('unsubscribed', presence => {
        ctx.store.commit(Store.$mutations.removePending, presence.from);
        client.denySubscription(presence.from)
    });

    return {
        /**
         * Accepts a presence subscription request from `jid`, and sends a request back.
         * When no request is made, this will allow `jid` to subscribe to our presence, if and when they wish.
         * If `jid` was on the `pending` list, it will be removed.
         * @param jid
         */
        accept(jid) {
            ctx.store.commit(Store.$mutations.removePending, jid);
            client.acceptSubscription(jid);
            client.subscribe(jid);
        },
        /**
         * Declines a presence subscription request from `jid`, and forbids them from seeing our subscription.
         * When no request is made, this function call *should* do nothing -- effectively.
         * If `jid` was on the `pending` list, it will be removed.
         * @param jid
         */
        deny(jid) {
            ctx.store.commit(Store.$mutations.removePending, jid);
            client.denySubscription(jid);
            client.unsubscribe(jid);
        },
    }
}

export const name = 'roster';

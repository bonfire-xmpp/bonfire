import { permanent, loadFromPermanent } from "assets/storage";

import { LocalNotifications } from "@capacitor/local-notifications";
import {Capacitor} from "@capacitor/core";
import notification from "@/plugins/notification";

let swReg = null;

const kRestrictedTagsKey = 'RESTRICTED_TAGS'
const kShownRestrictedTagsKey = 'SHOWN_RESTRICTED_TAGS'

const kChannels = {
    friendRequests: {
        id: 'friendRequests',
        name: 'Friend Requests',
        description: 'Incoming friend requests',
        importance: 3,
        visibility: 0,
        lights: false,
        vibration: true,
    },
    messages: {
        id: 'messages',
        name: 'Messages',
        description: 'Messages sent to you, personally',
        importance: 5,
        visibility: 0,
        lights: true,
        vibration: true,
    },
    groupchat: {
        id: 'groupchat',
        name: 'Group Messages',
        description: 'Messages sent in group chats',
        importance: 5,
        visibility: 0,
        lights: true,
        vibration: true,
    },
};

let restrictedTags      = [];
let shownRestrictedTags = [];

function addRestrictedTag(tag) {
    restrictedTags.push(tag);
    permanent.setItem(kRestrictedTagsKey, JSON.stringify(restrictedTags));
}

function removeRestrictedTag(tag) {
    const idx = restrictedTags.indexOf(tag);
    if(idx !== -1) {
        restrictedTags.splice(idx, 1);
        permanent.setItem(kRestrictedTagsKey, JSON.stringify(restrictedTags));
    }
}

function addShownRestrictedTag(tag) {
    shownRestrictedTags.push(tag);
    permanent.setItem(kShownRestrictedTagsKey, JSON.stringify(shownRestrictedTags));
}

function removeShownRestrictedTag(tag) {
    const idx = shownRestrictedTags.indexOf(tag);
    if(idx !== -1) {
        shownRestrictedTags.splice(idx, 1);
        permanent.setItem(kShownRestrictedTagsKey, JSON.stringify(shownRestrictedTags));
    }
}

const filters = [

];

const isNative = Capacitor.isNativePlatform();

/**
 * Shows a notification immediately using Capacitor when `isNative`, or with `swReg` otherwise.
 *
 * Uses `notification.icon` and `notification.image` as `smallIcon` and `largeIcon`, respectively, when using Capacitor.
 * @param notification Notification object
 * @returns Promise<Boolean> Whether the notification showed
 */
function showNotification(notification){}
if(isNative) {
    showNotification = notification => {
        return LocalNotifications.schedule({
            notifications: [{
                schedule: {at: new Date()},
                smallIcon: notification.icon,
                largeIcon: notification.image,
                ...notification,
            }]
        });
    }
} else {
    showNotification = notification =>
        swReg.showNotification(notification.title, notification);
}


const generateFunctions = (ctx) => {
    const fs = {
        /**
         * Restricts notifications with `tag` to be only shown to the user once.
         * Restricted and shown status persists across sessions.
         * @see unrestrict()
         * @param tag
         */
        restrict(tag) {
            tag && addRestrictedTag(tag);
        },
        /**
         * Lifts single-show restriction on notifications with `tag`.
         * Restricted and shown status persists across sessions.
         * @see restrict()
         * @param tag
         */
        unrestrict(tag) {
            removeRestrictedTag(tag);
            removeShownRestrictedTag(tag);
        },

        /**
         * Displays a notification.
         * @param notification Notification
         * @returns {Promise<boolean>} Whether the notification was shown.
         */
        async show(notification) {
            const tag = notification.tag;
            if(tag && restrictedTags.includes(tag) && shownRestrictedTags.includes(tag))
                return false;

            if(!filters.every(f => f(notification)))
                return false;

            showNotification(notification)

            if(tag && restrictedTags.includes(tag)) addShownRestrictedTag(tag);

            return true;
        },

        filters,
    };

    // Wrap each function call with a permission/sw registration check
    return Object.fromEntries(
        Object.entries(fs).map(
            ([n, f]) =>
                [n, (...args) => {
                    if(Notification.permission !== "granted"
                        || swReg === null) return false;
                    return f(...args);
                }]
        )
    );
};

export default async (ctx, inject) => {
    // Browser manual notification setup: @capacitor/local-notifications doesn't support icons in browser
    if (!isNative && 'serviceWorker' in navigator) {
        try {
            swReg = await navigator.serviceWorker.register('/sw.js');
        } catch (e) {}
    }

    // Load restricted notification status
    const [r, s] = loadFromPermanent(kRestrictedTagsKey, kShownRestrictedTagsKey);
    if(r) restrictedTags      = r;
    if(s) shownRestrictedTags = s;

    // Set up notification channels (Android)
    if (isNative) {
        for (let kChannel in kChannels) {
            try { await LocalNotifications.createChannel(kChannels[kChannel]); }
            catch (e) { /* Possibly unimplemented */ }
        }
    }

    inject("notification", {
        ...generateFunctions(ctx),
        requestPermission() {
            if(isNative) return LocalNotifications.requestPermissions();
            else return Notification.requestPermission();
        }
    });
}

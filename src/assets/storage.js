export const session = window.sessionStorage;

export const permanent = window.localStorage;

export const secure = window.localStorage;

export const loadFromStorage = (storage, ...args) => args.map(key => JSON.parse(storage.getItem(key)));

export const loadFromSession = (...args) => loadFromStorage(session, ...args);
export const loadFromPermanent = (...args) => loadFromStorage(permanent, ...args);
export const loadFromSecure = (...args) => loadFromStorage(secure, ...args);

import Dexie from 'dexie';

const db = new Dexie('messagesDb');
db.version(1).stores({
    messages: `id, to, from, timestamp, with`,
    messageStates: `id`,
});

export default db;

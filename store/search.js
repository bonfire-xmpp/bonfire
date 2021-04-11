import Worker from '@/assets/workers/search.worker.js';

const worker = new Worker;

let id = 0;

const responses = {
    listeners: new Map(),
    once(eventId, f) {
        this.listeners.set(eventId, f);
    }
}

worker.onmessage = function (e) {
    const f = responses.listeners.get(e.data.id);
    f && f(e.data.result);
    responses.listeners.delete(e.data.id);
}

function registerApiCall(name) {
    return async function (...args) {
        const currentId = id++;
        worker.postMessage([currentId, name, ...args]);
        return new Promise(resolve => {
            responses.once(currentId, data => {
                console.debug(`[search worker] Resolved ${name}() (${currentId})`, data);
                resolve(data);
            });
        });
    }
}

export const searchBlock = registerApiCall('searchBlock');
export const search = registerApiCall('search');
export const populateSearchIndex = registerApiCall('populateSearchIndex');
export const insertBlock = registerApiCall('insertBlock');
export const splitBlocks = registerApiCall('splitBlocks');

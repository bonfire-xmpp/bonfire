import {App} from '@vue/runtime-core'
import {createStore, Store} from "vuex";

/* Dependency injection for Vuex store functions */
import {plugins, PluginsInterface} from "@/plugins";

declare module 'vuex' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Store<S> extends PluginsInterface {}
}

/* Import all plugins */
function requireAll(r: any) { return r.keys().map(r); }
const stores = requireAll(require.context('./store/', false, /\.[jt]s$/));

const storeFactory = (): Store<any> | undefined => {
    const rootIdx = stores.findIndex((m: any) => !m.namespace)
    if (rootIdx == -1) return;

    // Inject dependencies by binding the f at (s.f) and (s.x.f) with plugins
    const injectDeps = (s: any) => {
        const sprime: typeof s = {};

        for (const injectable in s) {
            if(!Object.prototype.hasOwnProperty.call(s, injectable)) continue;

            if(typeof s[injectable] === "function") {
                sprime[injectable] = function(...args: any[]) {
                    return s[injectable].call({...this, ...plugins}, ...args)
                };
            } else if (typeof s[injectable] === "object") {
                sprime[injectable] = {};
                for (const sub in s[injectable]) {
                    if(!Object.prototype.hasOwnProperty.call(s[injectable], sub)) continue;

                    if(typeof s[injectable][sub] === "function") {
                        sprime[injectable][sub] = function(...args: any[]) {
                            return s[injectable][sub].call({...this, ...plugins}, ...args)
                        };
                    }
                }
            }
        }

        return sprime;
    }

    const root = injectDeps(stores[rootIdx]);
    const store = createStore(root);

    stores.splice(rootIdx, 1);
    stores.forEach((s: any) => {
        store.registerModule(s.default.namespace, {namespaced: true, ...injectDeps(s)});
    })

    return store;
}

export const store = storeFactory();

export default {
    install: (app: App) => {
        if(store)
            app.use(store);
    }
}

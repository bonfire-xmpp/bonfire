import { App } from '@vue/runtime-core'

/* Import all plugins */
function requireAll(r: any) { return r.keys().map(r).map((x: any)=>x.default); }
const imports = requireAll(require.context('./plugins/', false, /.[jt]s$/));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginsInterface {}

declare module '@vue/runtime-core' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface ComponentCustomProperties extends PluginsInterface {}
}

export const plugins: {[index: string]: any} = {};

export default {
    install: (app: App) => {
        const inject = (name: string, obj: any) => {
            app.config.globalProperties[`$${name}`] = obj
            plugins[`$${name}`] = obj
        };
        for(const plugin of imports)
            plugin?.(app.config.globalProperties, inject, app);
    }
}

import {App, AppConfig} from "@vue/runtime-core";

export type Inject = (name: string, obj: any) => any;
export type Context = AppConfig['globalProperties']
export type Install = (ctx: Context, inject: Inject, app: App) => any;

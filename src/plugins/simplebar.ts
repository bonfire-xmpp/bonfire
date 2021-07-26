// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';
import {Install} from "@/@types/plugins";

export default ((ctx, inject, app) => {
    app.component('simplebar', simplebar)
}) as Install;


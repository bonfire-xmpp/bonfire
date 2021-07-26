// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import VueMasonry from 'vue-next-masonry';
import {Install} from "@/@types/plugins";

export default ((ctx, inject, app) => {
    app.use(VueMasonry);
}) as Install;

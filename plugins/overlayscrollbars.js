import "overlayscrollbars/css/OverlayScrollbars.css";
import Vue from 'vue';
import OverlayScrollbars from 'overlayscrollbars';
import { OverlayScrollbarsPlugin, OverlayScrollbarsComponent } from "overlayscrollbars-vue";

Vue.use(OverlayScrollbarsPlugin);

Vue.component('overlay-scrollbars', OverlayScrollbarsComponent);

OverlayScrollbars(document.body, {
    nativeScrollbarsOverlaid: {
        initialize: false
    }
});

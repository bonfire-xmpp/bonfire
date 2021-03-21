import "overlayscrollbars/css/OverlayScrollbars.css";
import Vue from 'vue';
import OverlayScrollbars from 'overlayscrollbars';
import { OverlayScrollbarsPlugin, OverlayScrollbarsComponent } from "overlayscrollbars-vue";

Vue.use(OverlayScrollbarsPlugin, {
    nativeScrollbarsOverlaid: {
        initialize: false
    },
    overflowBehavior: {
        x: 'hidden',
    },
    scrollbars: {
        clickScrolling: true,
    },
});

Vue.component('overlay-scrollbars', OverlayScrollbarsComponent);
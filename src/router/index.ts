import {createRouter, createWebHistory} from "@ionic/vue-router";
import {RouteRecordRaw} from "vue-router";

import {Store} from "vuex";
import { store } from "@/vuex";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import StoreRoot from "@/store";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const genRoutes = require('../macros/gen-routes.macro');

const routes: Array<RouteRecordRaw> = genRoutes();

console.log(routes);

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (from, to) => {
  const storeState = store as Store<any>;

  if(from.path === "/login") {
    return;
  }

  // If not logged in, maybe we have a session/credentials stored; use those to log in.
  if(!storeState.getters[StoreRoot.$getters.loggedIn]) {
    await storeState.dispatch(StoreRoot.$actions.tryRestoreSession);

    // Are we still not logged in?
    if(!storeState.getters[StoreRoot.$getters.loggedIn])
      return '/login';
  }
});

export default router;

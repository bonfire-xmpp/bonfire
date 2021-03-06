import { Store } from '@/store';

export default async function({ store, redirect, route }) {
    // Let /login's anonymous middleware handle this
    if(route.path === "/login") {
        return;
    }

    // If not logged in, maybe we have a session/credentials stored; use those to log in.
    if(!store.getters[Store.$getters.loggedIn]) {
        await store.dispatch(Store.$actions.tryRestoreSession);

        // Are we still not logged in?
        if(!store.getters[Store.$getters.loggedIn])
            return redirect('/login');
    }
}

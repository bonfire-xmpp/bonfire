import * as XMPP from 'stanza';

const client = XMPP.createClient(undefined);

const generateFunctions = (ctx) => ({

});

const setupListeners = async ctx => {}

export default (ctx, inject) => {
    inject("stanza", {
        client,
        ...generateFunctions(ctx),
    });
}

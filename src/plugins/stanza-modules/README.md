# Stanza Nuxt Module Sub-Plugins
Sure, roster management, message handling, Jingle sessions, file uploads...
all belong to the `stanza` Nuxt plugin, but that doesn't necessarily mean having
one loooong `stanza.js` file.

To decouple and modularise each feature, you can write a `.js` file here, and it will
get loaded in the main file, so long as you add it to `index.js`.

## Features
Your module should be export, at least, a function named `install`. It takes a
single parameter, an object with the `ctx` and `client` objects; as well as a
constant string named `name`.

`install` should return, if anything, an object. This will get added to the main
exported object under field `name`, e.g. `this.$stanza.roster.accept(jid)`.

Your module may also export a function named `bind`, taking the same parameters as 
`install`. This will be called in the `bind()` callback in the main file, i.e. when
logged in/stream resumed.

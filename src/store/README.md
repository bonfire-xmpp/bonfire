# Vuex store usage
By default, states, getters, setters and actions are 
uniquely identified by their given string ID.

However, this approach to accessing properties is a problem for 
several reasons:
1) It completely kills out any opportunity for IDEs to autocomplete 
   store names
2) It involves rewriting the same string(s) over and over in 
   different places in the codebase, leading to difficult refactors,
   etc.
   
To this end, stores -- apart from their usual exports -- also export
an object with subobjects `$states`, `$getters`, `$setters` and 
`$actions` which map meaningful property names to the corresponding 
store property string identifier.

To ensure that the correct string is indeed used in the store, we
can use computed properties that reference the corresponding entry in
one of the `$objects`.

For example:
```js
const $states = {
    users     : 'USERS',
    messages  : 'MESSAGES',
};

export const state = () => ({
    [$states.users]: [ me ],
    [$states.messages]: [ 'Hello!' ],
});

export const UserMessageStore = {
    $states
};
```

Read more [here](https://vuex.vuejs.org/guide/mutations.html#using-constants-for-mutation-types)

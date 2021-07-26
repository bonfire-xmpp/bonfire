// @preval

/* Traverse @/views/ and build a router config */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');


// NOTE: Since we're traversing using Node's fs, we have to use relative dir paths,
//       because we don't have access to babel/webpack '@/views' syntax/
const base = __dirname + '/../views';

const root = fs.readdirSync(base, {withFileTypes: true});

const parseControlFlags = f => {
    let nestedRoute = true,
        params = false,
        lazy = true;

    // File name without the control prefixes
    let filename = f;
    if(filename.startsWith('@')) {
        nestedRoute = false;
        filename = filename.slice(1);
    } if(filename.startsWith("_")) {
        params = true;
        filename = filename.slice(1);
    } if(filename.startsWith(".")) {
        lazy = false;
        filename = filename.slice(1);
    }

    return {filename, nestedRoute, params, lazy};
}

/**
 * Recursively parse out a router config based on parameter `dir`
 * @param {Dirent[]} dir Array of Dirents which is the starting point for the traversal
 * @param {string} stack The current route path stack
 * @param {string} filenameStack The current filepath stack (i.e. same as #stack, but with filename prefixes)
 * @param {boolean} nestedDirectory Whether or not the directory being parsed is nested
 * @return {*[]}
 */
const handleEnts = (dir, stack = '/', filenameStack = '/', nestedDirectory = false) => {
    let routes = [];

    const currentDirIndexExists = dir.some(ent => !ent.isDirectory() && ent.name.endsWith("index.vue"));
    const currentDirContainsNestedFiles = dir.some(ent => !ent.isDirectory() && !ent.name.startsWith("@"));
    if(nestedDirectory && currentDirContainsNestedFiles && !currentDirIndexExists) {
        throw new Error(`Directory '@/views${filenameStack}' marked as nested path (with nested files), but contains no 'index.vue'!`)
    }

    // Properly parse out the host component's strictness
    const indexFilename = currentDirIndexExists && dir.find(e => !e.isDirectory() && e.name.endsWith("index.vue")).name;
    const index = currentDirIndexExists && parseControlFlags(indexFilename);
    // This directory's route -- used for nesting children (iff `nestedDirectory` is true)
    const currentDirNested = {
        path: '',
        ['component' + (index.lazy ? 'Lazy' : 'Strict')]: '@/views' + filenameStack + indexFilename,
        children: [],
    };
    // Children that will be propagated up (iff `nestedDirectory` is false)
    let propagateChildren = [];

    // Iterate through this directory's entries
    for (const ent of dir) {
        // File name without the control prefixes
        const {filename, nestedRoute, params, lazy} = parseControlFlags(ent.name)

        // TODO: support aliases?
        if(!ent.isDirectory() && ent.name.endsWith(".vue")) {
            // The webpack import path
            const importPath = '@/views' + filenameStack + ent.name;

            // The route is either the filename without extension and prefixes,
            // or, in the case of index.vue, the current route path stack (e.g. '/')
            let route = '';
            if(!filename.endsWith("index.vue")) {
                route = filename.match(/(.+)\.vue/)?.[1];
                // The file is just called '.vue'
                if(route === undefined) {
                    // If this is a nested directory, this will be the component for the parent 'stub' route
                    if(nestedDirectory) {
                        currentDirNested.children.push({
                            path: '',
                            // TODO: allow both lazy and strict '.vue' files
                            componentLazy: importPath
                        })
                    }

                    continue;
                }
            } else if(nestedDirectory) {
                // The index.vue will be used as a layout, not as its own route: skip it
                // NOTE: Vue Router will almost always generate the stub route pointing at index.vue.
                continue;
            }

            // Whether to lazy- or eager-load the component.
            // Converted by gen-routes.macro into strict `require()` or lazy `() => import()`
            const componentKey = lazy ? 'componentLazy' : 'componentStrict';

            // If this should be a nested route...
            if(nestedRoute) {
                const entry = {
                    path: (params ? ':' : '') + route,
                    [componentKey]: importPath
                };

                // Is this folder @non-nested?
                if(!nestedDirectory) {
                    // If yes, propagate this upwards (through return)
                    propagateChildren.push(entry)
                } else {
                    // If not, add it to its children
                    currentDirNested.children.push(entry)
                }
            }

            // This isn't a nested route: push it to the global list of routes
            else {
                routes.push({
                    path: stack + (params ? ':' : '') + route,
                    [componentKey]: importPath
                })
            }
        }

        else if(ent.name.endsWith(".redirect")) {
            // The route is either the filename without extension and prefixes,
            // or, in the case of index.redirect, the current route path stack (e.g. '/')
            let route = '';
            if(!filename.endsWith("index.redirect")) {
                route = filename.match(/(.+)\.redirect/)?.[1];
                // The file is just called '.vue'
                if(route === undefined)
                    continue;
            }

            const redirectTo = fs.readFileSync(base + filenameStack + ent.name, {encoding: "utf8"}).split(/\r?\n/)?.[0];

            const entry = {
                path: (params ? ':' : '') + route,
                redirect: redirectTo
            };

            // If this should be a nested route...
            if(nestedRoute) {
                // Is this folder @non-nested?
                if(!nestedDirectory) {
                    // If yes, propagate this upwards (through return)
                    propagateChildren.push(entry)
                } else {
                    // If not, add it to its children
                    currentDirNested.children.push(entry)
                }
            }

            // This isn't a nested route: push it to the global list of routes
            else {
                routes.push({
                    path: stack + (params ? ':' : '') + route,
                    redirect: redirectTo
                })
            }
        }

        else if(ent.isDirectory()) {
            const subdir = fs.readdirSync(base + filenameStack + ent.name, {withFileTypes: true});
            const {routes: subroutes, propagateChildren: subchildren}
                = handleEnts(subdir, stack + (params ? ':' : '') + filename + '/', filenameStack + ent.name + '/', nestedRoute);

            console.log(subroutes, subchildren);

            // Append subroutes to our global list of routes
            routes = routes.concat(subroutes);

            // Are there any propagated would-be-nested children?
            if(subchildren.length) {
                // Are we at the top of the call stack?
                if (stack === '/') {
                    console.warn(
                        `\n${chalk.bgBlue.black(' INFO ')}: The following routes were marked as nested, `
                        + `but all intermediate directories were marked non-nested, `
                        + `so they will be added to ${chalk.bold("'/'")} (which has${currentDirIndexExists ? '' : "n't"} got an 'index.vue'): `
                        + subchildren.reduce(( acc, c) => acc + `'${chalk.bold(c.path)}', `, '').slice(0,-2))

                    // We're at root, do we have an `index.vue` to nest the children in?
                    if(nestedDirectory && currentDirIndexExists) {
                        currentDirNested.children = currentDirNested.children.concat(subchildren);
                    }

                    // We don't have where to nest: add as regular routes
                    else {
                        routes = routes.concat(subchildren);
                    }
                }

                // We're not at root yet: try adding here if we're nested, otherwise just pass it upwards
                else {
                    if(nestedDirectory) {
                        currentDirNested.children = currentDirNested.children.concat(subchildren);
                    } else {
                        propagateChildren = propagateChildren.concat(subchildren)
                    }
                }
            }
        }
    }

    // Helpful diagnostic when you forget an @ or index.vue, and propagated children want to use it
    if(!currentDirIndexExists && currentDirNested.children.length) {
        throw new Error(`Directory '@/views${filenameStack}' marked as nested has no 'index.vue', `
            + `but is used by: `
            + currentDirNested.children.reduce(( acc, c) => acc + `'${chalk.bold(c.path)}', `, '').slice(0,-2));
    }

    if(nestedDirectory && currentDirNested.children.length) {
        // We're at root, merge nested children into global routes
        if(stack === '/') {
            routes = routes.concat(currentDirNested.children.map(x=>((x.path='/'+x.path) && x)));
        }

        // We're not at root, propagate the nested tree upwards
        else propagateChildren.push(currentDirNested);
    }

    const retval = {
        routes,

        // Prepend the last /segment/ of the stack
        propagateChildren: propagateChildren.map(c => ((c.path = (stack.match(/.*(\/.*?)\/$/)?.[1] || '/') + c.path) && c))
    };

    if(stack === '/') {
        return routes.concat(retval.propagateChildren)
    }

    return retval;
}

/**
 * Importing this file will, in effect, import an array of router records
 * NOTE: the `component` field in each object will be the _string webpack path_ to the component SFC
 */
module.exports = handleEnts(root);

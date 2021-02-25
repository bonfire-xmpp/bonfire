# bonfire

A modern XMPP client

## Building

The client itself is a web app written in Nuxt.js (a Vue framework).

You can get a local development server with hot reloading running with
`npm run dev`.

If you want to build the static files to `/dist`, do `npm run generate`.

### Standalones

To build standalones for native platforms, we use Capacitor. 

You'll need to have ran `npm run generate`.

Currently only Electron (desktop) is supported, but mobile platforms
are coming up soon ahead. 

To build for Electron:
```shell
cd electron && npm ci && cd .. # Install electron build dependencies
npx cap sync @capacitor-community/electron
npm run build:electron # or electron-windows for specific OS
# Your build is now in electron/dist/
```

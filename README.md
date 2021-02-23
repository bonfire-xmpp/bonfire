# bonfire

A modern XMPP client

## Building

The client itself is a web app written in Nuxt.js (a Vue framework).

You can get a local development server with hot reloading running with
`npm run dev`.

If you want to build the static files, do `npm run generate`.

### Standalones

To build standalones for native platforms, we use Capacitor. 

You'll need to have ran `npm run generate`.

Currently only Electron (desktop) is supported, but mobile platforms
are coming up soon ahead. 

To build for Electron:
```shell
npx cap copy @capacitor-community/electron
cd electron
npm run build:electron-windows # or whatever your platform is
```

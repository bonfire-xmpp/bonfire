// import colors from 'vuetify/es5/util/colors'
import colors from './assets/colors.js';
import { black } from "./assets/colors.js";

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - bonfire',
    title: 'bonfire',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: black.darken },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
    ]
  },

  router: {
    middleware: ['loginRedirect'],
    base: process.env.NUXT_BASE || '/',
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
      '@/assets/reset.scss',
      '@/assets/utilities.scss',
  ],

  styleResources: {
    scss: [
        '@/assets/_sizes.scss',
        '@/assets/_mixins.scss',
    ]
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
      '@/plugins/stanza.js',
      '@/plugins/longpress.js',
      '@/plugins/vuebottomsheet.js',
      '@/plugins/simplebar.js',
      '@/plugins/masonry.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/style-resources',
    '@nuxtjs/device',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: [
        '~/assets/_baseColors.scss',
        '~/assets/_sizes.scss',
        '~/assets/fonts.scss',
    ],
    // Custom variables don't work without this enabled (which is true only for production builds)
    treeShake: true,
    icons: {
      iconfont: "mdiSvg"
    },
    theme: {
      dark: true,
      themes: {
        dark: colors
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const themeColors = require("./colors.js");

module.exports = {
    purge: {
    enabled: process.env.NODE_ENV !== "development",
        content: [
            './src/**/*.html',
            './src/**/*.vue',
            './src/**/*.jsx',
        ],
    },
    theme: {
        colors: {
            ...themeColors
        }
    },
    variants: {
        extend: {
            borderRadius: ['hover', 'focus'],
        }
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}

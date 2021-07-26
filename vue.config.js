// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'scss',
            patterns: [
                path.resolve(__dirname, './src/assets/_mixins.scss'),
                path.resolve(__dirname, './src/assets/_sizes.scss'),
                path.resolve(__dirname, './src/assets/_baseColors.scss'),
            ]
        }
    }
}

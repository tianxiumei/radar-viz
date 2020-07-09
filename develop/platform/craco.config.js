const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = {
  webpack: {
    configure: webpackConfig => {
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: ['source-map-loader']
      })
      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({ template: 'public/index.html' })
      )
      webpackConfig.plugins.push(
        new AddAssetHtmlPlugin([
          {
            filepath: require.resolve(
              './node_modules/@qn-pandora/app-platform/lib/index.css'
            ),
            typeOfAsset: 'css'
          },
          {
            filepath: require.resolve(
              './node_modules/@qn-pandora/app-platform/lib/index.js'
            )
          }
        ])
      )
      return webpackConfig
    }
  }
}

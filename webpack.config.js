const { GenerateSW } = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./index.ts",
  plugins: [
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/\.DS*/, /^.*ico$/, /^.*svg$/, /^.*jpg$/, /^.*png$/, 'CNAME'],
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets", to: "" }
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/i,
        loader: "ts-loader"
      }]
  },
  resolve: { extensions: [".ts", ".js"] },
};
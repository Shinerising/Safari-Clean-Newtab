module.exports = {
  entry: "./index.ts",
  plugins: [],
  module: {
    rules: [
      {
        test: /\.ts$/i,
        loader: "ts-loader"
      }]
  },
  resolve: { extensions: [".ts", ".js"] },
};
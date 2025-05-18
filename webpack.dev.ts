import { merge } from "webpack-merge";
import { commonConfig } from "./webpack.common";
import webpack, { type Configuration } from "webpack";
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devConfig: Configuration = {
  mode: "development",
  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack_cache"),
  },
  output: {
    filename: "[name].[contenthash].js",
    path: new URL("./dist/client", import.meta.url).pathname,
    clean: true,
    publicPath: "/",
    hotUpdateChunkFilename: "[id].[fullhash].hot-update.js",
    hotUpdateMainFilename: "[runtime].[fullhash].hot-update.json",
  },
  devtool: "inline-source-map",
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

export default merge(commonConfig, devConfig);

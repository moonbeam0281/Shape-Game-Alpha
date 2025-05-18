import { merge } from "webpack-merge";
import { commonConfig } from "./webpack.common";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import type { Configuration } from "webpack";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const prodConfig: Configuration = {
  mode: "production",
  output: {
    filename: "[name].[contenthash].js",
    path: new URL("./dist/client", import.meta.url).pathname,
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: {
      chunks: "all",
    },
  },
  devtool: "nosources-source-map",
  plugins: [new CleanWebpackPlugin()],
};

export default merge(commonConfig, prodConfig);

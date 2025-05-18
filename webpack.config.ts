const env = process.env.NODE_ENV || "development";

const config = await (env === "production"
  ? import("./webpack.prod").then((mod) => mod.default)
  : import("./webpack.dev").then((mod) => mod.default));

export default config;

import express, { Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use((req, _res, next) => {
  if (routeMap[req.path]) {
    req.url = routeMap[req.path];
  }
  next();
});

let routeMap: Record<string, string> = {};

if (process.env.NODE_ENV !== "production") {
  const { default: webpack } = await import("webpack");
  const { default: webpackConfig } = await import("../../webpack.config");
  const { default: createDevMiddleware } = await import(
    "webpack-dev-middleware"
  );
  const { default: createHotMiddleware } = await import(
    "webpack-hot-middleware"
  );
  const webpackCompiler = webpack(webpackConfig);

  webpackCompiler.hooks.afterCompile.tap("MapRoutes", (compilation) => {
    const routerConfigAsset = compilation.assets["router.json"];
    if (!routerConfigAsset) return;

    const routerConfig: Record<string, string> = JSON.parse(
      routerConfigAsset.source().toString()
    );

    routeMap = routerConfig;
  });

  const hotMiddleware = createHotMiddleware(webpackCompiler, {
    path: "/__webpack_hmr",
    heartbeat: 2000,
  });

  const devMiddleware = createDevMiddleware(webpackCompiler, {
    publicPath: "/",
  });

  router.use(devMiddleware);
  router.use(hotMiddleware);
} else {
  const staticPath = path.resolve(__dirname, "../../client");

  routeMap = JSON.parse(
    readFileSync(path.resolve(staticPath, "router.json"), "utf8")
  );

  router.use(express.static(staticPath));
}

export default router;

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { globSync } from "glob";
import * as cheerio from "cheerio";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin, { Source } from "mini-css-extract-plugin";
import webpack, {
  type Configuration,
  type Entry,
  type Compiler,
  type Compilation,
} from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";

const isProd = process.env.NODE_ENV === "production";

class GlobalExportsPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap("GlobalExportsPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "GlobalExportsPlugin",
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          for (const assetName in assets) {
            if (!assetName.endsWith(".js")) continue;

            const originalSource = compilation
              .getAsset(assetName)
              ?.source.source();
            if (typeof originalSource !== "string") continue;

            const wrappedSource = `Object.values( new (function() { return ${originalSource} })()).map((item) => Object.assign(globalThis, item))`;

            compilation.updateAsset(
              assetName,
              new compiler.webpack.sources.RawSource(wrappedSource)
            );
          }
        }
      );
    });
  }
}

interface RemoveSelectorsPluginOptions {
  htmlFile: string;
  selectors: string[];
}

class RemoveSelectorsPlugin {
  private htmlFile: string;
  private selectors: string[];

  constructor(options: RemoveSelectorsPluginOptions) {
    this.htmlFile = options.htmlFile;
    this.selectors = options.selectors;
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync(
      "RemoveSelectorsPlugin",
      (compilation: Compilation, callback: () => void) => {
        const asset = compilation.assets[this.htmlFile];

        if (!asset) {
          console.warn(
            `[RemoveSelectorsPlugin] Warning: Asset ${this.htmlFile} not found.`
          );
          callback();
          return;
        }

        const originalSource = asset.source().toString();
        const $ = cheerio.load(originalSource);

        for (const selector of this.selectors) {
          $(selector).remove();
        }

        const cleanedHtml = $.html();

        compilation.assets[this.htmlFile] = {
          source: () => cleanedHtml,
          size: () => Buffer.byteLength(cleanedHtml, "utf8"),
        } as Source;

        callback();
      }
    );
  }
}

const entry: Entry = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname);

const htmlFiles = globSync("client/**/index.html", { cwd: baseDir });

const plugins: Configuration["plugins"] = [];
plugins.push(
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(baseDir, "client/static"),
        to: path.resolve(baseDir, "dist/client/static"),
        noErrorOnMissing: true,
      },
    ],
  })
);
plugins.push(new GlobalExportsPlugin());
plugins.push(
  new WebpackManifestPlugin({
    fileName: "router.json",
    basePath: "",
    publicPath: "/",
    filter(item) {
      return item.name.endsWith(".html");
    },
    generate(_seed, files) {
      const manifest: Record<string, string> = {};

      files.forEach((file) => {
        if (!file.name.endsWith(".html")) return;

        let key = "/" + file.name;

        key = key.replaceAll(".html", "").replaceAll("s__", "/");

        if (key === "/index") {
          key = "/";
        }

        manifest[key] = file.path;
      });

      return manifest;
    },
  })
);

for (const htmlRelPath of htmlFiles) {
  const fullHtmlPath = path.join(baseDir, htmlRelPath);
  const htmlDir = path.dirname(htmlRelPath);
  const htmlContent = fs.readFileSync(fullHtmlPath, "utf-8");
  const $ = cheerio.load(htmlContent);

  const sources: string[] = [];

  let selectors: string[] = [];

  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      !href.startsWith("//") &&
      !href.startsWith("http:") &&
      !href.startsWith("https:")
    ) {
      selectors.push(`link[rel="stylesheet"][href$="${href}"]`);

      const fullCssPath = path.resolve(baseDir, htmlDir, href);
      if (fs.existsSync(fullCssPath)) {
        const relativeCssPath = path.relative(baseDir, fullCssPath);
        sources.push(`./${relativeCssPath.replace(/\\/g, "/")}`);
      }
    }
  });

  $('script[src$=".ts"], script[src$=".js"]').each((_, el) => {
    const src = $(el).attr("src");
    if (
      src &&
      !src.startsWith("//") &&
      !src.startsWith("http:") &&
      !src.startsWith("https:")
    ) {
      if (src.startsWith("//")) return;

      selectors.push(`script[src$="${src}"]`);
      const fullScriptPath = path.resolve(baseDir, htmlDir, src);
      if (fs.existsSync(fullScriptPath)) {
        const relativeScriptPath = path.relative(baseDir, fullScriptPath);
        sources.push(`./${relativeScriptPath.replace(/\\/g, "/")}`);
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    sources.unshift(
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000"
    );
  } else {
    sources.unshift("./client/common/empty.ts");
  }

  const name =
    htmlDir.slice("client".length + 1).replaceAll("/", "s__") || "index";
  entry[name] = {
    import: sources,
    library: {
      type: "this",
      name: name,
    },
  };

  plugins.push(
    new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: htmlRelPath,
      chunks: [name],
      inject: "head",
      ...(isProd
        ? {
            minify: {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
              minifyCSS: true,
              minifyJS: true,
            },
          }
        : {}),
    })
  );

  if (selectors.length > 0) {
    plugins.push(
      new RemoveSelectorsPlugin({
        htmlFile: `${name}.html`,
        selectors: selectors,
      })
    );
  }
}
export const commonConfig: Configuration = {
  context: baseDir,
  entry,
  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  output: {
    publicPath: "/",
  },
  plugins: [
    ...plugins,
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ],
};

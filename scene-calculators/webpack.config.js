const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const rmrf = require("rimraf").sync;
const TerserPlugin = require("terser-webpack-plugin");

const { peerDependencies } = require("./package.json");

const externals = Object.keys(peerDependencies || {}).reduce((a, b) => {
  return {
    ...a,
    [b]: b,
  };
}, {});

rmrf(path.join(__dirname, "dist"));

const createConfig = (esm) => ({
  mode: process.env.DEVMODE ? "development" : "production",
  plugins: [new ForkTsCheckerWebpackPlugin()],
  experiments: {
    outputModule: true,
  },
  entry: {
    main: path.resolve(__dirname, "./src/index.ts"),
  },
  resolve: {
    extensions: [".ts", ".js", ".json", ".tsx", ".ts"],
  },
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "./dist"),
    filename: esm ? "index.esm.js" : "index.cjs.js",
    library: {
      type: esm ? "module" : "commonjs2",
    },
  },
  externals,
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: {
          compress: true,
          mangle: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        type: "asset/source",
      },
      {
        test: /\ttf|otf|woff|eot|svg|png|webp|jpg|jpeg|jfif|pjpeg|pjp|gif|apnp$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][name][ext][query]",
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "swc-loader",
            options: {
              minify: true,
              jsc: {
                externalHelpers: false,
                target: "es2015",
                loose: false,
                keepClassNames: false,
                transform: {
                  react: {
                    refresh: process.env.DEVMODE ? true : false,
                  },
                },
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        issuer: { and: [/\.(js|ts|md)x?$/] },
        oneOf: [
          {
            use: [
              {
                loader: "@svgr/webpack",
                // https://react-svgr.com/docs/webpack/#passing-options
                options: {
                  svgo: true,
                  // @link https://github.com/svg/svgo#configuration
                  svgoConfig: {
                    multipass: false,
                    datauri: "base64",
                    js2svg: {
                      indent: 2,
                      pretty: false,
                    },
                  },
                },
              },
            ],
            type: "javascript/auto",
          },
        ],
      },
    ],
  },
});

module.exports = [createConfig(true)];

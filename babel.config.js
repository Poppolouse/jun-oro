/**
 * Babel Configuration for Jest Testing
 * React ve JSX transform için gerekli ayarlar
 */

export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  plugins: ["@babel/plugin-transform-runtime"],
  env: {
    test: {
      plugins: ["@babel/plugin-transform-runtime"],
    },
  },
};

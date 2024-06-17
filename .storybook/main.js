import { dirname, join } from "path";
module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],

  "addons": [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials")
  ],

  "framework": {
    name: getAbsolutePath("@storybook/web-components-webpack5")
  },
}

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
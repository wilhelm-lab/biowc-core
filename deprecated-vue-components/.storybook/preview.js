import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'; // all the css for components
import config from '../src/plugins/vuetify'; // basic config with theme

// configure Vue to use Vuetify
Vue.use(Vuetify)

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export default new Vuetify(config);

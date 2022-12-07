# How to use a component in a Vue.js project

In your `<MyComponent>.vue` file, add this import statement (note the curly brackets!):

```
import { BiowcScatter } from 'biowc-scatter'

if (window.customElements.get('biowc-scatter') === undefined) {
  window.customElements.define('biowc-scatter', BiowcScatter)
}
```

You don't need to add `BiowcScatter` to the components section.

In the template section (note the `.prop` suffix after each attribute!):

```
<biowc-scatter
  :identifier1.prop="identifier1"
  :identifier2.prop="identifier2"
  :expressions1.prop="expressionData1"
  :expressions2.prop="expressionData2"
/>
```

# How this repo was initialized

- Initialize [lerna](https://lerna.js.org/) for managing the monorepo
  ```bash
  npx lerna@latest init
  ```
- Add a first web component called `biowc-scatter` using [open-wc](https://open-wc.org/)
  ```bash
  cd packages
  npm init @open-wc
  # What would you like to do today? › Scaffold a new project
  # What would you like to scaffold? › Web Component
  # What would you like to add? › Linting (eslint & prettier), Testing (web-test-runner), Demoing (storybook)
  # Would you like to use typescript? › No
  # What is the tag name of your web component? … biowc-scatter
  # Do you want to write this file structure to disk? › Yes
  # Do you want to install dependencies? › Yes, with npm
  cd biowc-scatter
  npm install d3
  ```
- Start the web server to test if everything works
  ```bash
  cd ../../
  npx lerna run start
  ```
- Copied methods from `ScatterPlot.vue` below the `render` method
  - Remove commas between methods
  - Change some function definitions from `getExpressionInCommonSamples: function ()` to `getExpressionInCommonSamples()`
- Copied props into `static get properties()`
- Copied css into `static get styles()`
- Copied template into `render()`
- Added import of d3:
  ```
  import * as d3 from "d3";
  ```
- Added initialization and passing of properties to `demo/index.html`:
  ```
  const expressions1 = [{'Sample name': 'sample1', 'Z-score': 1}, 
                        {'Sample name': 'sample2', 'Z-score': 2}, 
                        {'Sample name': 'sample3', 'Z-score': 3}];
  const expressions2 = [{'Sample name': 'sample1', 'Z-score': 1}, 
                        {'Sample name': 'sample2', 'Z-score': 2}, 
                        {'Sample name': 'sample3', 'Z-score': 3}];

  <biowc-scatter .title=${title}
          .expressions1=${expressions1}
          .expressions2=${expressions2}>
  ```
- Specify the `firstUpdated()` method of the Lit element to start the drawing
  ```
  firstUpdated() {
    this.updateScatterPlot()
  }
  ```
- Replace `d3.select('#scatterplot')` by method `this.getMainDiv()`
  ```
  getMainDiv() {
    return d3.select(this.shadowRoot).select('#scatterplot')
  }
  ```
- Removed `constructor()` method
- Create a file `index.js` with the following content:
  ```
  export { BiowcScatter } from './BiowcScatter.js';
  ```

# Bio web components (Biowc)

This monorepo contains several plotting components that can easily be integrated
in your web tools. This can either be done directly in the HTML, or through a
JavaScript such as Vue.js.

## How to use

### Vue.js

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

## How this repo was initialized

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
- Copy methods from `ScatterPlot.vue` below the `render` method
  - Remove commas between methods
  - Change some function definitions from `getExpressionInCommonSamples: function ()` to `getExpressionInCommonSamples()`
- Copy props into `static get properties()`
- Copy css into `static get styles()`
- Copy template into `render()`
- Add import of d3:
  ```
  import * as d3 from "d3";
  ```
- Add initialization and passing of properties in `demo/index.html`:
  ```
  const identifier1 = 'Gene_X'
  const expressions1 = [{'Sample name': 'sample1', 'Z-score': 1}, 
                        {'Sample name': 'sample2', 'Z-score': 3}, 
                        {'Sample name': 'sample3', 'Z-score': 3}];
  const identifier2 = 'Gene_Y'
  const expressions2 = [{'Sample name': 'sample1', 'Z-score': 1}, 
                        {'Sample name': 'sample2', 'Z-score': 2}, 
                        {'Sample name': 'sample3', 'Z-score': 3}];

  render(
      html`
        <biowc-scatter
            .identifier1=${identifier1}
            .identifier2=${identifier2}
            .expressions1=${expressions1}
            .expressions2=${expressions2}>
          some light-dom
        </biowc-scatter>
      `,
      document.querySelector('#demo')
    );
  ```
- Remove `constructor()` method
- Specify the `updated()` method of the Lit element to start the drawing
  ```
  updated() {
    this.updateScatterPlot()
  }
  ```
- Replace `d3.select('#scatterplot')` by method `this.getMainDiv()`
  ```
  getMainDiv() {
    return d3.select(this.shadowRoot).select('#scatterplot')
  }
  ```
- Create a file `index.js` with the following content to allow importing `BiowcScatter` in other packages
  ```
  export { BiowcScatter } from './BiowcScatter.js';
  ```

## Other tips

- Emitting messages to the parent component can be done as follows:
  ```
  private _dispatchSelectEvent() {
    const selectEvent: ScatterSelectEvent = new CustomEvent(
      'biowc-scatter-select',
      {
        detail: {
          selectedPoints: this.selectedPoints,
        },
      }
    );

    this.dispatchEvent(selectEvent);
  }
  ```

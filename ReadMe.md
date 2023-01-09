# Bio web components (Biowc)

This monorepo contains several plotting components that can easily be integrated in your web tools. This can either be
done directly in the HTML, or through a JavaScript such as Vue.js.

## How to add components

### On Github

Please start by adding an *Issue* where you describe what kind of plot you'll implement. Make sure that this issue does
not exist yet. Then, create a *Branch* from the issue and check it out to your local machine.

### On your local machine

From within the `packages` directory run:

```
npm init @open-wc
✔ What would you like to do today? › Scaffold a new project                                                                                                                                                                                                                               
✔ What would you like to scaffold? › Web Component                                                                                                                                                                                                                                        
✔ What would you like to add? › Linting (eslint & prettier), Testing (web-test-runner), Demoing (storybook)                                                                                                                                                                               
✔ Would you like to use typescript? › Yes      
✔ What is the tag name of your web component? … biowc-xyz
✔ Do you want to write this file structure to disk? › Yes                                                                                    
✔ Do you want to install dependencies? › Yes, with npm      
```

Enter the directory and edit the `packages.json` file:

- **Add** the following line to the `"scripts"` section:  
  `"precommit": "lint-staged && npm test"`
- **Modify** the `"test"` script inside the `"scripts"` section:  
  `"test": "tsc && wtr --coverage --node-resolve --playwright --browsers chromium firefox webkit"`
- **Remove** the `"husky"` section (we do use husky, but we control it at the repository root):
  ```
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  ```

Install `d3.js`, the package we use to create visualizations:  
```npm i d3@6.2.0```

Install `playwright`for development. Playwright will simulate your tests in different browsers to make sure your component runs on all of them:  
```npm i -D playwright @playwright/test```

Commit your initialized package using `git commit -m "Initial commit"`.

Happy hacking :-)

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

In the template section (note the `.prop` suffix after each calculated attribute and the camel case for regular
attributes!):

```
<biowc-scatter
  idKey="Sample name"
  valueKey="Z-score"
  :x-label.prop="identifier1"
  :y-label.prop="identifier2"
  :x-values.prop="expressionData1"
  :y-values.prop="expressionData2"
/>
```

## How to publish

Make sure you have an account on npmjs.com and are listed as a maintainer for the biowc packages, then run:

```
npm login
npx lerna publish [major|minor|patch]
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

## How to port Vue.js components to Web Components

https://github.com/wilhelm-lab/biowc-core/wiki/Porting-Vue.js-component-to-Web-Components

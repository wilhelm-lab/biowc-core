# Bio web components (Biowc)

This monorepo contains several plotting components that can easily be integrated in your web tools. This can either be
done directly in the HTML, or through a JavaScript framework such as Vue, React, or Angular.

## How to get started

Clone the repository and `cd` into it. Then run:   
```npm i```  
This will install the dependencies for the monorepo as well as for all subpackages specified in `package.json`. So whenever you add a new package, you'll need to add its location to this file (see below).  
Next, run:  
```npm run storybook```  
This will first build all existing components (using `lerna run build`) and then start the 'Storybook' where their features are demonstrated.  
If you get an error message at this time, it is probably related to your `node` version. Try this to solve it: https://github.com/wilhelm-lab/biowc-core/wiki/Storybook#troubleshooting.

## How to view the deprecated Vue components
They are in the same monorepo, but are managed independently. Therefore you need to install dependencies separately. Run:
```
cd deprecated-vue-components
npm i
```
Then you can run
```
npm run storybook  
```
from there to check out demos of the deprecated components. 

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
✔ What would you like to add? › Linting (eslint & prettier), Testing (web-test-runner)                                                                                                                                                                            
✔ Would you like to use typescript? › Yes      
✔ What is the tag name of your web component? … biowc-xyz
✔ Do you want to write this file structure to disk? › Yes                                                                                    
✔ Do you want to install dependencies? › Yes, with npm      
```

Do **not** check `Demoing (storybook)` when asked `What would you like to add?`. Storybook is already managed on the root level of the monorepo, you don't need to set it up individually.

When the initial setup is done, first open the root `package.json` file (the one directly in `biowc-core`, *not* the one in the package you just created!) and extend the `"dependencies"` by the path to your package. For example, if your new package is called `biowc-mycomponent`, add the following line: 
```
"biowc-mycomponent": "file:packages/biowc-mycomponent",
```
As mentioned above, this will allow the monorepo manager `lerna` to install all dependencies at once when the repository is cloned again. 

Next, enter the directory of the component and edit the `packages.json` file there:

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

Install `playwright`for development.
Playwright will simulate your tests in different browsers to make sure your component runs on all of them
(https://playwright.dev/):  
```npm i -D playwright @playwright/test```

Delete the file `.editorconfig`. There is an identical file at the monorepo root which controls this.

Replace the contents of the file `tsconfig.json` by the following: 
```
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "./"
  },
  "include": [
    "**/*.ts"
  ]
}

```


That's it! Commit your initialized package using `git commit -m "Initial commit"`.

Happy hacking :-)  
Here are some tutorials to get you started:  
- Javascript: https://learnxinyminutes.com/docs/javascript/
- Typescript: https://learnxinyminutes.com/docs/typescript/ (focuses only on the specialties of TS, so read the JS tutorial first!) 
- Web Components & Lit: https://open-wc.org/guides/developing-components/codelabs/
- D3.js: https://www.tutorialsteacher.com/d3js
- Testing Web Components: https://open-wc.org/docs/testing/testing-package/
- Storybook: https://storybook.js.org/docs/web-components/get-started/introduction

However, we recommend that as soon as you have a vague idea of the concepts, you start playing around with the example biowc-scatter component. That should get you up to speed quickly. 

## How to use web components
See here:  
https://www.webcomponents.org/introduction  
https://github.com/WICG/webcomponents#web-components  
Vue.js: https://vuejs.org/guide/extras/web-components.html#using-custom-elements-in-vue  
React: https://reactjs.org/docs/web-components.html  
Angular: https://angular.io/guide/elements  

## How to publish

Make sure you have an account on npmjs.com and are listed as a maintainer for the biowc packages, then run:

```
npm login
npx lerna publish [major|minor|patch]
```

## How this repo was initialized
  ```bash
  npx lerna@latest init
  ```

## How to port Vue.js components to Web Components
All existing components in ProteomicsDB are embedded into Vue.js (they live in `deprecated-vue-components`).  
We wrote down a summary of the main steps when translating a Vue component into a framework-independent web component: 
https://github.com/wilhelm-lab/biowc-core/wiki/Porting-Vue.js-component-to-Web-Components

# Bio web components (Biowc)

This monorepo contains several plotting components that can easily be integrated in your web tools. This can either be
done directly in the HTML, or through a JavaScript framework such as Vue, React, or Angular.

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

## How to use
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

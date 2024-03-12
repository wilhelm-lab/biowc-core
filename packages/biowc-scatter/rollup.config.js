import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';


export default {
  input: 'src/biowc-scatter.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'umd'
  },
  external: 'all',
  plugins: [typescript(), nodeResolve()]
};

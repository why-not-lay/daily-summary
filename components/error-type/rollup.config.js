import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    {
        file: 'dist/index.mjs',
        format: "esm"
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json'
    }),
    json(),
    commonjs(),
  ]
};
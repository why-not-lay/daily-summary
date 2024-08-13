import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import nodeRolve from '@rollup/plugin-node-resolve';
import dotenv from 'rollup-plugin-dotenv';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
  ],
  plugins: [
    dotenv(),
    typescript({
      tsconfig: './tsconfig.prod.json'
    }),
    nodeRolve(),
    commonjs(),
    json(),
    terser(),
  ]
};
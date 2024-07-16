import typescript from '@rollup/plugin-typescript';
import dotenv from 'rollup-plugin-dotenv';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dev_dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    dotenv(),
    typescript({
      tsconfig: './tsconfig.dev.json',
    }),
  ]
};
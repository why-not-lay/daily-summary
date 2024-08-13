import typescript from '@rollup/plugin-typescript';
import dotenv from 'rollup-plugin-dotenv';

export default {
  input: 'src/index.ts',
  external: [
    'fastify',
    'pino-http-send',
    '@fastify/reply-from',
    'dotenv/config',
    'crypto',
    'dconstant-error-type',
    'dayjs/plugin/utc',
    'dayjs',
    'fastify-plugin',
  ],
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
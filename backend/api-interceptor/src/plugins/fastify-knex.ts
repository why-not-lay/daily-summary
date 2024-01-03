import { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin'
import knex, { Knex } from 'knex'

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex
  }
}

const knexPlugin: FastifyPluginCallback<Knex.Config> = (fastify: any, options, done: any) => {
  if(!fastify.knex) {
    const Knex = knex(options);
    fastify.decorate('knex', Knex);
    fastify.addHook('onClose', (fastify: any, done: any) => {
      if (fastify.knex === Knex) {
        fastify.knex.destroy(done)
      }
    })
  }
  done()
}


export default fp(knexPlugin, { name: 'fastify-knex' })
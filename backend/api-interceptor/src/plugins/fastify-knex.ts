import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin'
import knex, { Knex } from 'knex'

const knexPlugin: FastifyPluginCallback<Knex.Config> = (fastify: FastifyInstance, options, done: any) => {
  if(!fastify.knex) {
    const Knex = knex(options);
    fastify.decorate('knex', Knex);
    fastify.addHook('preClose', async () => {
      await fastify.knex.destroy();
    })
  }
  done()
}

export default fp(knexPlugin, { name: 'fastify-knex' })
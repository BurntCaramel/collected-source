if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi')

async function start() {
  const server = new Hapi.Server({
    port: process.env.PORT,
    // compression: { minBytes: 1 }
  })

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: (request) => ({
        schema: require('./schema')
      }),
      route: {
        cors: true
      }
    }
  })

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: (request) => ({
        schema: require('./schema'),
        endpointURL: '/graphql'
      }),
      route: {
        cors: true
      }
    }
  })

  server.route(require('./routes'))

  await server.start()
}

start()

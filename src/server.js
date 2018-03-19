if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')

const server = new Hapi.Server({
  port: process.env.PORT,
  // compression: { minBytes: 1 }
})

server.route(require('./routes'))

server.start()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')
const axios = require('axios')
const Boom = require('boom')
const Content = require('./Content')

const server = new Hapi.Server({
  port: process.env.PORT
})

server.route([
  {
    method: 'GET',
    path: '/',
    async handler(r, h) {
      return { success: true }
    }
  },
  {
    method: 'GET',
    path: '/components/{owner}/{repo}/{ref}',
    async handler({
      params: { owner, repo, ref },
      query: { path = 'components' }
    },
      h
    ) {
      return Content.listComponents({ owner, repo, ref, path })
    }
  },
  {
    method: 'GET',
    path: '/downloads/{owner}/{repo}/{ref}',
    async handler({
      params: { owner, repo, ref }
    },
      h
    ) {
      return Content.fetchZip({ owner, repo, ref })
    }
  }
])

server.start()

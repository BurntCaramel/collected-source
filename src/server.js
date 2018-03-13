if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')
const axios = require('axios')
const Boom = require('boom')
const Accept = require('accept')
const Content = require('./Content')

const server = new Hapi.Server({
  port: process.env.PORT,
  // compression: { minBytes: 1 }
})

const ndJSONType = 'application/x-ndjson'

function preAccept(request, h) {
  return Accept.parseAll(request.headers)
}

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
      return await Content.listComponents({
        owner,
        repo,
        ref,
        path
      })
    }
  },
  {
    method: 'GET',
    path: '/github/{owner}/{repo}/{ref}/command:list',
    options: {
      pre: [
        [
          { method: preAccept, assign: 'accept' }
        ]
      ],
    },
    async handler({
      params: { owner, repo, ref },
      query: { content },
      pre: { accept }
    },
      h
    ) {
      const isNDJSON = (accept.mediaTypes[0] === ndJSONType)
      return h.response(
        await Content.listFiles({
          owner,
          repo,
          ref,
          includeContent: content != null,
          streamJSON: isNDJSON
        })
      )
        .type(isNDJSON ? ndJSONType : 'application/json')
    }
  }
])

server.start()

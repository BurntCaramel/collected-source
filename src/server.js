if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')
const axios = require('axios')
const Boom = require('boom')
const Accept = require('accept')
const GitHub = require('./contexts/GitHub')

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
    path: '/github/{owner}/{repo}/{ref}/command:list',
    options: {
      pre: [
        [
          { method: preAccept, assign: 'accept' }
        ]
      ],
      cors: true,
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
        await GitHub.listFiles({
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

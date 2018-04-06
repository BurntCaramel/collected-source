const Accept = require('accept')
const GitHub = require('./contexts/GitHub')
const Trello = require('./contexts/Trello')
const { clearCache: clearLoadCache } = require('./loaders')

const ndJSONType = 'application/x-ndjson'

function preAccept(request, h) {
  return Accept.parseAll(request.headers)
}

const routes = [
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
  },
  {
    method: 'GET',
    path: '/trello/{boardID}',
    async handler({
      params: { boardID }
    }, h) {
      return await Trello.fetchBoard({ boardID })
    }
  },
  {
    method: 'POST',
    path: '/minecoin',
    handler() {
      clearLoadCache()
      return {}
    }
  }
]

module.exports = routes

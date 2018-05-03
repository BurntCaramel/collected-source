const Accept = require('accept')
const GitHub = require('./services/GitHub')
const Trello = require('./services/Trello')

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
    path: '/github/{owner}/{repoName}/{ref}/command:list',
    options: {
      pre: [
        [
          { method: preAccept, assign: 'accept' }
        ]
      ],
      cors: true,
    },
    async handler({
      params: { owner, repoName, ref },
      query: { content },
      pre: { accept }
    },
      h
    ) {
      const isNDJSON = (accept.mediaTypes[0] === ndJSONType)
      return h.response(
        await GitHub.listFiles({
          owner,
          repoName,
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
  }
]

module.exports = routes

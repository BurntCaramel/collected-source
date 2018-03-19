const DataLoader = require('dataloader')
const GitHub = require('./contexts/GitHub')
const Trello = require('./contexts/Trello')

const trelloBoard = new DataLoader((boardIDs) => {
  return Promise.all(boardIDs.map(async (boardID) => {
    console.log('loading trello board', boardID)
    const data = await Trello.fetchBoard({ boardID })
    if (data.id !== boardID) {
      trelloBoard.prime(data.id, data)
    }
    return data
  }))
})

const gitHubRepoListFiles = new DataLoader((references) => {
  return Promise.all(references.map(({ owner, repoName, ref }) => {
    return GitHub.listFiles({
      owner,
      repo: repoName,
      ref,
      includeContent: true
    })
  }))
}, {
  cacheKeyFn({ owner, repoName, ref }) {
    return [owner, repoName, ref].join('/')
  }
})

module.exports = {
  trelloBoard,
  gitHubRepoListFiles
}
const DataLoader = require('dataloader')
const GitHub = require('./contexts/GitHub')
const Trello = require('./contexts/Trello')

function makeLoaders() {
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
    return Promise.all(references.map(({ owner, repoName, ref, includeContent }) => {
      return GitHub.listFiles({
        owner,
        repoName,
        ref,
        includeContent
      })
    }))
  }, {
    cacheKeyFn({ owner, repoName, ref, includeContent }) {
      return [owner, repoName, ref, includeContent ? '+includeContent' : '-includeContent'].join('/')
    }
  })

  function clearCache() {
    trelloBoard.clearAll()
    gitHubRepoListFiles.clearAll()
  }

  return {
    trelloBoard,
    gitHubRepoListFiles,
    clearCache
  }
}

module.exports = makeLoaders

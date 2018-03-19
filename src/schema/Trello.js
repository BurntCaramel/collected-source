const { makeExecutableSchema } = require('graphql-tools')
const Trello = require('../contexts/Trello')

const typeDefs = `
type TrelloBoard {
  id: String
  name: String
  lists: [TrelloList]
}

type TrelloList {
  id: String
  name: String
  cards: [TrelloCard]
}

type TrelloCard {
  id: String!
  url: String
  name: String
  desc: String
}
`

const rootQueryFields = `
  trelloBoard(
    id: String!
  ): TrelloBoard
`

const resolvers = {
  TrelloBoard: {
    async lists(
      { lists },
      args,
      context
    ) {
      return lists
    }
  },
  TrelloList: {
    async cards(
      list,
      args,
      { loaders }
    ) {
      const data = await loaders.trelloBoard.load(list.idBoard)
      return data.cards.filter((card) => card.idList === list.id)
    }
  }
}

const rootQueryResolvers = {
  async trelloBoard(rootValue, { id }, { loaders }) {
    return await loaders.trelloBoard.load(id)
  }
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
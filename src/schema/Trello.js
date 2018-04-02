const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const Trello = require('../contexts/Trello')
const { hasTag } = require('../utils/tags')
const { listHeadings, listListItems } = require('../utils/markdown')

const cardHasTags = R.uncurryN(2, (tags) => (
  R.propSatisfies(
    R.allPass(R.map(hasTag, tags)),
    'name'
  )
))

const typeDefs = `
type TrelloBoard {
  id: String
  name: String
  lists(q: String): [TrelloList]
  list(name: String): TrelloList
}

type TrelloList {
  id: String
  name: String
  cards(tags: [String!]): [TrelloCard]
}

type TrelloCard {
  id: String!
  url: String
  name: String
  desc: StringTransformer
}

type StringTransformer {
  text: String
  headings: [Heading!]
  listItems: [ListItem!]
}

type Heading {
  text: String
  level: Int
}

type ListItem {
  text: String
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
      { q },
      context
    ) {
      if (q) {
        return R.filter(R.propSatisfies(R.contains(q), 'name'), lists)
      }

      return lists
    },
    async list(
      { lists },
      { name },
      context
    ) {
      return R.find(R.propEq('name', name), lists)
    }
  },
  TrelloList: {
    async cards(
      list,
      { tags },
      { loaders }
    ) {
      const data = await loaders.trelloBoard.load(list.idBoard)
      let cards = data.cards.filter((card) => card.idList === list.id)
      if (!!tags) {
        cards = R.filter(
          cardHasTags(tags),
          cards
        )
      }
      return cards
    },
  },
  StringTransformer: {
    text(string) {
      return string
    },
    headings(string) {
      return listHeadings(string)
    },
    listItems(string) {
      return listListItems(string)
    }
  },
  Heading: {
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
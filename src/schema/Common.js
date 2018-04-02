const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const Trello = require('../contexts/Trello')
const { listTags, stripTags } = require('../utils/tags')
const { listHeadings, listListItems } = require('../utils/markdown')

const typeDefs = `
type TaggedStringTransformer {
  raw: String
  text: String
  tags: [String!]
}
`

const rootQueryFields = `
`

const resolvers = {
  TaggedStringTransformer: {
    raw(string) {
      return string
    },
    text(string) {
      return stripTags(string).trim()
    },
    tags(string) {
      return listTags(string)
    }
  },
}

const rootQueryResolvers = {
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
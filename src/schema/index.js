const { makeExecutableSchema } = require('graphql-tools')
const Common = require('./Common')
const Collection = require('./Collection')
const GitHub = require('./GitHub')
const Trello = require('./Trello')
const Components = require('./Components')

const baseTypeDefs = `
type Query {
  ${Common.rootQueryFields}
  ${Collection.rootQueryFields}
  ${GitHub.rootQueryFields}
  ${Trello.rootQueryFields}
  ${Components.rootQueryFields}
}

schema {
  query: Query
}
`

const typeDefs = [
  Common.typeDefs,
  Collection.typeDefs,
  GitHub.typeDefs,
  Trello.typeDefs,
  Components.typeDefs,
  baseTypeDefs
]

const resolvers = Object.assign(
  {
    Query: Object.assign({},
      Common.rootQueryResolvers,
      Collection.rootQueryResolvers,
      GitHub.rootQueryResolvers,
      Trello.rootQueryResolvers,
      Components.rootQueryResolvers
    )
  },
  Common.resolvers,
  Collection.resolvers,
  GitHub.resolvers,
  Trello.resolvers,
  Components.resolvers,
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema

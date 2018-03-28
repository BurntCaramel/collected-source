const { makeExecutableSchema } = require('graphql-tools')
const GitHub = require('./GitHub')
const Trello = require('./Trello')
const Components = require('./Components')

const baseTypeDefs = `
type Query {
  ${GitHub.rootQueryFields}
  ${Trello.rootQueryFields}
  ${Components.rootQueryFields}
}

schema {
  query: Query
}
`

const typeDefs = [
  GitHub.typeDefs,
  Trello.typeDefs,
  Components.typeDefs,
  baseTypeDefs
]

const resolvers = Object.assign(
  {
    Query: Object.assign({},
      GitHub.rootQueryResolvers,
      Trello.rootQueryResolvers,
      Components.rootQueryResolvers
    )
  },
  GitHub.resolvers,
  Trello.resolvers,
  Components.resolvers,
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema

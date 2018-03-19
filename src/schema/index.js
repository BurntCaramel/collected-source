const { makeExecutableSchema } = require('graphql-tools')
const GitHub = require('./GitHub')
const Trello = require('./Trello')

const baseTypeDefs = `
type Query {
  ${GitHub.rootQueryFields}
  ${Trello.rootQueryFields}
}

schema {
  query: Query
}
`

const typeDefs = [
  GitHub.typeDefs,
  Trello.typeDefs,
  baseTypeDefs
]

const resolvers = Object.assign(
  {
    Query: Object.assign({},
      GitHub.rootQueryResolvers,
      Trello.rootQueryResolvers
    )
  },
  GitHub.resolvers,
  Trello.resolvers,
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema

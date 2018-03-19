const { makeExecutableSchema } = require('graphql-tools')
const GitHub = require('./GitHub')

const baseTypeDefs = `
type Query {
  ${GitHub.rootQueryFields}
}

schema {
  query: Query
}
`

const typeDefs = [
  GitHub.typeDefs,
  baseTypeDefs
]

const resolvers = Object.assign(
  {
    Query: Object.assign({},
      GitHub.rootQueryResolvers
    )
  },
  GitHub.resolvers
)

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers
})

module.exports = schema

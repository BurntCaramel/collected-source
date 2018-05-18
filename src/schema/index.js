const { makeExecutableSchema } = require('graphql-tools')
const Common = require('./Common')
const Collection = require('./Collection')
const JavaScript = require('./JavaScript')
const GitHub = require('./GitHub')
const Trello = require('./Trello')
const Components = require('./Components')
const NPM = require('./NPM')

const baseTypeDefs = `
type Query {
  ${Common.rootQueryFields}
  ${Collection.rootQueryFields}
  ${JavaScript.rootQueryFields}
  ${GitHub.rootQueryFields}
  ${Trello.rootQueryFields}
  ${Components.rootQueryFields}
  ${NPM.rootQueryFields}
}

schema {
  query: Query
}
`

const typeDefs = [
  Common.typeDefs,
  Collection.typeDefs,
  JavaScript.typeDefs,
  GitHub.typeDefs,
  Trello.typeDefs,
  Components.typeDefs,
  NPM.typeDefs,
  baseTypeDefs
]

const resolvers = Object.assign(
  {
    Query: Object.assign({},
      Common.rootQueryResolvers,
      Collection.rootQueryResolvers,
      JavaScript.rootQueryResolvers,
      GitHub.rootQueryResolvers,
      Trello.rootQueryResolvers,
      Components.rootQueryResolvers,
      NPM.rootQueryResolvers,
    )
  },
  Common.resolvers,
  Collection.resolvers,
  JavaScript.resolvers,
  GitHub.resolvers,
  Trello.resolvers,
  Components.resolvers,
  NPM.resolvers,
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema

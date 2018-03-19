const { makeExecutableSchema } = require('graphql-tools')
const GitHub = require('../contexts/GitHub')

const typeDefs = `
type GitHubRepo {
  owner: String!
  repoName: String!
  ref: String
  files: [GitHubFile]
}

type GitHubFile {
  path: String!
  content: String
}

type Query {
  gitHubRepo(
    owner: String!,
    repoName: String!,
    ref: String
  ): GitHubRepo
}

schema {
  query: Query
}
`

const resolvers = {
  Query: {
    gitHubRepo(_, { owner, repoName, ref }) {
      return { owner, repoName, ref: ref || 'master' }
    }
  },
  GitHubRepo: {
    async files(
      { owner, repoName, ref },
      args,
      context) {
      return GitHub.listFiles({
        owner,
        repo: repoName,
        ref,
        includeContent: true
      })
    }
  },
  GitHubFile: {}
}

const schema = makeExecutableSchema({
  typeDefs: [typeDefs],
  resolvers
})

module.exports = schema

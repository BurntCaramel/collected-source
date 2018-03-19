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
`

const rootQueryFields = `
  gitHubRepo(
    owner: String!,
    repoName: String!,
    ref: String
  ): GitHubRepo
`

const resolvers = {
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

const rootQueryResolvers = {
  gitHubRepo(_, { owner, repoName, ref }) {
    return { owner, repoName, ref: ref || 'master' }
  }
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
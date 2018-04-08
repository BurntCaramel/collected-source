const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const GitHub = require('../contexts/GitHub')
const { listDependenciesInPackageJSONContent } = require('../utils/dependencies')

const typeDefs = `
type GitHubRepo {
  owner: String!
  repoName: String!
  ref: String
  files: [GitHubFile]
  dependencies: GitHubDependencies
}

type GitHubDependencies {
  sources: [GitHubDependencySource]
}

type GitHubDependencySource {
  file: GitHubFile
  items: [GitHubDependencyItem]
}

type GitHubDependencyItem {
  name: String
  rule: String
}

type GitHubFile {
  path: String!
  content: String
  asMarkdown: MarkdownDocumentTransformer
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
      _args,
      _context
    ) {
      return GitHub.listFiles({
        owner,
        repo: repoName,
        ref,
        includeContent: true
      })
    },
    async dependencies(
      { owner, repoName, ref }
    ) {
      const files = await GitHub.listFiles({
        owner,
        repo: repoName,
        ref,
        includeContent: true
      })
      return { files }
    }
  },
  GitHubDependencies: {
    async sources(
      { files },
      _args,
      _context
    ) {
      const fromPackageJSON = R.pipe(
        R.filter(({ path }) => {
          return /(^|\/)package.json$/.test(path)
        }),
        R.tap(files => console.log('package.json files', files)),
        R.map((file) => {
          return {
            file,
            items: listDependenciesInPackageJSONContent(file.content)
          }
        })
      )(files)

      return fromPackageJSON
    }
  },
  GitHubFile: {
    asMarkdown(
      { content }
    ) {
      return content
    }
  }
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
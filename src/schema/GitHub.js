const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const mm = require('micromatch')
const GitHub = require('../contexts/GitHub')
const { listDependenciesInPackageJSONContent } = require('../utils/dependencies')

const typeDefs = `
type GitHubRepo {
  owner: String!
  repoName: String!
  ref: String
  files(pathPrefixes: [String], pathMatching: [String], pathNotMatching: [String]): [GitHubFile]
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
  groups: [String!]
}

type GitHubFile {
  path: String!
  content: String
  asMarkdown: MarkdownDocumentTransformer
  asJavaScript: JavaScriptFile
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
      { pathPrefixes, pathMatching, pathNotMatching },
      { loaders }
    ) {
      let files = await loaders.gitHubRepoListFiles.load({
        owner,
        repoName,
        ref,
        includeContent: true
      })

      if (pathPrefixes && pathPrefixes.length > 0) {
        files = files.filter(file => pathPrefixes.some(pathPrefix => file.path.startsWith(pathPrefix)))
      }

      if (pathMatching) {
        const testA = R.anyPass(pathMatching.map(mm.matcher))
        files = files.filter(file => testA(file.path))
      }

      if (pathNotMatching) {
        const testB = R.anyPass(pathNotMatching.map(mm.matcher))
        files = files.filter(file => !testB(file.path))
      }

      return files
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
    },
    asJavaScript(
      { path, content }
    ) {
      if (!!content && /\.(js|jsx|ts|tsx)$/.test(path)) {
        return { path, content }
      }
    },
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
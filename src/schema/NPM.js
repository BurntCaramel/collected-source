const R = require('ramda');
const Path = require('path');

const typeDefs = `
type NPMProject {
  directoryPath: String
  name: String
  version: String
  private: Boolean
  license: String
  homepage: String
  npmOrgURL: String
  dependencies: GitHubDependencySource
  files(pathPrefixes: [String], pathMatching: [String], pathNotMatching: [String]): [GitHubFile]
}
`;

const rootQueryFields = `
`;

const resolvers = {
  NPMProject: {
    directoryPath({ packageJSONFile }) {
      return Path.dirname(packageJSONFile.path);
    },
    name({ packageJSON }) {
      return packageJSON.name;
    },
    version({ packageJSON }) {
      return packageJSON.version;
    },
    private({ packageJSON }) {
      return packageJSON.private;
    },
    license({ packageJSON }) {
      return packageJSON.license;
    },
    homepage({ packageJSON }) {
      return packageJSON.homepage;
    },
    npmOrgURL({ packageJSON }) {
      return `https://www.npmjs.com/package/${packageJSON.name}`;
    },
    dependencies({ packageJSONFile }) {
      return {
        file: packageJSONFile,
      };
    },
    files({ allFiles, packageJSONFile }) {
      const directoryPath = Path.dirname(packageJSONFile.path);
      return R.pipe(
        R.filter(file => {
          return R.startsWith(directoryPath, file.path);
        })
      )(allFiles);
    },
  },
};

const rootQueryResolvers = {};

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers,
};

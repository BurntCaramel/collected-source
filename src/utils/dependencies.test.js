const test = require('ava')
const { listDependenciesInPackageJSONContent } = require('./dependencies')

test('listDependenciesInPackageJSONContent()', t => {
  t.deepEqual(
    listDependenciesInPackageJSONContent(
      '{\n  "name": "create-react-organism",\n  "version": "0.2.0",\n  "description": "Tool to easily create react-organism smart components",\n  "engines": {\n    "node": ">=6"\n  },\n  "bin": {\n    "create-react-organism": "./bin/create-react-organism.js"\n  },\n  "main": "index.js",\n  "repository": "https://github.com/RoyalIcing/react-organism",\n  "author": "Patrick Smith <patrick@burntcaramel.com>",\n  "license": "MIT",\n  "dependencies": {\n    "creed": "^1.2.1",\n    "cross-spawn": "^5.1.0",\n    "lodash": "^4.17.4"\n  }\n}\n'
), [
    { name: "creed", rule: "^1.2.1" },
    { name: "cross-spawn", rule: "^5.1.0"},
    { name: "lodash", rule: "^4.17.4" }
  ])
})
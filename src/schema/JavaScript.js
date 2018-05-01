const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const babel = require('babel-core')
const babylon = require('babylon')
const traverseAST = require('babel-traverse')
const Trello = require('../contexts/Trello')
const { listTags, stripTags } = require('../utils/tags')
const { listHeadings, listListItems, extractFrontmatter, stripFrontmatter } = require('../utils/markdown')

const typeDefs = `
type JavaScriptFile {
  path: String
  content: String
  transform: ESModuleTransformer
}

type ESModuleTransformer {
  inputCode: String
  outputCode: String
  astEncoded: String
  imports: [ESImportDeclaration!]
  classes: [ESClassDeclaration!]
}

type ESImportDeclaration {
  source: String
  specifiers: [ESImportSpecifier!]
}

type ESImportSpecifier {
  in: String
  as: String
}

type ESClassDeclaration {
  name: String
  superClass: String
  methods: [ESMethodDeclaration!]
}

type ESMethodDeclaration {
  name: String
  lineCount: Int
}
`

const rootQueryFields = `
`

const resolvers = {
  JavaScriptFile: {
    transform({ content: inputCode, path }) {
      const ast = babylon.parse(inputCode, {
        sourceType: 'module',
        plugins: ['jsx', 'objectRestSpread', 'classProperties', 'decorators', 'dynamicImport', 'flow'],
        sourceFilename: path
      })

      const classDeclarations = []
      const importDeclarations = []

      const importVisitor = {
        ImportDefaultSpecifier({ node }, { importDeclaration }) {
          importDeclaration.specifiers.push({
            as: node.local.name
          })
        },
        ImportSpecifier({ node }, { importDeclaration }) {
          importDeclaration.specifiers.push({
            in: node.imported.name,
            as: node.local.name
          })
        },
        ImportNamespaceSpecifier({ node }, { importDeclaration }) {
          importDeclaration.specifiers.push({
            in: '*',
            as: node.local.name
          })
        }
      }

      const classVisitor = {
        ClassMethod({ node }, { classDeclaration }) {
          classDeclaration.methods.push({
             name: node.key.name,
             lineCount: R.tryCatch(() => node.body.loc.end.line - node.body.loc.start.line + 1, 0)
          })
        }
      }

      const { code, ast: finalAst } = babel.transformFromAst(ast, inputCode, {
        plugins: [
          function(babel) {
            return {
              visitor: {
                ImportDeclaration(path, state) {
                  const importDeclaration = {
                    source: path.node.source.value,
                    specifiers: []
                  }
                  importDeclarations.push(importDeclaration)
                  path.traverse(importVisitor, { importDeclaration })
                },
                ClassDeclaration(path, state) {
                  const classDeclaration = {
                     name: path.node.id.name,
                     superClass: path.node.superClass.name,
                     methods: []
                  }
                  classDeclarations.push(classDeclaration)
                  path.traverse(classVisitor, { classDeclaration })
                }
              }
            }
          }
        ]
      })

      // const { code, ast: finalAst } = babel.transformFromAst(ast, inputCode, {
      //   ast: true,
      //   presets: [
      //     ['env', {
      //       targets: {
      //         browsers: '> 0.5%'
      //       }
      //     }],
      //     'react'
      //   ]
      // })
      return {
        inputCode,
        outputCode: code,
        ast,
        imports: importDeclarations,
        classes: classDeclarations,
      }
    },
  },
  ESModuleTransformer: {
    astEncoded({ ast }) {
      return JSON.stringify(ast)
    },
  },
}

const rootQueryResolvers = {
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
const { makeExecutableSchema } = require('graphql-tools')
const GitHub = require('../services/GitHub')

const typeDefs = `
enum Prominence {
  PRIMARY
  SECONDARY
  TERTIARY
}

enum Transform {
  REVERSE
  UPPERCASE
  LOWERCASE
}

type Element {
  prominence: Prominence
  text: String
  children: [Element]
}

input InputElement {
  prominence: Prominence
  text: String
  children: [InputElement]
}
`

const rootQueryFields = `
  renderBlah: String

  renderHTML(text: String, transforms: [Transform], elements: [InputElement]): String
`

const resolvers = {
  Element: {
  },
}

function htmlElement({ text = '', prominence = null, children = [] }) {
  let tagName = 'p'
  if (prominence === 'PRIMARY') {
    tagName = 'h1'
  }

  return `<${tagName}>${text}${children.map(htmlElement).join('\n')}</${tagName}>`
}

function applyTransforms(items, transforms) {
  transforms.forEach(transform => {
    if (transform === 'REVERSE') {
      items = items.concat().reverse()
    }
    else if (transform === 'UPPERCASE') {
      items = items.map(s => s.toUpperCase())
    }
    else if (transform === 'LOWERCASE') {
      items = items.map(s => s.toLowerCase())
    }
  })

  return items
}

const rootQueryResolvers = {
  renderHTML(_, { text = '', transforms = [], elements = [] }) {
    let items = elements.map(htmlElement)
    items = applyTransforms(items, transforms)
    return items.join('\n')
  },

  renderBlah(_, { element }) {
    return '<p>Blah</p>'
  }
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
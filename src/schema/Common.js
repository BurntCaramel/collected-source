const { makeExecutableSchema } = require('graphql-tools')
const R = require('ramda')
const Trello = require('../services/Trello')
const { listTags, stripTags } = require('../utils/tags')
const { listHeadings, listListItems, extractFrontmatter, stripFrontmatter } = require('../utils/markdown')

const typeDefs = `
type TaggedStringTransformer {
  raw: String
  text: String
  tags: [String!]
}

type MarkdownDocumentTransformer {
  source: String
  sections: [MarkdownSectionTransformer!]
  frontmatter: MarkdownFrontmatter
}

type MarkdownSectionTransformer {
  source: String
  headings: [Heading!]
  listItems: [TaggedStringTransformer!]
}

type Heading {
  text: String
  level: Int
}

type ListItem {
  text: TaggedStringTransformer
}

type MarkdownFrontmatter {
  value(key: String!): String
}
`

const rootQueryFields = `
`

const resolvers = {
  TaggedStringTransformer: {
    raw(string) {
      return string
    },
    text(string) {
      return stripTags(string).trim()
    },
    tags(string) {
      return listTags(string)
    }
  },
  MarkdownDocumentTransformer: {
    source(string) {
      return string
    },
    sections(string) {
      return R.pipe(
        stripFrontmatter,
        R.split(/^[-\*]{3,}\s*/m)
      )(string)
    },
    frontmatter(string) {
      return extractFrontmatter(string)
    }
  },
  MarkdownSectionTransformer: {
    source(string) {
      return string
    },
    headings(string) {
      return listHeadings(string)
    },
    listItems(string) {
      return listListItems(string)
    }
  },
  Heading: {
  },
  MarkdownFrontmatter: {
    value(pairs, { key }) {
      return pairs[key]
    }
  }
}

const rootQueryResolvers = {
}

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers
}
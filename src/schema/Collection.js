const R = require('ramda');
const { listTags, stripTags } = require('../utils/tags');

const typeDefs = `
type Unit {
  name: String
  tags: [String!]
  body: MarkdownDocumentTransformer
}

type Collection {
  name: String
  value(key: String!): String
  units(tags: [String!]): [Unit!]
}
`;

const rootQueryFields = `
`;

const resolvers = {
  Unit: {
    tags({ tags, name }) {
      if (tags) {
        return tags;
      }

      return listTags(name);
    },
  },
  Collection: {
    value({ values }, { key }) {
      return !!values ? values[key] : null;
    },
    async units(object, query, context) {
      if (object.resolveUnits) {
        return await object.resolveUnits(object, query, context);
      }
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

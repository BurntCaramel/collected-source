const R = require('ramda');
const Trello = require('../services/Trello');
const { hasTag } = require('../utils/tags');
const { listHeadings, listListItems } = require('../utils/markdown');

const cardHasTags = R.uncurryN(2, tags =>
  R.propSatisfies(R.allPass(R.map(hasTag, tags)), 'name')
);

const typeDefs = `
type TrelloBoard {
  id: String
  name: String
  lists(q: String): [TrelloList]
  list(name: String): TrelloList
  collections(q: String): [Collection!]
}

type TrelloList {
  id: String
  name: String
  cards(tags: [String!]): [TrelloCard]
}

type TrelloCard {
  id: String
  url: String
  name: TaggedStringTransformer
  desc: MarkdownDocumentTransformer
}
`;

const rootQueryFields = `
  trelloBoard(
    id: String!
  ): TrelloBoard
`;

async function cardsForList(list, { tags }, { loaders }) {
  const data = await loaders.trelloBoard.load(list.idBoard);
  let cards = data.cards.filter(card => card.idList === list.id);
  if (!!tags) {
    cards = R.filter(cardHasTags(tags), cards);
  }
  return cards;
}

const resolvers = {
  TrelloBoard: {
    async lists({ lists }, { q }, context) {
      if (q) {
        return R.filter(
          R.propSatisfies(R.pipe(R.toLower, R.contains(R.toLower(q))), 'name'),
          lists
        );
      }

      return lists;
    },
    async list({ lists }, { name }, context) {
      return R.find(R.propEq('name', name), lists);
    },
    async collections({ lists }, { q }, { loaders }) {
      q = (q || '').trim();

      return R.pipe(
        R.filter(
          R.propSatisfies(
            q === ''
              ? R.always(true)
              : R.pipe(R.toLower, R.contains(R.toLower(q))),
            'name'
          )
        ),
        R.map(
          R.converge(R.unapply(R.mergeAll), [
            R.identity,
            R.pipe(
              R.prop('name'),
              R.split(' '),
              R.last,
              R.objOf('domain'),
              R.objOf('values')
            ),
            R.always({
              async resolveUnits(list, query, context) {
                const cards = await cardsForList(list, query, context);
                return R.map(
                  R.converge(R.merge, [
                    R.identity,
                    R.pipe(R.prop('desc'), R.objOf('body')),
                  ]),
                  cards
                );
              },
            }),
          ])
        )
      )(lists);
    },
  },
  TrelloList: {
    cards: cardsForList,
  },
};

const rootQueryResolvers = {
  async trelloBoard(rootValue, { id }, { loaders }) {
    return await loaders.trelloBoard.load(id);
  },
};

module.exports = {
  typeDefs,
  rootQueryFields,
  resolvers,
  rootQueryResolvers,
};

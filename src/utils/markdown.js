const R = require('ramda');

const headingsRegex = /^#+\s+(.+)/gm;
const listItemRegex = /^\s*[-*+]\s+(.+)/gm;
const frontmatterRegex = /^---\n([\s\S]+)\n---\n+/;
const frontmatterKeyValuePairRegex = /^([^:]+):\s*(.+)?/;

const extractFrontmatter = R.pipe(
  R.match(frontmatterRegex),
  R.propOr('', 1),
  R.split('\n'),
  R.map(
    R.pipe(
      R.match(frontmatterKeyValuePairRegex),
      R.props([1, 2]),
      R.map(R.defaultTo(''))
    )
  ),
  R.reject(R.propEq(0, '')),
  R.fromPairs
);

const stripFrontmatter = R.replace(frontmatterRegex, '');

const listHeadings = R.pipe(
  stripFrontmatter,
  R.match(headingsRegex),
  R.map(
    R.converge(R.unapply(R.zipObj(['text', 'level'])), [
      R.pipe(R.dropWhile(R.equals('#')), R.trim),
      R.reduceWhile((acc, c) => c === '#', R.inc, 0),
    ])
  )
);

const listListItems = R.pipe(
  stripFrontmatter,
  R.match(listItemRegex),
  R.reduce((items = [], input) => {
    input = input.replace('\n', '');
    const indentWhitespace = input.split(/[-+*]/)[0];
    const content = R.pipe(
      R.slice(indentWhitespace.length + 1, Infinity),
      R.trim
    )(input);
    const level = indentWhitespace.replace(/\s\s/g, ' ').replace(/\t/, ' ')
      .length;

    const newItem = {
      content,
      childItems: [],
    };

    let targetedItems = items;
    let i = level;
    while (i > 0) {
      let nextItem = targetedItems[targetedItems.length - 1];
      if (!nextItem) {
        nextItem = { content: '', childItems: [] };
        targetedItems.push(nextItem);
      }
      targetedItems = nextItem.childItems;
      i -= 1;
    }

    targetedItems.push(newItem);

    return items;
  }, undefined),
  R.defaultTo([])
);

module.exports = {
  listHeadings,
  listListItems,
  extractFrontmatter,
  stripFrontmatter,
};

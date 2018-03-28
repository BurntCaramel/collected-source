const R = require('ramda')

const headingsRegex = /^#+\s+(.+)/gm
const listItemRegex = /^\s*[-*+]\s+(.+)/gm

const listHeadings = R.pipe(
  R.match(headingsRegex),
  R.map(R.converge(
    R.unapply(R.zipObj(['text', 'level'])),
    [
      R.pipe(
        R.dropWhile(R.equals('#')),
        R.trim
      ),
      R.reduceWhile((acc, c) => (c === '#'), R.inc, 0)
    ]
  ))
)

const listListItems = R.pipe(
  R.match(listItemRegex),
  R.map(R.pipe(
    R.drop(2),
    R.trim,
    R.objOf('text'),
  )),
)

module.exports = {
  listHeadings,
  listListItems,
}

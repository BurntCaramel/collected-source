const R = require('ramda')

const tagsRegex = /#(\w+)/g

const listTags = R.pipe(
  R.match(tagsRegex),
  R.map(R.drop(1))
)

const hasTag = R.curry((tagToFind, string) => {
  const tags = listTags(string)
  return R.contains(tagToFind, tags)
})

const stripTags = R.replace(tagsRegex, '')

module.exports = {
  listTags,
  hasTag,
  stripTags,
}

const R = require('ramda')

const listDependenciesInPackageJSONContent = R.tryCatch((content) => {
  const json = JSON.parse(content)
  return R.pipe(
    R.toPairs,
    R.map(R.zipObj(['name', 'rule']))
  )(json.dependencies)
}, R.always(null))

module.exports = {
  listDependenciesInPackageJSONContent,
}
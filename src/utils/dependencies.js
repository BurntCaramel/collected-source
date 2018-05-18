const R = require('ramda')

const packageJSONPathRegex = /(^|\/)package.json$/

const pathIsPackageJSON = R.test(packageJSONPathRegex)

const listDependenciesInPackageJSONContent = R.tryCatch((content) => {
  const json = JSON.parse(content)
  const dependencies = R.pipe(
    R.toPairs,
    R.map(R.pipe(
      R.zipObj(['name', 'rule']),
      R.merge({ groups: [] })
    )),
  )(json.dependencies)

  const peerDependencies = R.pipe(
    R.toPairs,
    R.map(R.pipe(
      R.zipObj(['name', 'rule']),
      R.merge({ groups: ['peer'] })
    )),
  )(json.peerDependencies || [])

  return R.concat(dependencies, peerDependencies)
}, R.always(null))

module.exports = {
  pathIsPackageJSON,
  listDependenciesInPackageJSONContent,
}
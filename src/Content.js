const axios = require('axios')
const octokit = require('./octokit')

async function listComponents({
  owner,
  repo,
  ref,
  path,
  download = false
}) {
  const result = await octokit.repos.getContent({
    owner,
    repo,
    ref,
    path
  })
    .catch(error => {
      if (/Not Found/.test(error.message)) {
        throw Boom.notFound()
      }
      else {
        throw error
      }
    })

  const itemContents = await Promise.all(
    result.data.map(async (item) => {
      if (item.type === 'dir') {
        if (/^_/.test(item.name)) {
          return
        }
        const items = await listComponents({ owner, repo, ref, path: `${path}/${item.name}` })
        return { items }
      }
      else if (item.type === 'file') {
        let content = null
        if (download) {
          const response = await axios.get(item.download_url, {
            responseType: 'text',
            transformResponse: data => data
          })
          content = response.data
        }

        return {
          name: item.name,
          size: item.size,
          content,
          url: item.download_url
        }
      }
      else {
        return
      }
    })
  )
  return itemContents.filter(Boolean)
}

module.exports = {
  listComponents
}
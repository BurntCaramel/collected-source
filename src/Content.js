const axios = require('axios')
const Path = require('path')
const { tmpdir } = require('os')
const { createWriteStream } = require('fs')
const { randomBytes } = require('crypto')
const AdmZip = require('adm-zip')
const octokit = require('./octokit')

async function fetchZip({
  owner,
  repo,
  ref,
}) {
  const zipURL = `https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`
  console.log('zip url ', zipURL)
  const { data: zipIn } = await axios.get(zipURL, {
    responseType: 'stream'
  })
  zipIn.pause()

  const fileName = randomBytes(32).toString('hex') + '.zip'
  const writePath = Path.join(tmpdir(), fileName)
  const zipOut = createWriteStream(writePath)

  // zipIn.on('data', (data) => { console.log('data reading', data) })
  zipIn.on('error', (error) => { console.log('error reading', error) })
  zipIn.on('end', () => { console.log('end read') })
  zipOut.on('open', () => { console.log('open write') })

  zipIn.pipe(zipOut)

  console.log('begin write zip to ', writePath)

  await new Promise((resolve, reject) => {
    zipOut.on('error', reject)
    zipOut.on('data', () => { console.log('wrote data') })
    zipOut.on('finish', () => { console.log('end finish'); resolve() })
  })

  console.log('wrote zip to ', writePath)

  const zip = new AdmZip(writePath)
  return zip.getEntries().map(zipEntry => {
    const slashIndex = zipEntry.entryName.indexOf('/')
    return {
      path: zipEntry.entryName.slice(slashIndex + 1),
      isDirectory: zipEntry.isDirectory
    }
  })
}

async function listComponents1({
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
  listComponents: listComponents1,
  fetchZip
}
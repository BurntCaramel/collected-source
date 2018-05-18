const axios = require('axios')
const Boom = require('boom')
const Path = require('path')
const tempy = require('tempy')
const { createWriteStream } = require('fs')
const { randomBytes } = require('crypto')
const AdmZip = require('adm-zip')
const NDJSON = require('ndjson')
const Stream = require('stream')
const octokit = require('../services/octokit')

async function fetchZip({
  owner,
  repoName,
  ref,
}) {
  const zipURL = `https://api.github.com/repos/${owner}/${repoName}/zipball/${ref}`
  // const zipURL = `https://github.com/${owner}/${repoName}/archive/${ref}.zip`
  console.log('fetching GitHub repo zip', zipURL)
  const { data: zipDownload } = await axios.get(zipURL, {
    responseType: 'stream'
  })
    .catch(error => {
      throw Boom.boomify(error, { statusCode: error.response.status })
    })

  const fileName = randomBytes(32).toString('hex') + '.zip'
  const writePath = tempy.file({ name: fileName })
  const zipWriteFile = createWriteStream(writePath)

  const finishWritePromise = Promise.all([
    new Promise((resolve, reject) => {
      zipDownload.on('error', reject)
      zipDownload.on('end', resolve)
    }),
    new Promise((resolve, reject) => {
      zipWriteFile.on('error', reject)
      zipWriteFile.on('finish', resolve)
    })
  ])

  zipDownload.pipe(zipWriteFile)

  await finishWritePromise

  return new AdmZip(writePath)
}

async function ndJSONStreamFromPromises(promises) {
  const stream = NDJSON.serialize();

  (async () => {
    for (const promise of promises) {
      const json = await promise;
      if (!!json) {
        stream.write(json);
      }
    }
    stream.end();
  })();

  return new Stream.Readable().wrap(stream);
}

async function listFiles({
  owner,
  repoName,
  ref,
  includeContent = false,
  streamJSON = false
}) {
  const zip = await fetchZip({ owner, repoName, ref })
  console.log('creating promises')
  const promises = zip.getEntries().map(async (zipEntry) => {
    console.log('processing entry', zipEntry.entryName)
    const slashIndex = zipEntry.entryName.indexOf('/')
    const path = zipEntry.entryName.slice(slashIndex + 1)
    if (path === '') {
      return
    }

    let content = undefined

    if (includeContent && !zipEntry.isDirectory) {
      content = await new Promise(resolve => {
        zipEntry.getDataAsync(resolve)
      })
        .then(buffer => buffer.toString('utf8'))
    }

    console.log('processed entry', zipEntry.entryName)

    return {
      path,
      isDirectory: zipEntry.isDirectory,
      content
    }
  })

  if (streamJSON) {
    return await ndJSONStreamFromPromises(promises)
  }
  else {
    return await Promise.all(promises)
      .then(items => items.filter(Boolean))
  }
}

module.exports = {
  listFiles,
}
const test = require('ava')
const { listHeadings } = require('./markdown')

test('listHeadings()', t => {
  t.deepEqual(
    [
      { text: 'Primary', level: 1 },
      { text: 'Secondary', level: 2 }
    ],
    listHeadings(`
# Primary

blah blah

## Secondary

yep yep
`));
})

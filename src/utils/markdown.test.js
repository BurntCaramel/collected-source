const test = require('ava')
const { listHeadings, listListItems } = require('./markdown')

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

test('listListItems()', t => {
  t.deepEqual(
    [
      { text: 'first' },
      { text: 'second' }
    ],
    listListItems(`
- first

blah blah

- second

yep yep
`));
})

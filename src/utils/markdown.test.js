const test = require('ava');
const {
  listHeadings,
  listListItems,
  extractFrontmatter,
  stripFrontmatter,
} = require('./markdown');

test('listHeadings()', t => {
  t.deepEqual(
    [{ text: 'Primary', level: 1 }, { text: 'Secondary', level: 2 }],
    listHeadings(`
# Primary

blah blah

## Secondary

yep yep
`)
  );
});

test('listListItems()', t => {
  t.deepEqual(
    [
      { content: 'first', childItems: [] },
      { content: 'second', childItems: [] },
    ],
    listListItems(`
blah de blah

- first

blah blah

- second

yep yep
`)
  );
});

test('listListItems() with nothing', t => {
  t.deepEqual([], listListItems(''));
});

test('listListItems() with nested items', t => {
  t.deepEqual(
    [
      {
        content: 'first',
        childItems: [
          { content: 'a', childItems: [] },
          {
            content: 'b',
            childItems: [
              {
                content: 'c',
                childItems: [
                  {
                    content: '',
                    childItems: [{ content: 'whoa', childItems: [] }],
                  },
                ],
              },
            ],
          },
          { content: 'd', childItems: [] },
        ],
      },
      {
        content: 'second',
        childItems: [{ content: 'e', childItems: [] }],
      },
      {
        content: 'third',
        childItems: [{ content: 'f', childItems: [] }],
      },
    ],
    listListItems(`
- first
  - a
  - b  
    - c
        - whoa
  - d 
+ second    
  + e
* third
  * f

yep yep
`)
  );
});

test('stripFrontmatter()', t => {
  t.deepEqual(
    `# Primary heading

## Subheading`,
    stripFrontmatter(`---
title: The first time
title: Example - the next level experience: of the world

yes: true
ok:true
novalue:
:
::
:thing
---

# Primary heading

## Subheading`)
  );
});

test('extractFrontmatter()', t => {
  t.deepEqual(
    {
      title: 'Example - the next level experience: of the world',
      yes: 'true',
      ok: 'true',
      novalue: '',
    },
    extractFrontmatter(`---
title: The first time
title: Example - the next level experience: of the world

yes: true
ok:true
novalue:
:
::
:thing
---

# Primary heading

## Subheading`)
  );
});

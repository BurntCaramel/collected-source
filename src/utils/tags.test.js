const test = require('ava');
const { listTags, hasTag } = require('./tags');

test('listTags() with no tags', t => {
  t.deepEqual([], listTags('some text'));
});

test('listTags() with just tags', t => {
  t.deepEqual(['page', 'blah'], listTags('#page #blah'));
  t.deepEqual(['blah', 'page'], listTags('#blah #page'));
});

test('listTags() with text and tags', t => {
  t.deepEqual(['page', 'blah'], listTags('first #page #blah'));
  t.deepEqual(['page', 'blah'], listTags('#page middle #blah'));
  t.deepEqual(['blah', 'page'], listTags('#blah middle #page'));
  t.deepEqual(['blah', 'page'], listTags('#blah #page end'));
});

test('hasTag() with no tags', t => {
  t.false(hasTag('page', 'some text'));
});

test('hasTag() with just tags', t => {
  t.true(hasTag('page', '#page #blah'));
  t.true(hasTag('page', '#blah #page'));
});

test('hasTag() with text and tags', t => {
  t.true(hasTag('page', 'first #page #blah'));
  t.true(hasTag('page', '#page middle #blah'));
  t.true(hasTag('page', '#blah middle #page'));
  t.true(hasTag('page', '#blah #page end'));
});

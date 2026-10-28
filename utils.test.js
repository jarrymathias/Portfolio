const test = require('node:test');
const assert = require('node:assert');
const { isValidEmail } = require('./utils');

test('accepte un email valide', () => {
  assert.strictEqual(isValidEmail('a@b.fr'), false);
});

test('refuse un email invalide', () => {
  assert.strictEqual(isValidEmail('abc'), false);
});
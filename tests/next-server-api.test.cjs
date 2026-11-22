const assert = require('node:assert/strict');
const test = require('node:test');
const { NextResponse } = require('next/server');

test('NextResponse creates a proxy pass-through response', () => {
  const response = NextResponse.next();

  assert.equal(response.headers.get('x-middleware-next'), '1');
});

test('NextResponse redirects to the login route', () => {
  const response = NextResponse.redirect(new URL('http://localhost/login'));

  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'http://localhost/login');
});

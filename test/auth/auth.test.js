import { auth } from './../../src/index'

test('exposing auth functions', async () => {
  expect(auth).toHaveProperty('googleAuth')
  expect(auth).toHaveProperty('facebookAuth')
  expect(auth).toHaveProperty('twitterAuth')
  expect(auth).toHaveProperty('linkedinAuth')
  expect(auth).toHaveProperty('githubAuth')
  expect(auth).toHaveProperty('steamAuth')
})
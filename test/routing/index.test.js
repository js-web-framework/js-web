import request from 'supertest'

import { route, htmlRoute, postRoute, app } from './../../src/routing'
import { WSASYSNOTREADY } from 'constants'

describe('routing', () => {
  let server

  beforeEach(() => {
    server = app.listen()
  })

  afterEach((done) => {
    server.close()
    done()
  })

  it('gives you a jwt token', async () => {
    const jsonResponse = { simon: 'my name2' }
    await postRoute('/test-post-jwt-sign', ({ jwtSign }) => ({ token: jwtSign() }))
    await postRoute('/test-post-jwt-verify', async ({ jwtVerify }) => {
      try {
        await jwtVerify()
        return { verified: true }
      } catch (error) {
        return { verified: false }
      }
    })

    const token = (await request(server).post('/test-post-jwt-sign').send()).body
    const result = await request(server)
      .post('/test-post-jwt-verify')
      .set({ 'x-access-token': token.token })
      .send()
    expect(result.status).toBe(200)
    expect(result.body).toEqual({ verified: true })
  })

  it('gives you a jwt token and fails', async () => {
    const jsonResponse = { simon: 'my name2' }
    await postRoute('/test-post-jwt-verify', async ({ jwtVerify }) => {
      try {
        await jwtVerify()
        return { verified: true }
      } catch (error) {
        return { verified: false }
      }
    })
    const result = await request(server)
      .post('/test-post-jwt-verify')
      .set({ 'x-access-token': 'kldfklfdklfdlkdfldfkl' })
      .send()
    expect(result.status).toBe(200)
    expect(result.body).toEqual({ verified: false })
  })

  it('get route (route)', async () => {
    const jsonResponse = { simon: 'my name2' }
    await route('/test', () => (jsonResponse))

    const result = await request(server).get('/test')
    expect(result.status).toBe(200)
    expect(result.body).toEqual(jsonResponse)
  })

  it('get route (route) empty data', async () => {
    await route('/test-empty')

    const result = await request(server).get('/test-empty')
    expect(result.status).toBe(200)
    expect(result.body).toEqual({})
  })

  it('post route (postRoute)', async () => {
    const jsonResponse = { simon: 'my name2' }
    await postRoute('/test-post', () => (jsonResponse))

    const result = await request(server).post('/test-post').send(jsonResponse)
    expect(result.status).toBe(200)
    expect(result.body).toEqual(jsonResponse)
  })

  it('html route (htmlRoute)', async () => {
    const htmlFile = 'test/routing/html-test-file.html'
    await htmlRoute('/test-html', htmlFile, async () => ({ name: 'Simon' }))

    const result = await request(server).get('/test-html')
    expect(result.status).toBe(200)
    expect(result.text.includes('<h1>Hi Simon</h1>')).toBeTruthy()
  })
})

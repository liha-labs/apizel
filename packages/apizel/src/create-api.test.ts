import { describe, expect, test, vi } from 'vitest'
import { apizel } from './create-api'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })

describe('api.extend', () => {
  test('returns an immutable derived client and does not mutate the base config', async () => {
    const baseConfig = {
      baseURL: 'https://api.example.com',
      headers: { 'X-App': 'core' },
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      return Promise.resolve(jsonResponse({ url: String(input) }))
    })

    const api = apizel({ ...baseConfig, fetchImpl: fetchMock })
    const billingApi = api.extend({ baseURL: 'https://billing.example.com', headers: { 'X-Service': 'billing' } })

    expect(api).not.toBe(billingApi)

    await api.get('/me')
    await billingApi.get('/me')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.example.com/me')
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe('https://billing.example.com/me')
    expect(baseConfig).toEqual({
      baseURL: 'https://api.example.com',
      headers: { 'X-App': 'core' },
    })
  })

  test('is equivalent to apizel(merge(commonConfig, overrides))', async () => {
    const common = {
      baseURL: 'https://api.example.com',
      headers: { 'X-App': 'core' },
    }

    const fetchA = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      return Promise.resolve(jsonResponse({ headers: init?.headers }))
    })
    const fetchB = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      return Promise.resolve(jsonResponse({ headers: init?.headers }))
    })

    const derivedViaExtend = apizel({ ...common, fetchImpl: fetchA }).extend({
      baseURL: 'https://users.example.com',
      headers: { 'X-Service': 'users' },
    })
    const derivedViaFactory = apizel({
      ...common,
      baseURL: 'https://users.example.com',
      headers: { ...common.headers, 'X-Service': 'users' },
      fetchImpl: fetchB,
    })

    await derivedViaExtend.post('/me', { name: 'alice' }, { headers: { 'X-Request': 'req-1' } })
    await derivedViaFactory.post('/me', { name: 'alice' }, { headers: { 'X-Request': 'req-1' } })

    const [urlA, initA] = fetchA.mock.calls[0]!
    const [urlB, initB] = fetchB.mock.calls[0]!

    expect(String(urlA)).toBe(String(urlB))
    expect(initA?.method).toBe(initB?.method)
    expect(initA?.headers).toEqual(initB?.headers)
  })

  test('keeps derived clients isolated under parallel calls', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      return Promise.resolve(jsonResponse({ url: String(input) }))
    })
    const api = apizel({
      baseURL: 'https://api.example.com',
      headers: { 'X-App': 'core' },
      fetchImpl: fetchMock,
    })

    const usersApi = api.extend({ baseURL: 'https://users.example.com' })
    const billingApi = api.extend({ baseURL: 'https://billing.example.com' })

    await Promise.all([usersApi.get('/me'), billingApi.post('/invoices', { amount: 100 })])

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0])).sort()
    expect(calledUrls).toEqual(['https://billing.example.com/invoices', 'https://users.example.com/me'])
  })
})

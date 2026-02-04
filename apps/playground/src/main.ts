import { HttpError, createApi } from '@liha-labs/apizel'

const log = (title: string, value: unknown) => {
  globalThis.console.log(`[playground] ${title}`, value)
}

const api = createApi({
  baseURL: 'https://jsonplaceholder.typicode.com',
  onRequest: (ctx) => {
    log('onRequest.url', ctx.url)
  },
})

const run = async () => {
  log('start', 'Running manual checks...')

  const posts = await api.get<Array<{ id: number }>>('/posts', {
    params: { id: [1, 2] },
  })
  log('params repeat format (id=1&id=2) response ids', posts.map((p) => p.id))

  try {
    await api.get('/posts', {
      params: { bad: { nested: true } as unknown as never },
    })
    log('params object guard', 'unexpected success')
  } catch (error) {
    log('params object guard (expected Error)', error)
  }

  try {
    await api.get('/__apizel_missing_endpoint__')
    log('404 handling', 'unexpected success')
  } catch (error) {
    if (error instanceof HttpError) {
      log('404 handling (HttpError)', { status: error.status, url: error.url, data: error.data })
      return
    }

    log('404 handling (unexpected error type)', error)
  }
}

run().catch((error) => {
  log('fatal', error)
})

import { CodeEditor, Section } from '../components'
import styles from './Examples.module.css'

export const Examples = () => {
  return (
    <Section
      id="examples"
      number="05"
      title="Examples"
      subTitle="apizel は “薄さ” がコンセプトです。ここでは TanStack Query や認証まわりの定番パターンを最小の形で示します。"
    >
      {/* 1. With TanStack Query (GET) */}
      <div className={styles.exampleBlock} id="example-query-get">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>With TanStack Query (GET)</h3>
            <div className={styles.chips}>
              <span>signal</span>
              <span>params</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>
            TanStack Query が渡す <code>signal</code> をそのまま apizel に流し、キャンセル可能な GET
            を書く最小形です。
          </p>
        </header>
        <CodeEditor
          filename="useUsers.ts"
          code={`
const useUsers = (role: string) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: ({ signal }) =>
      api.get<User[]>('/users', {
        params: { role },
        signal
      })
  })
}
          `}
        />
        <p className={styles.note}>
          No adapters, no wrappers. Just pass <code>signal</code>.
        </p>
      </div>

      {/* 2. With TanStack Query (Mutation) */}
      <div className={styles.exampleBlock} id="example-query-mutation">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>With TanStack Query (Mutation)</h3>
            <div className={styles.chips}>
              <span>json</span>
              <span>formdata</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>
            POST/PUT の基本。JSON送信と FormData 送信の “分岐” だけを押さえます。
          </p>
        </header>
        <CodeEditor
          filename="useCreateUser.ts"
          code={`
// JSON: Content-Type は自動付与
const mutation = useMutation({
  mutationFn: (newUser: UserDTO) => api.post('/users', newUser)
})

// FormData: Content-Type はブラウザに任せる
const upload = useMutation({
  mutationFn: (formData: FormData) => api.post('/upload', formData)
})
          `}
        />
        <p className={styles.note}>
          Keep mutations explicit: <code>api.post(path, body)</code>.
        </p>
      </div>

      {/* 3. Auth Token */}
      <div className={styles.exampleBlock} id="example-auth">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Auth Token</h3>
            <div className={styles.chips}>
              <span>getAccessToken</span>
              <span>shouldAttachToken</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>
            アクセストークンの付与を制御します。<code>Authorization: Bearer</code> ヘッダーは apizel
            が自動付与します。
          </p>
        </header>
        <CodeEditor
          filename="auth.ts"
          code={`
const api = apizel({
  getAccessToken: async () => await storage.getToken(),
  shouldAttachToken: (req) => !req.endpoint.includes('/auth/login')
})
          `}
        />
        <p className={styles.note}>Token rules belong to the app, not the client.</p>
      </div>

      {/* 4. Refresh on 401 */}
      <div className={styles.exampleBlock} id="example-refresh">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Refresh on 401</h3>
            <div className={styles.chips}>
              <span>refresh</span>
              <span>single-flight</span>
              <span>retry-once</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>
            401時に1度だけ <code>refresh</code> を試行。複数リクエストは{' '}
            <strong>single-flight</strong> で1つに合流します。
          </p>
        </header>
        <CodeEditor
          filename="refresh.ts"
          code={`
const api = apizel({
  refresh: async () => {
    const { token } = await api.post('/auth/refresh')
    return token // 自動的に retry に使用される
  },
  onRefreshFailed: () => {
    logout() // リフレッシュ失敗時のハンドリング
  }
})
          `}
        />
        <p className={styles.note}>
          Retry happens once. If it still fails, <code>HttpError</code> is thrown.
        </p>
      </div>
    </Section>
  )
}

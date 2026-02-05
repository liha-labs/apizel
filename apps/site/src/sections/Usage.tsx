import { CodeEditor, Section } from '../components'
import styles from './Usage.module.css'

export const Usage = () => {
  return (
    <Section
      id="usage"
      number="03"
      title="Usage"
      subTitle="実務の「困った」を解決する、逆引きリファレンス。"
    >
      {/* 1. Creating a client */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Creating a client</h3>
        <p className={styles.desc}>
          <code>apizel()</code> で共通設定を持つインスタンスを作成します。
        </p>
        <CodeEditor
          filename="client.ts"
          code={`
import { apizel } from '@liha-labs/apizel'

const api = apizel({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeoutMs: 10000,
})`}
        />
      </div>

      {/* 2. Request options */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Request options</h3>
        <CodeEditor
          filename="options.ts"
          code={`
await api.get('/users', {
  headers: { 'X-Project-ID': 'apizel' },
  params: { role: 'admin' },
  timeoutMs: 5000,
  signal: controller.signal // 外部からの手動中断
})`}
        />
      </div>

      {/* 3. Body Handling */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Body Handling</h3>
        <p className={styles.desc}>
          値の種類を判別し、適切な <code>Content-Type</code> を自動で設定します。
        </p>

        <div className={styles.bodyTable}>
          <div className={styles.bodyTableRow}>
            <div className={styles.bodyType}>
              <span className={styles.typeBadge}>JSON</span>
              <div className={styles.typeContent}>
                <code>Object</code> / <code>Array</code>
              </div>
            </div>
            <div className={styles.bodyArrow}>→</div>
            <div className={styles.bodyResult}>
              <strong>application/json</strong>
              <span>JSON.stringify されます。</span>
            </div>
          </div>

          <div className={styles.bodyTableRow}>
            <div className={styles.bodyType}>
              <span className={styles.typeBadge}>FormData</span>
              <div className={styles.typeContent}>
                <code>FormData</code>
              </div>
            </div>
            <div className={styles.bodyArrow}>→</div>
            <div className={styles.bodyResult}>
              <strong>(Multipart boundary)</strong>
              <span>ブラウザの自動設定に任せます。</span>
            </div>
          </div>

          <div className={styles.bodyTableRow}>
            <div className={styles.bodyType}>
              <span className={styles.typeBadge}>Others</span>
              <div className={styles.typeContent}>
                <code>Blob</code> / <code>string</code> ...
              </div>
            </div>
            <div className={styles.bodyArrow}>→</div>
            <div className={styles.bodyResult}>
              <strong>No transform</strong>
              <span>値をそのまま body に渡します。</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Query Params */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Query Params</h3>
        <CodeEditor
          filename="params.ts"
          code={`
// 配列はデフォルトで 'key=a&key=b' 形式に展開されます
await api.get('/search', {
  params: {
    tags: ['typescript', 'fetch'], // -> ?tags=typescript&tags=fetch
    active: true,                  // -> ?active=true
    page: 1                        // -> ?page=1
  }
})

// ※ ネストしたObject（ { a: { b: 1 } } ）は非対応です。
          `}
        />
      </div>

      {/* 5. Auth & Refresh */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Auth & Refresh</h3>
        <p className={styles.desc}>
          401エラー時に一度だけリフレッシュを試行する、実用的なフローを内蔵しています。
        </p>
        <CodeEditor
          filename="auth.ts"
          code={`
const api = apizel.create({
  auth: {
    getAccessToken: () => localStorage.getItem('token'),
    shouldAttachToken: (req) => !req.url.includes('/login'),

    // 複数のリクエストが同時に401になっても、実行は1回に絞られます（Single-flight）
    refresh: async () => {
      const { token } = await api.post('/refresh-token')
      localStorage.setItem('token', token)
    },
    onRefreshFailed: () => {
      window.location.href = '/login'
    }
  }
})`}
        />
      </div>

      {/* 6. Hooks */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Hooks (Observe only)</h3>
        <p className={styles.desc}>リクエストの前後にログや計測を差し込めます。</p>
        <CodeEditor
          filename="hooks.ts"
          code={`
const api = apizel.create({
  observe: {
    onRequest: (req) => console.log(\`Sending \${req.method} to \${req.url}\`),
    onResponse: (res) => trackMetric(res.url, res.status)
  }
})`}
        />
      </div>

      {/* 7. Errors */}
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Errors</h3>
        <div className={styles.errorStack}>
          <div className={styles.errorCard}>
            <div className={styles.errorHeader}>
              <span className={styles.errorBadge}>HttpError</span>
            </div>
            <div className={styles.errorContent}>
              <p>ステータスコード 4xx, 5xx の場合に投げられます。レスポンスの中身を保持します。</p>
            </div>
          </div>

          <div className={styles.errorCard}>
            <div className={styles.errorHeader}>
              <span className={styles.errorBadge}>AbortError</span>
            </div>
            <div className={styles.errorContent}>
              <p>
                タイムアウト、または手動の中断時に投げられます。これはサーバーエラーではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

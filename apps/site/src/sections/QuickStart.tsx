import { CodeEditor, Section } from '../components'
import styles from './QuickStart.module.css'

export const QuickStart = () => {
  const installCode = `pnpm add @liha-labs/apizel`

  const minimalCode = `
import { apizel } from '@liha-labs/apizel'

const api = apizel({
  baseURL: 'https://api.example.com'
})

// 即座にGET。レスポンスは自動でJSONパースされます
const data = await api.get('/status')
  `.trim()

  const typingCode = `
interface User {
  id: string
  name: string
}

// 戻り値に型を指定して型安全な開発を
const user = await api.get<User>('/me')
console.log(user.name)
  `.trim()

  const errorCode = `
import { HttpError } from '@liha-labs/apizel'

try {
  await api.get('/data', { timeoutMs: 3000 })
} catch (err) {
  if (err.name === 'AbortError') {
    // タイムアウトまたは手動の中断
    console.error('Request timed out')
  } else if (err instanceof HttpError) {
    // 4xx, 5xx ステータスエラー
    console.error('Server error:', err.status)
  }
}
  `.trim()

  return (
    <Section
      id="quickstart"
      number="02"
      title="Quick Start"
      subTitle="最小限のセットアップで、型安全かつ堅牢な通信環境を構築します。"
    >
      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 01</span>
          <h4>Install</h4>
          <p>
            標準として <code>pnpm</code> を推奨します。
          </p>
        </div>
        <CodeEditor
          code={`$ ${installCode}`}
          lang="bash"
          withHeader={false}
          filename="install"
        />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 02</span>
          <h4>Minimal Usage</h4>
          <p>クライアントを作成し、メソッドを呼ぶだけです。</p>
        </div>
        <CodeEditor code={minimalCode} filename="client.ts" />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 03</span>
          <h4>With Typing</h4>
          <p>ジェネリクスを使用して、DTOの型を適用します。</p>
        </div>
        <CodeEditor code={typingCode} filename="api.ts" />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 04</span>
          <h4>Error Handling</h4>
          <p>中断（Abort）とサーバーエラーを明確に分離してハンドリングします。</p>
        </div>
        <CodeEditor code={errorCode} filename="error.ts" />
      </div>

      <div className={styles.pitfall}>
        <h5>💡 落とし穴：Timeout は例外的な挙動です</h5>
        <p>
          <code>timeoutMs</code>{' '}
          による中断は、サーバーが返したエラー（HttpError）ではなく、ブラウザ標準の{' '}
          <strong>AbortError</strong> をスローします。
          「通信そのものが成立しなかった」のか「サーバーが拒否したのか」を型レベルで安全に区別するための設計です。
        </p>
      </div>
    </Section>
  )
}

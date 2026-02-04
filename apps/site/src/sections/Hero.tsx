import { CodeEditor } from '../components'
import { copyCmd } from '../utils'
import styles from './Hero.module.css'

export const Hero = () => {
  const installCmd = 'pnpm add @liha-labs/apizel'

  const sampleCode = `
import { apizel, type ApizelConfig } from '@liha-labs/apizel'

const config: ApizelConfig = {
  baseURL: 'https://api.example.com',
  getAccessToken: () => localStorage.getItem('token'),
  refresh: async () => {
    // refresh endpoint を叩いて新しい token を返す
    return 'new-token'
  },
}

const api = apizel(config)

const me = await api.get<{ id: string; name: string }>('/v1/me')

  `.trim()

  return (
    <div className={styles.heroWrapper}>
      <section className={styles.hero}>
        <div className={styles.left}>
          <div className={styles.badge}>Now in Preview</div>
          <h1 className={styles.title}>
            Thin Layer.
            <br />
            Big Clarity.
          </h1>
          <p className={styles.description}>
            Web標準の fetch をそのままに、型安全で快適な通信体験へ。apizel は “必要最低限” に絞った
            TypeScript 向け API クライアントです。
          </p>

          <div className={styles.installWrapper}>
            <div className={styles.pnpmBox}>
              <span className={styles.pnpmPrompt}>$</span>
              <code className={styles.pnpmCmd}>{installCmd}</code>
              <button
                className={styles.pnpmCopy}
                onClick={() => copyCmd(installCmd)}
                title="Copy command"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <a
              href="https://github.com/..."
              className={styles.githubBtn}
              target="_blank"
              rel="noreferrer"
            >
              <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className={styles.right}>
          <CodeEditor code={sampleCode} filename="main.ts" language="typescript" />
        </div>
      </section>
    </div>
  )
}

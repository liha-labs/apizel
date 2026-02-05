import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { copyCmd } from '../utils'
import styles from './CodeEditor.module.css'

type Props = {
  code: string
  filename?: string
  lang?: 'ts' | 'tsx' | 'js' | 'bash'
  withHeader?: boolean
}

export function CodeEditor({ code, filename, lang = 'ts', withHeader = true }: Props) {
  const [Highlighter, setHighlighter] = useState<ComponentType<any> | null>(null)
  const [style, setStyle] = useState<any>(null)

  useEffect(() => {
    const loadHighlighter = async () => {
      try {
        // 動的インポートにより、サーバーサイドでの評価を回避
        const { PrismAsyncLight: SyntaxHighlighter } = await import('react-syntax-highlighter')
        const { vscDarkPlus } = await import('react-syntax-highlighter/dist/esm/styles/prism')

        const [bash, js, tsx, ts] = await Promise.all([
          import('react-syntax-highlighter/dist/esm/languages/prism/bash').then(m => m.default),
          import('react-syntax-highlighter/dist/esm/languages/prism/javascript').then(m => m.default),
          import('react-syntax-highlighter/dist/esm/languages/prism/tsx').then(m => m.default),
          import('react-syntax-highlighter/dist/esm/languages/prism/typescript').then(m => m.default),
        ])

        SyntaxHighlighter.registerLanguage('ts', ts)
        SyntaxHighlighter.registerLanguage('tsx', tsx)
        SyntaxHighlighter.registerLanguage('js', js)
        SyntaxHighlighter.registerLanguage('bash', bash)

        setHighlighter(() => SyntaxHighlighter)
        setStyle(vscDarkPlus)
      } catch (e) {
        console.error('Failed to load syntax highlighter', e)
      }
    }

    loadHighlighter()
  }, [])

  const trimmedCode = useMemo(() => code.replace(/^\s*\n+|\n+\s*$/g, ''), [code])

  const copy = useCallback(async () => {
    copyCmd(trimmedCode)
  }, [trimmedCode])

  return (
    <div className={styles.root}>
      {withHeader && (
        <div className={styles.header}>
          <span className={styles.filename}>{filename ?? lang}</span>

          <button type="button" className={styles.copyButton} onClick={copy} aria-label="Copy code">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.copyIcon}
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
        </div>
      )}

      {!withHeader && (
        <button
          type="button"
          className={`${styles.copyButton} ${styles.copyButtonFloating}`}
          onClick={copy}
          aria-label="Copy code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.copyIcon}
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>
      )}

      {Highlighter && style ? (
        <Highlighter
          language={lang}
          style={style}
          PreTag="div"
          wrapLongLines
          customStyle={{
            background: 'transparent',
            paddingTop: 12.5,
            paddingBottom: 12.5,
            paddingLeft: 16,
            paddingRight: withHeader ? 16 : 48,
            margin: 0,
          }}
          codeTagProps={{ className: styles.code }}
          className={styles.pre}
        >
          {code.trim()}
        </Highlighter>
      ) : (
        <pre
          className={styles.pre}
          style={{
            paddingTop: 12.5,
            paddingBottom: 12.5,
            paddingLeft: 16,
            paddingRight: withHeader ? 16 : 48,
          }}
        >
          <code className={styles.code}>{code.trim()}</code>
        </pre>
      )}
    </div>
  )
}

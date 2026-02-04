import { Section } from '../components'
import styles from './Introduction.module.css'

export const Introduction = () => {
  return (
    <Section
      id="introduction"
      number="01"
      title="Introduction"
      subTitle="Web標準のfetchを最大限に尊重しつつ、実務で不可欠な機能を補完する軽量HTTPクライアント。"
    >
      <div className={styles.leadBlock}>
        <h3>What is apizel?</h3>
        <p>
          apizel（アピゼル）は、Web標準の <code>fetch</code> APIを最優先に考え、
          Axiosのような巨大な抽象化を避けつつ、型安全で予測可能な開発体験を提供します。
        </p>
      </div>

      <div className={styles.philosophyGrid}>
        <div className={styles.philosophyColumn}>
          <h4 className={styles.label}>Design goals</h4>
          <ul className={styles.list}>
            <li>
              <span className={styles.itemTitle}>fetch-first</span>
              <span className={styles.itemDesc}>ラッパーではなく、fetchを拡張する考え方</span>
            </li>
            <li>
              <span className={styles.itemTitle}>minimal</span>
              <span className={styles.itemDesc}>依存ゼロ。バンドルサイズへの影響を最小限に</span>
            </li>
            <li>
              <span className={styles.itemTitle}>standards</span>
              <span className={styles.itemDesc}>URLSearchParams等の標準に準拠</span>
            </li>
            <li>
              <span className={styles.itemTitle}>TS-friendly</span>
              <span className={styles.itemDesc}>徹底した型定義による開発体験の向上</span>
            </li>
          </ul>
        </div>

        <div className={styles.philosophyColumn}>
          <h4 className={`${styles.label} ${styles.danger}`}>Non-goals</h4>
          <ul className={styles.list}>
            <li>
              <span className={styles.itemTitle}>自動リトライ</span>
              <span className={styles.itemDesc}>401 refresh以外は対象外</span>
            </li>
            <li>
              <span className={styles.itemTitle}>型検証</span>
              <span className={styles.itemDesc}>zod等のバリデーションは利用側で実装</span>
            </li>
            <li>
              <span className={styles.itemTitle}>ネストしたparams</span>
              <span className={styles.itemDesc}>
                <code>{`{ a: { b: 1 } }`}</code> のような形式は非対応
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.featureSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.subTitle}>Features</h3>
          <p className={styles.subLead}>標準機能をコアに、開発者の「欲しい」を薄く実装。</p>
        </div>
        <div className={styles.featureTable}>
          {[
            { name: 'JSON / FormData', desc: 'Content-Typeを賢く自動判別。' },
            { name: 'timeout', desc: 'AbortSignalをベースとした秒数指定。' },
            { name: 'repeat array', desc: 'クエリ配列を key=a&key=b へ展開。' },
            { name: 'auth refresh', desc: '401時のトークン再取得フローを内蔵。' },
            { name: 'observe hooks', desc: 'onRequest / onResponse の観測。' },
            { name: 'single-flight', desc: '重複する更新リクエストを一本化。' },
          ].map((f) => (
            <div key={f.name} className={styles.featureItem}>
              <span className={styles.featureName}>{f.name}</span>
              <span className={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.compSection}>
        <h3 className={styles.subTitle}>Compatibility</h3>
        <div className={styles.compRows}>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>Environment</div>
            <div className={styles.compValues}>
              <span className={styles.compTag}>Browser (Modern)</span>
              <span className={styles.compTag}>Node.js v18+</span>
              <span className={styles.compTag}>React Native</span>
            </div>
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>Integration</div>
            <div className={styles.compValues}>
              <span className={styles.compTag}>TanStack Query</span>
              <span className={styles.compTag}>SWR</span>
              <span className={styles.compTag}>Signal-based libs</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

import { ENV } from '../config'
import styles from './Footer.module.css'

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* 背景の巨大ロゴ */}
      <div className={styles.backgroundText}>{ENV.PACKAGE.NAME}</div>

      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* 左：ブランド */}
          <div className={styles.brand}>
            <h2 className={styles.logo}>{ENV.PACKAGE.NAME}</h2>
            <p className={styles.tagline}>TypeScript のための薄い fetch ラッパー。</p>
            <p className={styles.catchphrase}>標準の fetch に、ちょうどいい薄皮。</p>
          </div>

          {/* 右：リンク */}
          <div className={styles.linksContainer}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Resource</h4>
              <nav className={styles.nav}>
                <a href="#introduction">Docs</a>
                <a href={ENV.RESOURCE.GITHUB} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={ENV.RESOURCE.NPM} target="_blank" rel="noreferrer">
                  npm
                </a>
              </nav>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Community</h4>
              <nav className={styles.nav}>
                <a href={ENV.COMMUNITY.DISCORD} target="_blank" rel="noreferrer">
                  Discord
                </a>
                <a href={ENV.COMMUNITY.X} target="_blank" rel="noreferrer">
                  X (Twitter)
                </a>
              </nav>
              <p className={styles.communityCta}>Questions? Ideas? Join the community.</p>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.meta}>
            <span>© 2026 Liha Labs. Released under the MIT License.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

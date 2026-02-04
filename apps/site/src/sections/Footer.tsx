import styles from './Footer.module.css'

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* 背景の巨大ロゴ */}
      <div className={styles.backgroundText}>apizel</div>

      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* 左：ブランド */}
          <div className={styles.brand}>
            <h2 className={styles.logo}>apizel</h2>
            <p className={styles.tagline}>TypeScript のための薄い fetch ラッパー。</p>
            <p className={styles.catchphrase}>標準の fetch に、ちょうどいい薄皮。</p>
          </div>

          {/* 右：リンク */}
          <div className={styles.linksContainer}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Resource</h4>
              <nav className={styles.nav}>
                <a href="#introduction">Docs</a>
                <a href="https://github.com/liha-labs/apizel" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/@liha/apizel"
                  target="_blank"
                  rel="noreferrer"
                >
                  npm
                </a>
              </nav>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Community</h4>
              <nav className={styles.nav}>
                <a href="https://discord.gg/example" target="_blank" rel="noreferrer">
                  Discord
                </a>
                <a href="https://x.com/lihalabs" target="_blank" rel="noreferrer">
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

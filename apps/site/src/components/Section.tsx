import { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id: string
  title: string
  subTitle?: string
  number?: string
  children: ReactNode
}

export const Section = ({ id, title, subTitle, number, children }: SectionProps) => {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleUnit}>
          {/* 番号が存在する場合、タイトル左側にハング（吊り下げ）される */}
          {number && <span className={styles.number}>/ {number}</span>}
          <h2 className={styles.title}>{title}</h2>
        </div>
        {subTitle && <p className={styles.subTitle}>{subTitle}</p>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

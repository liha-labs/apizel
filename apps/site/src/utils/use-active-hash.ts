import { useEffect, useState } from 'react'

export const useActiveHash = (itemIds: string[]) => {
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id)
          }
        })
      },
      {
        // 画面の少し上（20%付近）に来た時にアクティブ判定する
        rootMargin: '-20% 0% -70% 0%',
        threshold: 0,
      },
    )

    itemIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [itemIds])

  return activeHash
}

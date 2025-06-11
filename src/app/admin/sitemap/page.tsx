import React from 'react'
import { SitemapFetcher } from '@/components/SitemapFetcher/SitemapFetcher'
import styles from './page.module.scss'

const page = () => {
  return (
    <div className={styles.wrapper}>
      <SitemapFetcher />
    </div>
  )
}

export default page
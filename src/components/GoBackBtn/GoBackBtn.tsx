import React from 'react'
import styles from './GoBackBtn.module.scss'
import Link from 'next/link'

type Props = {
    href: string
    text: string
}

export const GoBackBtn = (props: Props) => {
  return (
    <Link href={props.href} className={styles.backLink}>
    <span className={styles.arrow}>&larr;</span>
    <span className={styles.text}>{props.text}</span>
  </Link>
  )
}

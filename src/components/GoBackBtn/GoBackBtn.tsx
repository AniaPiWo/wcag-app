'use client'
  import React from 'react'
import styles from './GoBackBtn.module.scss'
import Link from 'next/link'
import { CgArrowLongLeft } from "react-icons/cg";

type Props = {
    href: string
    text: string
}

export const GoBackBtn = (props: Props) => {
  return (
    <Link href={props.href} className={styles.backLink}>
    <span className={styles.arrow}><CgArrowLongLeft /></span>
    <span className={styles.text}>{props.text}</span>
  </Link>
  )
}

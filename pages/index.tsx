import { useEffect, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

type IndexProps = {
	wildcard: string;
}

export default function Home(props: IndexProps) {
	const [wildcard, setWildcard] = useState('')
	useEffect(() => {
		setWildcard(window.location.hostname.split('.')[0])
	}, [])
	return (
		<div className={styles.container}>
			<Head>
				<title>Radio</title>
				<meta name="description" content="Radio" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<p>props.wildcard {props.wildcard}</p>
				<p>wildcard {wildcard}</p>
				<r4-channel slug={wildcard}></r4-channel>
			</main>

			<footer className={styles.footer}>
				radio4000 radio profile
			</footer>
		</div>
	)
}

export async function getServerSideProps(context: any) {
	let parts = context.req.headers.host.split('.')
	if (
		parts.length === 2
		&& parts.indexOf(process.env.ROOT_DOMAIN) > -1
	) {
		const wildcard = parts.filter((part: string) => {
			return part !== process.env.ROOT_DOMAIN
		})[0]
		return { props: { wildcard } }
	} else {
		return { props: { } }
	}
}

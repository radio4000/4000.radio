import '../styles/globals.css'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'r4-channel': { slug: string },
			'r4-title': { size?: string },
		}
	}
}


export default function App({ Component, pageProps }: AppProps) {
	useEffect(() => {
		// @ts-ignore
		import('@radio4000/components')
	});
	return <Component {...pageProps} />
}

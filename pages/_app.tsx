import '../styles/globals.css'
import {useEffect} from 'react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
	useEffect(() => {
			// @ts-ignore
			import('@radio4000/components')
	});
return <Component {...pageProps} />
}

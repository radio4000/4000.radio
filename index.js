export default class R4Radio extends HTMLElement {
	static get observedAttributes() {
		return ['hostname']
	}
	/* the hostname is the root domain,
		 on which the r4 radio profile app is running */
	get hostname() {
		return this.getAttribute('hostname')
	}
	/* the slug comes from the wildcard subdomain */
	get slug() {
		let parts = window.location.hostname.split('.')
		if (
			parts.length === 2
			&& parts.indexOf(this.hostname) > -1
		) {
			const wildcard = parts.filter((part) => {
				return part !== this.hostname
			})[0]
			return wildcard
		} else {
			return null
		}
	}

	connectedCallback() {
		if (this.slug) {
			this.renderChannel(this.slug)
		} else {
			this.renderHome()
		}
	}

	renderChannel(slug) {
		this.innerHTML = ''
		const $channel = document.createElement('r4-page-channel')
		$channel.setAttribute('slug', slug)
		$channel.setAttribute('limit', 1000)
		$channel.setAttribute('pagination', true)
		$channel.setAttribute('origin', window.location.origin)
		this.append($channel)
	}
	renderHome() {
		this.innerHTML = ''
		const $info = document.createElement('article')
		$info.innerHTML = `Welcome to <a href="https://radio4000.com"><r4-title></r4-title></a>`
		this.append($info)
	}
}

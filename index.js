export default class R4Radio extends HTMLElement {
	static get observedAttributes() {
		return ['hostname', 'slug']
	}
	/* the hostname is the root domain,
		 on which the r4 radio profile app is running */
	get hostname() {
		return this.getAttribute('hostname')
	}
	/* the slug comes from the wildcard subdomain */
	get slug() {
		if (!window.location.hostname.endsWith('.' + this.hostname)) {
			return ''
		}
		const subdomains = window.location.hostname.replace('.' + this.hostname, '').split('.')
		const wildcard = subdomains[subdomains.length - 1]
		return wildcard
	}

	constructor() {
		super()
	}

	async connectedCallback() {
		await this.importComponents()
		if (this.slug) {
			this.renderChannel(this.slug)
		} else {
			this.renderHome()
		}
	}
	async importComponents() {
		const Components = await import('https://cdn.jsdelivr.net/npm/@radio4000/components@0.0.26/dist/index.js')
		console.log('Components imported', Components)
	}

	renderChannel(slug) {
		this.innerHTML = ''
		const $app = document.createElement('r4-app')
		$app.setAttribute('href', window.location.origin)
		$app.setAttribute('channel', slug)
		this.append($app)
	}
	renderHome() {
		this.innerHTML = ''
		const $info = document.createElement('article')
		$info.innerHTML = `Welcome to <a href="https://radio4000.com"><r4-title></r4-title></a>`
		this.append($info)
	}
}

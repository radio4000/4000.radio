export default class R4Radio extends HTMLElement {
	static get observedAttributes() {
		return ['hostname', 'channel', 'components-url', 'single-channel']
	}
	/* the cdn url to load the components from */
	get componentsUrl() {
		return this.getAttribute('components-url')
	}
	/* the r4-app is instanciated to browse/play 1 channel only  */
	get singleChannel() {
		return this.getAttribute('single-channel') === 'true'
	}
	/* the hostname is the root domain,
		 on which the r4 radio profile app is running */
	get hostname() {
		return this.getAttribute('hostname')
	}
	/* the slug comes from the wildcard subdomain */
	get channel() {
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
		await this.importStyles()
		await this.importComponents()
		if (this.channel) {
			this.setAttribute('channel', this.channel)
			this.renderChannel(this.channel)
		} else {
			this.renderHome()
		}
	}
	async importStyles() {
		/* `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@radio4000/components@0.0.29/styles/index.css" />` */
		const $stylesLink = document.createElement('link')
		$stylesLink.setAttribute('rel', 'stylesheet')
		$stylesLink.setAttribute('href', `${this.componentsUrl}/styles/index.css`)
		document.querySelector('head').append($stylesLink)
		console.log('CSS styles imported and inserted', $stylesLink)
	}
	async importComponents() {
		const Components = await import(`${this.componentsUrl}/dist/index.js`)
		console.log('Javascript web-components imported', Components)
	}

	renderChannel(slug) {
		this.innerHTML = ''
		const $app = document.createElement('r4-app')
		$app.setAttribute('href', window.location.origin)
		$app.setAttribute('channel', slug)
		this.singleChannel && $app.setAttribute('single-channel', this.singleChannel)
		this.append($app)
	}
	renderHome() {
		this.innerHTML = ''
		const $info = document.createElement('article')
		$info.innerHTML = `Welcome to <a href="https://radio4000.com"><r4-title></r4-title></a>`
		this.append($info)
	}
}

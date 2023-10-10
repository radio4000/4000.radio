export default class R4Radio extends HTMLElement {
	static get observedAttributes() {
		return ["hostname", "channel", "components-url", "single-channel"];
	}
	/* the cdn url to load the components from */
	get componentsUrl() {
		return this.getAttribute("components-url");
	}
	/* the r4-app is instanciated to browse/play 1 channel only  */
	get singleChannel() {
		return this.getAttribute("single-channel") === "true";
	}
	/* the hostname is the root domain,
		 on which the r4 radio profile app is running */
	get hostname() {
		return this.getAttribute("hostname") || window.location.hostname;
	}
	get location() {
		const { origin, protocol } = window.location;
		return new URL(`${protocol}//${this.hostname || origin}`);
	}
	get allowedOrigins() {
		return [this.location.origin];
	}
	/* the slug comes from the wildcard subdomain */
	get slugInfo() {
		const pathname = window.location.pathname.split("/")[1];
		const subdomains = window.location.host
			.replace("." + this.hostname, "")
			.split(".");
		const wildcard = subdomains[subdomains.length - 1];
		const subdomain = this.hostname === wildcard ? null : wildcard;
		return {
			subdomain,
			pathname,
		};
	}
	get channel() {
		const { subdomain, pathname } = this.slugInfo;
		const attr = this.getAttribute("channel");
		return subdomain || pathname || attr;
	}

	async connectedCallback() {
		await this.importStyles();
		const { lib: { sdk } = {} } = await this.importComponents();
		const { pathname, subdomain } = this.slugInfo;
		if (pathname) {
			this.redirectToSubdomain(pathname);
		}
		if (!this.channel) {
			return this.renderHome();
		} else {
			this.setAttribute("channel", this.channel);
			const { data: channelData } = await sdk.channels.readChannel(
				this.channel,
			);
			if (channelData) {
				return this.renderChannel(this.channel);
			} else {
				const { data: firebaseChannelData } =
					await sdk.channels.readFirebaseChannel(this.channel);
				if (firebaseChannelData) {
					return this.renderFirebaseChannel(firebaseChannelData);
				} else {
					return this.renderNoChannel(this.channel);
				}
			}
		}
	}

	redirectToSubdomain(channelSlug) {
		const { host, protocol } = this.location;
		const newUrl = `${protocol}//${channelSlug}.${host}`;
		document.location.href = newUrl;
	}

	async importStyles() {
		/* `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@radio4000/components@0.0.29/dist/r4.css" />` */
		const $stylesLink = document.createElement("link");
		$stylesLink.setAttribute("rel", "stylesheet");
		$stylesLink.setAttribute("href", `${this.componentsUrl}/dist/r4.css`);
		document.querySelector("head").append($stylesLink);
		console.log("CSS styles imported and inserted", $stylesLink);
	}
	async importComponents() {
		const url = `${this.componentsUrl}/dist/r4.js`;
		const Components = await import(url);
		console.log("Javascript web-components imported", Components);
		if (Components && Components.default) {
			return Components.default;
		}
		return {};
	}

	renderHome() {
		this.innerHTML = "";

		const $logo = document.createElement("r4-favicon");
		const $info = document.createElement("r4-radio-home");

		const $channelSearch = document.createElement("r4-channel-search");
		$channelSearch.setAttribute("href", this.location.origin);

		const $titleText = document.createElement("h1");
		const $titleLink = document.createElement("a");
		$titleLink.setAttribute("href", this.origin);
		$titleLink.innerText = `<user>.${this.hostname}`;
		$titleText.append($titleLink);

		const $infoLink = document.createElement("a");
		$infoLink.setAttribute("href", "https://radio4000.com");
		$infoLink.innerText = "radio4000.com/<user>";

		const $section = document.createElement("section");
		$section.append($logo);
		$section.append($titleText);
		$section.append($infoLink);

		$info.append($section);
		$info.append($channelSearch);
		this.append($info);
	}

	renderChannel(slug) {
		this.innerHTML = "";
		const $app = document.createElement("r4-app");
		$app.setAttribute("href", window.location.origin);
		$app.setAttribute("channel", slug);
		this.singleChannel &&
			$app.setAttribute("single-channel", this.singleChannel);
		this.append($app);
	}
	renderFirebaseChannel(channel) {
		this.innerHTML = "";
		const $app = document.createElement("r4-app-firebase");
		$app.setAttribute("href", window.location.origin);
		$app.setAttribute("channel", channel.slug);
		this.append($app);
	}
	renderNoChannel() {
		this.innerHTML = "";
		const $info = document.createElement("r4-radio-404");
		$info.innerText = `404 - No content for channel ${this.channel}`;
		this.append($info);
	}
}

class R4FirebaseApp extends HTMLElement {
	connectedCallback() {
		this.render(this.getAttribute("channel"));
	}
	render(slug) {
		/* <iframe src="https://api.radio4000.com/embed?slug=good-time-radio"></iframe> */
		const iframeSrc = `https://api.radio4000.com/embed?slug=${slug}`;
		const $iframe = document.createElement("iframe");
		$iframe.setAttribute("frameborder", 0);
		$iframe.setAttribute("src", iframeSrc);
		$iframe.setAttribute("width", "100%");
		$iframe.setAttribute("height", "100%");

		const $dialog = document.createElement("r4-dialog");
		const $dialogSlot = document.createElement("div");
		$dialogSlot.setAttribute("slot", "dialog");

		const $dialogMessage = document.createElement("p");
		$dialogMessage.innerText = "Welcome to ";
		const $dialogLink = document.createElement("a");
		$dialogLink.setAttribute("href", `https://radio4000.com/${slug}`);
		$dialogLink.innerText = `${slug}@r4`;
		$dialogMessage.append($dialogLink);

		const $dialogWarning = document.createElement("p");
		$dialogWarning.innerHTML =
			'This radio channel has not yet migrated to the new Radio4000 network, still in beta version. Check <a href="https://beta.radio4000.com">beta.radio4000.com</a>.';

		$dialogSlot.append($dialogMessage);
		$dialogSlot.append($dialogWarning);

		$dialog.append($dialogSlot);

		this.append($iframe);
		this.append($dialog);
		$dialog.setAttribute("visible", true);
	}
}
customElements.define("r4-app-firebase", R4FirebaseApp);

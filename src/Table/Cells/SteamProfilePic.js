import {BaseComponent} from '../BaseComponent'

export class SteamProfilePic extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let url = this.props.steamProfilePic || './not_found.gif'
		let visibility = 'hidden'
		if (url !== './not_found.gif') {
			visibility = 'visible'
		}

		return this.html`<td><img src="${url}" class="steamProfilePic" style="${{visibility: visibility}}"></td>`
	}
}


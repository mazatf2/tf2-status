import {BaseComponent} from '../BaseComponent'

export class SteamIDLinks extends BaseComponent {
	constructor(props, data) {
		super(props, data)
	}

	render() {
		const steam64 = this.props.steamID64
		const steam3 = this.props.steamID3
		const steam2 = this.props.steamID2

		const url = 'https://www.google.fi/search?q='

		return this.html`
			<td>
				<p style="text-align: right"><a href=${url + steam64}>${steam64}</a></p>
				<p style="text-align: right"><a href=${url + steam3}>${steam3}</a></p>
				<p style="text-align: right"><a href=${url + steam2}>${steam2}</a></p>
			</td>`
	}
}

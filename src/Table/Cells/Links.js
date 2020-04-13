import hyperHTML from 'hyperhtml';

import {BaseComponent} from '../BaseComponent'

export class Links extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let steamID64 = this.props.steamID64
		let steamID3 = this.props.steamID3
		let content = []

		if (this.props.ETF2LProfileID) {
			let url = `https://etf2l.org/forum/user/${this.props.ETF2LProfileID}`
			content.push(hyperHTML.wire()`<p><a href="${url}">ETF2L</a></p>`)
		} else {
			let url = `http://etf2l.org/search/${steamID64}`
			content.push(hyperHTML.wire()`<p><a href="${url}" style="text-decoration: line-through">ETF2L</a></p>`)
		}

		let ugcUrl = `https://www.ugcleague.com/playersearch.cfm?steamid=&steamid32=&steamid64=${steamID64}&player_name=&submit=Find+Players&results=`
		content.push(hyperHTML.wire()`<p><a href="${ugcUrl}">UGC</a></p>`)

		let eseaUrl = `https://play.esea.net/index.php?s=search&query=${steamID3}&source=users`
		content.push(hyperHTML.wire()`<p><a href="${eseaUrl}">ESEA</a></p>`)

		return this.html`<td>${content}</td>`
	}
}

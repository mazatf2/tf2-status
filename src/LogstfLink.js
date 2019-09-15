import {BaseComponent} from './BaseComponent'

export class LogstfLink extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let url = `https://logs.tf/search/player?s=${this.props.steamID64}`
		return this.html`<td><a href="${url}">Logs.tf</a></td>`
	}
}

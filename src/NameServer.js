import {BaseComponent} from './BaseComponent'

export class NameServer extends BaseComponent {
	constructor(props) {
		super(props)
	}

	getBanStatus(ban) {
		const time = new Date(ban.end * 1000) - new Date()
		const sign = Math.sign(time)

		if (sign === 1) {
			return 'Active'
		} else {
			return 'Expired'
		}
	}

	render() {
		let url = `http://steamcommunity.com/profiles/${this.props.steamID64}`

		return this.html`
			<td>
				<a href="${url}">${this.props.nameServer}</a>
				${this.props.bans.map((ban) => hyperHTML.wire(ban)`
					<p>
						${this.getBanStatus(ban)} ban: ${ban.reason}
					</p>
				`,)}
			</td>`
	}
}

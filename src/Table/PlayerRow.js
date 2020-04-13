import hyper from 'hyperhtml'
import {SteamProfilePic} from './Cells/SteamProfilePic'
import {NameServer} from './Cells/NameServer'
import {Etf2l} from './Cells/Etf2l'
import {SteamIDLinks} from './Cells/SteamIDLinks'
import {Links} from './Cells/Links'
import {LogstfLink} from './Cells/LogstfLink'
import {Teams} from './Cells/Teams'
import {GamesPlayed6on6} from './Cells/GamesPlayed6on6'
import {GamesPlayedHL} from './Cells/GamesPlayedHL'
import {GamesPlayedRest} from './Cells/GamesPlayedRest'

export class PlayerRow extends hyper.Component {
	constructor(player) {
		super().player = player
		this.state = {player: player}
	}

	onconnected() {
		this.player.fetchInfo().then(i => {
			this.setState({player: i})
		}).then(() => {
			this.player.fetchResults().then((i) => {
				this.setState({player: i})
			})
		}).catch(e => {
			console.error(e)
		})
	}

	render() {
		const player = this.state.player
		return this.html`
			<tr onconnected=${this}>
				${new SteamProfilePic(player)}
				${new NameServer(player)}
				${new Etf2l(player)}
				${new SteamIDLinks(player)}
				${new Links(player)}
				${new LogstfLink(player)}
				${new Teams(player)}
				${new GamesPlayed6on6(player)}
				${new GamesPlayedHL(player)}
				${new GamesPlayedRest(player)}
			</tr>		
`
	}
}

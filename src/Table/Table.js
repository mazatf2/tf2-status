import {BaseComponent} from './BaseComponent'
import hyperHTML from 'hyperhtml'
import {PlayerRow} from './PlayerRow'


export class Table extends BaseComponent {
	constructor(props) {
		super(props)

		this.state = {players: this.props.players || {}}
		this.rows = []

		//['steamProfilePic', 'nameServer', 'nameETF2L', 'country', 'links', 'logstfLink', 'teams', 'gamesPlayed6on6', 'gamesPlayedHL', 'gamesPlayedRest']
		this.tableHead = hyperHTML.wire()`
		<tr>
			<td></td>
			<td>Nickname</td>
			<td>ETF2L</td>
			<td></td>
			<td></td>
			<td></td>
			<td>Teams</td>
			<td>6on6 played</td>
			<td>HL played</td>
			<td>Rest played</td>
		</tr>`
	}

	editPlayers(players) {
		this.state.players = players || {}
	}

	render() {
		let data = this.state.players
		let rows = []
		let tableHead = this.tableHead

		let playerList = Object.values(data).filter(function() {
			return true
		})

		return this.html`
			<div class="table-responsive">
				<table align="center" class="table">
					<thead>${tableHead}</thead>
					<tbody>
						${playerList.map(player => PlayerRow.for(player))}
					</tbody>
				</table>
			</div>`
	}
}

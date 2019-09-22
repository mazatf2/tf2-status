import hyperHTML from 'hyperhtml'
import Router from 'hyperhtml-app'
import {BaseComponent} from './BaseComponent'
import {SteamProfilePic} from './SteamProfilePic'
import {NameServer} from './NameServer'
import {Etf2l} from './Etf2l'
import {SteamIDLinks} from './SteamIDLinks'
import {Links} from './Links'
import {LogstfLink} from './LogstfLink'
import {Teams} from './Teams'
import {GamesPlayed6on6} from './GamesPlayed6on6'
import {GamesPlayedHL} from './GamesPlayedHL'
import {GamesPlayedRest} from './GamesPlayedRest'
import {statusRE, steamIDRE} from './shared-regex'

const SteamID = require('steamid')

let api_request_rate_ms = 200
let players = {}
let playerID = 0

class Player {
	constructor(params) {
		params = params || {}
		let steamID = new SteamID(params.steamID)

		this.playerID = playerID
		this.steamID64 = steamID.getSteamID64()
		this.steamID2 = steamID.getSteam2RenderedID()
		this.steamID3 = steamID.getSteam3RenderedID()
		this.nameServer = params.nameServer || {}
		this.steamProfilePic = ''
		this.nameETF2L = ''
		this.country = ''
		this.ETF2LProfileID = ''
		this.bans = []
		this.teams = []
		this.played6on6 = []
		this.playedHL = []
		this.playedRest = []
		this.results = []

		players[this.playerID] = this
		playerID++
	}
}

function main(logLines) {
	players = {}
	playerID = 0
	let wait = api_request_rate_ms

	logLines = logLines || ''
	logLines = logLines.split(/\r\n|\n/)

	for (let i of logLines) {
		if (i.match(statusRE)) {
			let currentLine = i
			let result = statusRE.exec(currentLine)

			let nameServer = result[1]
			let steamID = result[2]

			let player = new Player({nameServer: nameServer, steamID: steamID})
		}

		renderTable()
	}

	Object.values(players).forEach(function(i) {
		let id64 = i.steamID64 //this needs to be 'let' because scope

		setTimeout(() => {
			fetch(`http://api.etf2l.org/player/${id64}.json`)
				.then(function(response) {
					response.json()
						.then((json)=>{
							if (json.status && json.status.message === 'OK' && json.player) {
								let nameETF2L = json.player.name
								let country = json.player.country
								i.nameETF2L = nameETF2L
								i.country = country
								i.ETF2LProfileID = json.player.id
								i.steamProfilePic = json.player.steam.avatar
								i.bans = json.player.bans || []
								i.teams = json.player.teams

								i.played6on6 = []
								i.playedHL = []
								i.playedRest = []

								getResults(id64, 1, i)
								renderTable()
							}
						})
				})
				.catch(function(error) {
					console.log(error)
				})
		}, (wait += api_request_rate_ms))
	})
}

function getResults(id64, pageID, player) {
	let wait = api_request_rate_ms

	setTimeout(() => {
		fetch(`http://api.etf2l.org/player/${id64}/results/${pageID}.json?since=0&per_page=100`)
			.then(function(response) {
				response.json()
					.then((json)=>{

						if (json.status && json.status.message === 'OK' && json.results) {
							let results = json.results
							player.results = player.results.concat(results)

							for (let i of results) {
								let type = i.competition.type //6on6, 1v1, HL

								if (type === '6on6') {
									player.played6on6.push(i)
								} else if (type === 'Highlander') {
									player.playedHL.push(i)
								} else {
									player.playedRest.push(i)
								}
							}

							renderTable()

							let page = json.page
							if (page.next_page_url) {
								pageID += 1
								getResults(id64, pageID, player)
							}
						}
					})
			})
			.catch(function(error) {
				console.log(error)
			})
	}, (wait += api_request_rate_ms))
}

function renderTable() {
	if (!table) {
		table = new Table({players: players})
		hyperHTML(tableContainer)`${table}`
	} else {
		table.editPlayers(players)
		table.render()
	}
}

class TextArea extends BaseComponent {
	constructor(props) {
		super(props)
		this.state = {value: ''}

		this.init()
	}
	init() {
		let hash = window.location.hash || ''
		if (hash && hash.length > 1) {
			hash = hash.substring(1, hash.length) //del #
			let tuples = hash.split(',', 32 * 3)

			if (tuples[tuples.length] === ',') {
				tuples.splice(tuples.length - 1, 1)
			}
			for (let i = 0; i < tuples.length; i += 2) {
				let steamID = tuples[i + 1]
				if (steamID && steamID.match(steamIDRE)) {
					let name = decodeURI(tuples[i]).substr(0, 32)
					name = `"${name}"`.padEnd(32, ' ')
					let result = `#  0 ${name} [${steamID}]`

					this.state.value += '\r\n' + `#  0 ${name} [${steamID}]`
				}
			}
		}
	}

	onclick() {
		main(this.state.value)
	}

	oninput() {
		this.state.value = document.querySelector('#input').value

		let lines = this.state.value.split(/\r\n|\n/)

		let newHash = ''
		lines.forEach((i) => {
			if (i.match(statusRE)) {
				let result = statusRE.exec(i)

				let nameServer = result[1]
				let steamID = result[2].replace(/[\[|\]]/g, '')
				newHash += `${nameServer},${steamID},`
			}
		})

		if (newHash[newHash.length - 1] === ',') {
			newHash = newHash.slice(0, -1)
		}
		window.location.hash = newHash
	}
	render() {
		return this.html`
			<textarea id="input" placeholder="" rows="16" cols="80" oninput=${this}>${this.state.value}</textarea>
			<br>
			<br>
			<input type="button" onclick=${this} value="Check" class="btn btn-primary btn-lg ">
		`
	}
}

class Table extends BaseComponent {
	constructor(props) {
		super(props)

		this.state = {players: this.props.players || {}}

		this.textArea = new TextArea({})
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

	editPlayers(players){
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
			<p class="App-intro">
			Copy the <code>status</code> console command output, from TF2, into the box below:
			</p>
			<div>
				${this.textArea}
			</div>
			<br>
			<div class="table-responsive">
				<table align="center" class="table">
					<thead>${tableHead}</thead>
					<tbody>
						${playerList.map(
							(player) => hyperHTML.wire(player)`
								<tr>
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
						`,
						)}
					</tbody>
				</table>
			</div>`
	}
}

let table
class FrontPage extends hyperHTML.Component {
	constructor() {
		super()
		this.table = new Table({players: players})
		table = this.table
	}
	render() {
		return this.html`${this.table}`
	}
}

const router = Router()
let frontPage = new FrontPage()

let path = window.location.pathname
let tableContainer = document.querySelector('#container')

router.get(path, (a) => {
	hyperHTML(tableContainer)`${frontPage}`
})

router.navigate(path)

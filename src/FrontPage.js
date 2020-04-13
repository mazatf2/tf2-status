import hyperHTML from 'hyperhtml'
import {TextArea} from './TextArea'
import {Table} from './Table/Table'
import {statusRE, steamIDRE} from './shared-regex'
import {Player} from './Player'

let api_request_rate_ms = 200
let players = {}
let playerID = 0

const parseLogLines = (logLines, updatePlayers) => {
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

			let player = new Player({
				nameServer: nameServer,
				steamID: steamID,
				playerID: playerID,
				updatePlayers: updatePlayers,
			})
			players[playerID] = player
			playerID++
		}
	}
	return players
}

const readHash = () => {
	let hash = window.location.hash || ''
	let string = ''

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

				string += '\r\n' + `#  0 ${name} [${steamID}]`
			}
		}
	}
	return string
}

const updateHash = (logLines) => {
	let lines = logLines.split(/\r\n|\n/)

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

export class FrontPage extends hyperHTML.Component {
	constructor() {
		super()
		this.state = {logLines: ''}
	}

	onconnected() {
		this.setState({logLines: readHash()})
	}

	render() {
		const textArea = new TextArea({
			value: this.state.logLines,
			onclick: (logLines) => {
				this.setState({players: parseLogLines(logLines)})
			},
			oninput: (logLines) => {
				this.state.logLines = logLines
				updateHash(logLines)

			},
		})
		const table = new Table({players: this.state.players})

		return this.html`<div onconnected=${this}>
			<p class="App-intro">
				Copy the <code>status</code> console command output, from TF2, into the box below:
			</p>
			<div>
				${textArea}
			</div>
			<br>
			${table}
		</div>`
	}
}

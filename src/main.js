import hyperHTML from 'hyperhtml'
import Router from 'hyperhtml-app'
import {statusRE} from './shared-regex'
import {Table} from './Table'
import {TextArea} from './TextArea'

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
						.then((json) => {
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
					.then((json) => {

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

let table

function renderTable() {
	if (!table) {
		table = new Table({players: players})
		hyperHTML(tableContainer)`${table}`
	} else {
		table.editPlayers(players)
		table.render()
	}
}

class FrontPage extends hyperHTML.Component {
	constructor() {
		super()

		this.textArea = new TextArea({
			onClick: (logLines) => {
				main(logLines)
			},
		})
		this.table = new Table({players: players})
		table = this.table
	}

	render() {
		return this.html`<div>
			<p class="App-intro">
				Copy the <code>status</code> console command output, from TF2, into the box below:
			</p>
			<div>
				${this.textArea}
			</div>
			<br>
			${this.table}
		</div>`
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

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
	})
}


let api_request_rate_ms = 200
let players = {}

let playerID = 0
let app = {
	labelOrder: ["steamProfilePic", "nameServer", "nameETF2L", "country", "ETF2LProfileID", "logstfLink", "teams", "gamesPlayed6on6", "gamesPlayedHL", "gamesPlayedRest"],
	labels: {},
}

app.labelOrder.forEach(function(i) {
	app.labels[i] = i
})

function main() {
	players = {}
	playerID = 0
	let wait = api_request_rate_ms

	let logLines = document.querySelector("#input").value
	logLines = logLines.split(/\r\n|\n/)

	//[ , name, steamID]
	const re = /#\s*\d+\s"(.+)"\s*(\[U:1:\d+\])/ //bug missing " on long names

	for (let i of logLines) {
		if (i.match(re)) {
			let currentLine = i
			let result = re.exec(currentLine)

			let nameServer = result[1]
			let steamID = result[2]

			players[playerID] = {
				playerID: playerID,
				steamID: steamID,
				nameServer: nameServer,
				steamProfilePic: "",
				nameETF2L: "",
				country: "",
				ETF2LProfileID: "",
				logstfLink: "",
				teams: [],
				gamesPlayed6on6: "",
				gamesPlayedHL: "",
				gamesPlayedRes: "",
				played6on6: [],
				playedHL: [],
				playedRest: [],
			}

			playerID++
		}

		renderTable()
	}

	Object.values(players).forEach(function(i) {
		let id = i.steamID //this needs to be 'let' because scope

		setTimeout(() => {
			axios
				.get(`http://api.etf2l.org/player/${id}.json`)
				.then(function(response) {
					if (response.data.status && response.data.status.message === "OK" && response.data.player) {
						let nameETF2L = response.data.player.name
						let country = response.data.player.country
						i.nameETF2L = nameETF2L
						i.country = country
						i.ETF2LProfileID = response.data.player.id
						i.steamProfilePic = response.data.player.steam.avatar
						//i.response = response.data
						i.teams = response.data.player.teams

						i.played6on6 = []
						i.playedHL = []
						i.playedRest = []

						getResults(id, 1, i)
						renderTable()
					}
				})
				.catch(function(error) {
					console.log(error)
				})
		}, (wait += api_request_rate_ms))
	})
}

function getResults(id, pageID, player) {
	let wait = api_request_rate_ms

	setTimeout(() => {
		axios
			.get(`http://api.etf2l.org/player/${id}/results/${pageID}.json?since=0&per_page=100`)
			.then(function(response) {
				if (response.data.status && response.data.status.message === "OK" && response.data.results) {
					let results = response.data.results

					for (let i of results) {
						let type = i.competition.type //6on6, 1v1, HL
						let division = i.division.name || i.competition.category //season a powered by b, fun cup, group a

						if (type === "6on6") {
							player.played6on6.push({key: "6on6", type: type, division: division})
						} else if (type === "Highlander") {
							player.playedHL.push({key: "HL", type: type, division: division})
						} else {
							player.playedRest.push({key: "Rest", type: type, division: division})
						}
					}

					renderTable()

					let page = response.data.page
					if (page.next_page_url) {
						pageID += 1
						getResults(id, pageID, player)
					}
				}
			})
			.catch(function(error) {
				console.log(error)
			})
	}, (wait += api_request_rate_ms))
}

let table

function renderTable() {
	if (!table) {
		let tableContainer = document.querySelector("#container")
		table = new Table()
		hyperHTML(tableContainer)`${table}`
	} else {
		table.render()
	}
}

class TableRow extends hyperHTML.Component {
	constructor(player) {
		super()
		this.player = player
		this.TDs = []

		this.labelOrder = app.labelOrder
	}

	render() {
		for (let label of this.labelOrder) {
			this.TDs.push(new ItemComponent(label, this.player[label], this.player))
		}

		return this.html`
			<tr>
				${this.TDs}
			</tr>
		`
	}
}

class Table extends hyperHTML.Component {
	constructor() {
		super()
		this.rows = []

		this.tableHead = hyperHTML.wire()`
		<tr>
			<td></td>
			<td>Nickname</td>
			<td>ETF2L</td>
			<td>Country</td>
			<td></td>
			<td></td>
			<td>Teams</td>
			<td>6on6 played</td>
			<td>HL played</td>
			<td>Rest played</td>
		</tr>`
	}

	render() {
		let data = players
		let rows = []
		let tableHead = this.tableHead

		Object.values(data).forEach(function(player) {
			rows.push(new TableRow(player))
		})

		return this.html`
		<div class="table-responsive">
			<table align="center" class="table">
				<thead>${tableHead}</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`
	}
}

function enter(event) {
	if (event.key === "Enter") {
		main()
	}
}

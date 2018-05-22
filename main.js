// @flow

let api_request_rate_ms = 200
let players = {}

let playerID = 0

function main() {
	players = {}
	playerID = 0
	let wait = api_request_rate_ms

	let logLines = document.querySelector('#input').value
	logLines = logLines.split(/\r\n|\n/)

	for (let i of logLines) {
		if (i && i.charAt(0) === '#' && !i.match(/# userid name/)) {
			let currentLine = i
			let nameServer = currentLine.split('"')[1]
			let steamID = currentLine.split('[')[1]

			try {
				steamID = steamID.split(']')[0]
				steamID = `[${steamID}]`

				players[playerID] = {
					playerID: playerID,
					steamID: steamID,
					nameServer: nameServer,
					logstfLink: 1,
					steamProfilePic: undefined
				}

				playerID++
			} catch (e) {
				console.error(e)
			}

		}
		renderTable()
	}


	Object.values(players).forEach(function (i) {

		let id = i.steamID //this needs to be 'let' because scope

		setTimeout(() => {
			axios.get(`http://api.etf2l.org/player/${id}.json`)
				.then(function (response) {
					if (response.data.status && response.data.status.message === 'OK' && response.data.player) {
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
				.catch(function (error) {
					console.log(error)
				})
		}, wait += api_request_rate_ms)
	})
}

function getResults(id, pageID, player) {

	let wait = api_request_rate_ms

	setTimeout(() => {

		axios.get(`http://api.etf2l.org/player/${id}/results/${pageID}.json?since=0&per_page=100`)
			.then(function (response) {
				if (response.data.status && response.data.status.message === 'OK' && response.data.results) {

					let results = response.data.results

					for (let i of results) {
						let type = i.competition.type //6on6, 1v1, HL
						let division = i.division.name || i.competition.category //season a powered by b, fun cup, group a

						if (type === '6on6') {
							player.played6on6.push({key: '6on6', type: type, division: division})
						} else if (type === 'Highlander') {
							player.playedHL.push({key: 'HL', type: type, division: division})
						} else {
							player.playedRest.push({key: 'Rest', type: type, division: division})
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
			.catch(function (error) {
				console.log(error)
			})
	}, wait += api_request_rate_ms)
}

function renderTable() {
	let tableContainer = document.querySelector('#container')
	let table = getTable()
	hyperHTML.bind(tableContainer)`${table}`
}

function getTable() {
	return generateTable(players)
}

function generateTable(data) {

	let rows = []
	let tableHead = hyperHTML.wire()`
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

	if (typeof data[0] === 'object' || 'array') {

		Object.values(data).forEach(function (player) {

			let columns = {}

			if (player.ETF2LProfileID) {
				let url = `https://etf2l.org/forum/user/${player.ETF2LProfileID}`

				columns.ETF2LProfileID = hyperHTML.wire()`<td>
					<a href="${url}">ETF2L Profile</a>
					</td>`

			}
			if (player.steamProfilePic) {
				let url = `https://etf2l.org/forum/user/${player.steamProfilePic}`

				columns.steamProfilePic = hyperHTML.wire()`<td>
					<img src=${player.steamProfilePic} class="steamProfilePic">
					</td>`

			}
			if (player.logstfLink) {
				let url = `https://logs.tf/search/player?s=${player.steamID}`

				columns.logstfLink = hyperHTML.wire()`<td>
					<a href="${url}">Logs.tf</a>
					</td>`

			}
			if (player.teams) {

				if (player.teams.length > 0) {

					let teams = []
					for (let i of player.teams) {
						teams.push(hyperHTML.wire()`<p>${i.type} : ${i.name}</p>`)
					}
					columns.teams = hyperHTML.wire()`<td>${teams}</td>`
				} else {
					columns.teams = hyperHTML.wire()`<td></td>`
				}

			}
			if (player.played6on6 || player.playedHL || player.playedRest) {

				let games = {'6on6': {}, 'Highlander': {}, 'Rest': {}}

				function addRows(compType, container, playedGames) {

					for (let i of playedGames) {

						if (!games[compType][i.division]) games[compType][i.division] = 0

						games[compType][i.division] += 1
					}

					for (let division in games[compType]) {

						container.push(hyperHTML.wire()`
							<tr>
								<td>
									${division}
								</td>
								<td style="text-align: right; padding-left: 0.5rem;">
									${games[compType][division]}
								</td>
							</tr>`
						)

					}

					if (container[0]) {
						for (let i of container[0].children) {
							i.classList.add('noBorder')
						}
					}
				}

				var rows6on6 = []
				var rowsHl = []
				var rowsRest = []

				addRows('6on6', rows6on6, player.played6on6)
				addRows('Highlander', rowsHl, player.playedHL)
				addRows('Rest', rowsRest, player.playedRest)

				if (rowsRest[0]) {
					for (let i of rowsRest[0].children) {
						i.classList.add('noBorder')
					}
				}

				columns.gamesPlayed6on6 = hyperHTML.wire()`
					<td>
						<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${rows6on6}</tbody></table>
					</td>`

				columns.gamesPlayedHl = hyperHTML.wire()`
					<td>
						<table class="gamesPlayed tableBackgroundCustom" style="width: 100%"><tbody>${rowsHl}</tbody></table>
					</td>`

				columns.gamesPlayedRest = hyperHTML.wire()`
					<td>
						<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${rowsRest}</tbody></table>
					</td>`
			}

			['nameServer', 'nameETF2L', 'country'].forEach(function (i) {
				if (player[i]) {
					columns[i] = hyperHTML.wire()`<td>${player[i]}</td>`
				}
			})

			/*
			Object.keys(players[0])
			(13) ["playerID", "steamID", "nameServer", "logstfLink", "steamProfilePic", "nameETF2L", "country", "ETF2LProfileID", "teams", "gamesPlayed", "played6on6", "playedHL", "playedRest"]
			*/
			let displayOrder = ['steamProfilePic', 'nameServer', 'nameETF2L', 'country', 'ETF2LProfileID', 'logstfLink', 'teams', 'gamesPlayed6on6', 'gamesPlayedHl', 'gamesPlayedRest']
			let sorted = []

			for (let i of displayOrder) {
				let result = columns[i] || hyperHTML.wire()`<td></td>`
				sorted.push(result)
			}

			rows.push(hyperHTML.wire()`<tr>${sorted}</tr>`)

		})

	}

	return hyperHTML.wire()`
		<div class="table-responsive">
			<table align="center" class="table">
				<thead>${tableHead}</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`

}

function enter(event) {
	if (event.key === 'Enter') {
		main()
	}
}
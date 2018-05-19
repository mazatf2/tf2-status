// @flow

var api_request_rate_ms = 200
var players = []

function main() {
	players = []
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
				players.push({
					steamID: `[${steamID}]`,
					nameServer: nameServer,
					logstfLink: undefined,
					steamProfilePic: undefined
				})
			} catch (e) {
				console.error(e)
			}

		}
		renderTable()
	}

	for (let i of players) {

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
						i.gamesPlayed = ''

						getResults(id, 1, i)
						renderTable()

					}
				})
				.catch(function (error) {
					console.log(error)
				})
		}, wait += api_request_rate_ms)
	}
}

function getResults(id, pageID, player) {

	let wait = api_request_rate_ms


	setTimeout(() => {

		axios.get(`http://api.etf2l.org/player/${id}/results/${pageID}.json?since=0&per_page=100`)
			.then(function (response) {
				if (response.data.status && response.data.status.message === 'OK' && response.data.results) {

					let results = response.data.results
					let gamesPlayed = player.gamesPlayed || {totalGamesPlayed: {all: 0}, results: {}}

					for (let i of results) {
						let type = i.competition.type
						let division = i.division.name || i.competition.category

						gamesPlayed.results[type] = gamesPlayed.results[type] || {}
						gamesPlayed.totalGamesPlayed[type] = gamesPlayed.totalGamesPlayed[type] || 0

						if (!gamesPlayed.results[type][division]) {
							gamesPlayed.results[type][division] = 0
						}

						if (!gamesPlayed.totalGamesPlayed[type]) {
							gamesPlayed.totalGamesPlayed[type] = 0
						}

						gamesPlayed.results[type][division] = gamesPlayed.results[type][division] += 1
						gamesPlayed.totalGamesPlayed[type] = gamesPlayed.totalGamesPlayed[type] += 1
						gamesPlayed.totalGamesPlayed.all += 1
					}

					player.gamesPlayed = gamesPlayed

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

		for (let row in data) {

			let columns = {}

			for (let item in data[row]) {
				let content = data[row][item]
				//console.info(row, ' : ',item)
				if (item === 'ETF2LProfileID') {
					let url = `https://etf2l.org/forum/user/${content}`

					columns.ETF2LProfileID = hyperHTML.wire()`<td>
						<a href="${url}">ETF2L Profile</a>
						</td>`

				} else if (item === 'steamProfilePic') {
					let url = `https://etf2l.org/forum/user/${content}`

					columns.steamProfilePic = hyperHTML.wire()`<td>
						<img src=${content} class="steamProfilePic">
						</td>`

				} else if (item === 'logstfLink') {
					let url = `https://logs.tf/search/player?s=${data[row]['steamID']}`

					columns.logstfLink = hyperHTML.wire()`<td>
						<a href="${url}">Logs.tf</a>
						</td>`

				} else if (item === 'teams') {

					if (content) {

						let teams = []
						for (let i of content) {
							teams.push(hyperHTML.wire()`<p>${i.type} : ${i.name}</p>`)
						}
						columns.teams = hyperHTML.wire()`<td>${teams}</td>`
					} else {
						columns.teams = hyperHTML.wire()`<td></td>`
					}
				} else if (item === 'gamesPlayed') {

					if (content) {

						let results = content.results
						let totalGamesPlayed = content.totalGamesPlayed
						let allMatchesCount = totalGamesPlayed.all

						let games = {'6on6': {}, 'Highlander': {}, 'Rest': {}}

						function reMatch(re, string, compType, division, matchCount) {

							let match = string.match(re)
							if (match) {
								if (!games[compType][division]) games[compType][division] = 0
								games[compType][division] = matchCount

								return true
							}

						}

						for (let compType in results) {
							for (let divisionName in results[compType]) {
								if (
									reMatch(/6on6/i, compType, '6on6', divisionName, results[compType][divisionName]) ||
									reMatch(/highlander/i, compType, 'Highlander', divisionName, results[compType][divisionName])
								) {

								} else {
									if (!games.Rest[compType])
										games.Rest[compType] = {}

									if (!games.Rest[compType][divisionName])
										games.Rest[compType][divisionName] = 0

									games.Rest[compType][divisionName] = results[compType][divisionName]
								}

							}
						}

						function addRows(compType, container) {

							for (let division in games[compType]) {
								container.push(hyperHTML.wire()`
										<tr>
											<td>
												${division}
											</td>
											<td style="text-align: right; padding-left: 0.5rem;">
												${games[compType][division]}
											</td>
										</tr>
									`)
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

						addRows('6on6', rows6on6)
						addRows('Highlander', rowsHl)

						//for rowsRest
						for (let compType in games.Rest) {
							for (let division in games.Rest[compType]) {
								rowsRest.push(hyperHTML.wire()`
										<tr>
											<td>
												${compType}:${division}
											</td>
											<td style="text-align: right; padding-left: 0.5rem;">
												${games.Rest[compType][division]}
											</td>
										</tr>
									`)
							}

						}

						if (rowsRest[0]) {
							for (let i of rowsRest[0].children) {
								i.classList.add('noBorder')
							}
						}

						columns.gamesPlayed6on6 = hyperHTML.wire()`
							<td>
								<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${rows6on6}</tbody></table>
							</td>
							`

						columns.gamesPlayedHl = hyperHTML.wire()`
							<td>
								<table class="gamesPlayed tableBackgroundCustom" style="width: 100%"><tbody>${rowsHl}</tbody></table>
							</td>
							`

						columns.gamesPlayedRest = hyperHTML.wire()`
							<td>
								<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${rowsRest}</tbody></table>
							</td>
							`
					}

				} else if (item === 'steamID') {

				} else {
					columns[item] = hyperHTML.wire()`<td>${content}</td>`
				}
			}

			/*
			Object.keys(players[0])
			(7) ["steamID", "nameServer", "logstfLink", "steamProfilePic", "nameETF2L", "country", "ETF2LProfileID"]
			*/
			let displayOrder = ['steamProfilePic', 'nameServer', 'nameETF2L', 'country', 'ETF2LProfileID', 'logstfLink', 'teams', 'gamesPlayed6on6', 'gamesPlayedHl', 'gamesPlayedRest']
			let sorted = []

			for (let i of displayOrder) {
				let result = columns[i] || hyperHTML.wire()`<td></td>`
				sorted.push(result)
			}

			rows.push(hyperHTML.wire()`<tr>${sorted}</tr>`)
		}
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
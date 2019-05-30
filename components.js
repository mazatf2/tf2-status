class BaseComponent extends hyperHTML.Component {
	constructor(props, data) {
		super()
		this.props = props
		this.data = data || props.data
	}

	render() {
		return this.html`<td>${this.data}</td>`
	}
}

class Links extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let content = []
		if (this.props.ETF2LProfileID) {
			let url = `https://etf2l.org/forum/user/${this.props.ETF2LProfileID}`
			content.push(hyperHTML.wire()`<p><a href="${url}">ETF2L</a></p>`)
		} else {
			let steamID = this.props.steamID.replace('[', '').replace(']', '')
			let url = `http://etf2l.org/search/${steamID}`
			content.push(hyperHTML.wire()`<p><a href="${url}" style="text-decoration: line-through">ETF2L</a></p>`)
		}
		let ugcUrl = `https://www.ugcleague.com/playersearch.cfm?steamid=${this.props.steamID}&steamid32=&steamid64=&player_name=&submit=Find+Players&results=`
		content.push(hyperHTML.wire()`<p><a href="${ugcUrl}">UGC</a></p>`)

		let eseaUrl = `https://play.esea.net/index.php?s=search&query=${this.props.steamID}&source=users`
		content.push(hyperHTML.wire()`<p><a href="${eseaUrl}">ESEA</a></p>`)

		return this.html`<td>${content}</td>`
	}
}

class LogstfLink extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let url = `https://logs.tf/search/player?s=${this.props.steamID}`
		return this.html`<td><a href="${url}">Logs.tf</a></td>`
	}
}

class SteamProfilePic extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let url = this.props.steamProfilePic || './not_found.gif'
		let visibility = 'hidden'
		if(url !== './not_found.gif'){
			visibility = 'visible'
		}

		return  this.html`<td><img src="${url}" class="steamProfilePic" style="${{visibility: visibility}}"></td>`
	}
}

class NameServer extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let url = `http://steamcommunity.com/profiles/${this.props.steamID}`
		return this.html`<td><a href="${url}">${this.props.nameServer}</a></td>`
	}
}

class TextComponent extends BaseComponent {
	constructor(props, data) {
		super(props, data)
	}

	render() {
		return this.html`<td>${this.data}</td>`
	}
}

class Teams extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let result = ''
		if (this.props.teams && this.props.teams.length > 0) {
			let teams = []
			for (let i of this.props.teams) {
				teams.push(hyperHTML.wire()`<p>${i.type} : ${i.name}</p>`)
			}
			result = teams
		}
		return this.html`<td>${result}</td>`
	}
}

class _Played extends BaseComponent {
	constructor(props) {
		super(props)

		this.container = []
	}

	addRows6on6HL(compType, playedGames) {
		let games = {
			Premiership: [],
			'Division: 1': [],
			'Division: 2': [],
			High: [],
			Mid: [],
			'Low / Open': [],
			Cup: [],
			error: [],
		}

		function checkDiv(result) {
			//"division": {"tier": null, "name": null, "id": null}
			//obj.category, obj.type
			//Premiership Preseason Playoffs
			//NA Rules Cup - LOW

			//tier 0
			//obj.category, obj.type
			//Premiership, Premiership Group, Premiership Tier

			//tier 1
			//obj.name: Division 1, Division 1A, High, High A, High tier

			//tier 2
			//Division 2, Mid, High/Mid

			//tier 3
			//Division 3, Division 3A, Open, Low
			//Grey Group
			//Open Group A

			//tier 4
			//Division 4, Division 4A, Open

			//tier 5
			//Division 5, Division 5A

			//tier 6
			//Division 6, Division 6A

			let rName = result.division.name || result.competition.name
			let category = result.competition.category || ''

			if (category.match(/The Highlander Open/)) {
				games.Cup.push(result)
			} else if (rName.match(/Premiership/)) {
				games.Premiership.push(result)
			} else if (rName.match(/Division 1/)) {
				games['Division: 1'].push(result)
			} else if (rName.match(/Division 2/)) {
				games['Division: 2'].push(result)
			} else if (rName.match(/Division 3/) || rName.match(/Division 4/)) {
				games.Mid.push(result)
			} else if (rName.match(/Division 5/) || rName.match(/Division 6/)) {
				games['Low / Open'].push(result)
			} else if (rName.match(/High/)) {
				games.High.push(result)
			} else if (rName.match(/Mid/)) {
				games.Mid.push(result)
			} else if (rName.match(/Low/) || rName.match(/Open/)) {
				games['Low / Open'].push(result)
			} else if (category.match(/Cup/)) {
				games.Cup.push(result)
			} else {
				games.error.push(result)
			}
		}

		for (let result of playedGames) {
			checkDiv(result)
		}

		Object.entries(games).forEach((a) => {
			let [division, obj] = a

			if (obj.length > 0) {
				this.container.push(hyperHTML.wire()`
					<tr>
						<td>${division}</td>
						<td style="text-align: right; padding-left: 0.5rem;">
							${obj.length}
						</td>
					</tr>
				`)
			}
		})

		if (this.container[0]) {
			for (let i of this.container[0].children) {
				i.classList.add('noBorder')
			}
		}
	}

	addRowsRest(compType, playedGames) {
		let games = {
			'1on1': [],
			'2on2': [],
			Cup: [],
		}

		function checkDiv(result) {
			let rName = result.division.name || result.competition.name
			let category = result.competition.category || ''
			let type = result.competition.type || ''

			if (type === '1on1') {
				games['1on1'].push(result)
			} else if (type === '2on2') {
				games['2on2'].push(result)
			} else {
				games.Cup.push(result)
			}
		}

		for (let result of playedGames) {
			checkDiv(result)
		}

		Object.entries(games).forEach((a) => {
			let [gameType, obj] = a

			if (obj.length > 0) {
				this.container.push(hyperHTML.wire()`
					<tr>
						<td>${gameType}</td>
						<td style="text-align: right; padding-left: 0.5rem;">
							${obj.length}
						</td>
					</tr>
				`)
			}
		})

		if (this.container[0]) {
			for (let i of this.container[0].children) {
				i.classList.add('noBorder')
			}
		}
	}
}

class GamesPlayed6on6 extends _Played {
	constructor(props) {
		super(props)
	}

	render() {
		this.addRows6on6HL('6on6', this.props.played6on6)

		return this.html`
			<td>
				<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${this.container}</tbody></table>
			</td>
		`
	}
}

class GamesPlayedHL extends _Played {
	constructor(props) {
		super(props)
	}

	render() {
		this.addRows6on6HL('Highlander', this.props.playedHL)

		return this.html`
			<td>
				<table class="gamesPlayed tableBackgroundCustom" style="width: 100%"><tbody>${this.container}</tbody></table>
			</td>
		`
	}
}

class GamesPlayedRest extends _Played {
	constructor(props) {
		super(props)
	}

	render() {
		this.addRowsRest('Rest', this.props.playedRest)

		return this.html`
			<td>
				<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${this.container}</tbody></table>
			</td>
		`
	}
}

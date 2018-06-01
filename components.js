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

class ETF2LProfileID extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		let content = ''
		if (this.props.ETF2LProfileID) {
			let url = `https://etf2l.org/forum/user/${this.props.ETF2LProfileID}`
			content = hyperHTML.wire()`<a href="${url}">ETF2L Profile</a>`
		}

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
		return this.html`<td><img src="${this.props.steamProfilePic}" class="steamProfilePic"></td>`
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

	addRows(compType, playedGames) {
		let games = {'6on6': {}, Highlander: {}, Rest: {}}
		let container = this.container

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
							</tr>`)
		}

		if (container[0]) {
			for (let i of container[0].children) {
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
		this.addRows('6on6', this.props.played6on6)

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
		this.addRows('Highlander', this.props.playedHL)

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
		this.addRows('Rest', this.props.playedRest)

		return this.html`
			<td>
				<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${this.container}</tbody></table>
			</td>
		`
	}
}

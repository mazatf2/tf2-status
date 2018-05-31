class BaseComponent extends hyperHTML.Component {
	constructor(props) {
		super()
		this.props = props
		this.label = props.label
		this.data = props.data || ""
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
		let content = ""
		if (this.props.player.ETF2LProfileID) {
			let url = `https://etf2l.org/forum/user/${this.props.player.ETF2LProfileID}`
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
		let url = `https://logs.tf/search/player?s=${this.props.player.steamID}`
		return this.html`<td><a href="${url}">Logs.tf</a></td>`
	}
}

class SteamProfilePic extends BaseComponent {
	constructor(props) {
		super(props)
	}

	render() {
		return this.html`<td><img src="${this.data}" class="steamProfilePic"></td>`
	}
}

class TextComponent extends BaseComponent {
	constructor(props) {
		super(props)
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
		if (this.props.data && this.props.data.length > 0) {
			let teams = []
			for (let i of this.props.data) {
				teams.push(hyperHTML.wire()`<p>${i.type} : ${i.name}</p>`)
			}
			return this.html`<td>${teams}</td>`
		} else {
			return this.html`<td></td>`
		}
	}
}

class _Played extends BaseComponent {
	constructor(props) {
		super(props)

		this.container = []
	}

	addRows(compType, playedGames) {
		let games = {"6on6": {}, Highlander: {}, Rest: {}}
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
				i.classList.add("noBorder")
			}
		}
	}
}

class GamesPlayed6on6 extends _Played {
	constructor(props) {
		super(props)
	}

	render() {
		this.addRows("6on6", this.props.player.played6on6)

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
		this.addRows("Highlander", this.props.player.playedHL)

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
		this.addRows("Rest", this.props.player.playedRest)

		return this.html`
			<td>
				<table class="gamesPlayed tableBackgroundWhite" style="width: 100%"><tbody>${this.container}</tbody></table>
			</td>
		`
	}
}

class ItemComponent extends hyperHTML.Component {
	constructor(label, data, player) {
		super()

		this.label = label
		this.data = data
		this.player = player

		this.props = {label: label, data: data, player: player}

		const l = app.labels

		let is = (thatLabel) => {
			if (this.label === thatLabel) {
				return true
			}
			return false
		}

		if (is(l.nameETF2L) || is(l.nameServer) || is(l.country)) {
			this.component = new TextComponent(this.props)
		} else if (is(l.steamProfilePic)) {
			this.component = new SteamProfilePic(this.props)
		} else if (is(l.logstfLink)) {
			this.component = new LogstfLink(this.props)
		} else if (is(l.ETF2LProfileID)) {
			this.component = new ETF2LProfileID(this.props)
		} else if (is(l.teams)) {
			this.component = new Teams(this.props)
		} else if (is(l.gamesPlayed6on6)) {
			this.component = new GamesPlayed6on6(this.props)
		} else if (is(l.gamesPlayedHL)) {
			this.component = new GamesPlayedHL(this.props)
		} else if (is(l.gamesPlayedRest)) {
			this.component = new GamesPlayedRest(this.props)
		} else {
			this.component = hyperHTML.wire()`<td>< !-- ItemComponent no element found -- ></td>`
		}
	}

	render() {
		return this.component
	}
}

import {BaseComponent} from './BaseComponent'

export class PlayedComponent extends BaseComponent {
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

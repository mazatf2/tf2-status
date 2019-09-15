import {PlayedComponent} from './PlayedComponent'

export class GamesPlayedRest extends PlayedComponent {
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

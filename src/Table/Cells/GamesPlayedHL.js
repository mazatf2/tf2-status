import {PlayedComponent} from './PlayedComponent'

export class GamesPlayedHL extends PlayedComponent {
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

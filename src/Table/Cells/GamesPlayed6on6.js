import {PlayedComponent} from './PlayedComponent'

export class GamesPlayed6on6 extends PlayedComponent {
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

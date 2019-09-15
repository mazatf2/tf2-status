import {BaseComponent} from './BaseComponent'

export class Teams extends BaseComponent {
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

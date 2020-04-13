import {BaseComponent} from '../BaseComponent'

export class Etf2l extends BaseComponent {
	constructor(props, data) {
		super(props, data)
	}

	render() {
		return this.html`
			<td>
				<p>${this.props.nameETF2L}</p>
				<p>${this.props.country}</p>
			</td>`
	}
}

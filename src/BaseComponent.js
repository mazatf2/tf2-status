export class BaseComponent extends hyperHTML.Component {
	constructor(props, data) {
		super()
		this.props = props
		this.data = data || props.data
	}

	render() {
		return this.html`<td>${this.data}</td>`
	}
}

import {BaseComponent} from './BaseComponent'

class TextComponent extends BaseComponent {
	constructor(props, data) {
		super(props, data)
	}

	render() {
		return this.html`<td>${this.data}</td>`
	}
}

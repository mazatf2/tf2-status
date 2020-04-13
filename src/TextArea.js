import {BaseComponent} from './Table/BaseComponent'

export class TextArea extends BaseComponent {
	constructor(props) {
		super(props)
	}

	onclick() {
		const val = document.querySelector('#input').value
		return this.props.onclick(val)
	}

	oninput() {
		const val = document.querySelector('#input').value
		return this.props.oninput(val)
	}

	render() {
		return this.html`
			<textarea id="input" placeholder="" rows="16" cols="80" oninput=${this}>${this.props.value}</textarea>
			<br>
			<br>
			<input type="button" onclick=${this} value="Check" class="btn btn-primary btn-lg ">
		`
	}
}

import {BaseComponent} from './BaseComponent'
import {statusRE, steamIDRE} from './shared-regex'

export class TextArea extends BaseComponent {
	constructor(props) {
		super(props)
		this.state = {value: ''}

		this.init()
	}

	init() {
		let hash = window.location.hash || ''
		if (hash && hash.length > 1) {
			hash = hash.substring(1, hash.length) //del #
			let tuples = hash.split(',', 32 * 3)

			if (tuples[tuples.length] === ',') {
				tuples.splice(tuples.length - 1, 1)
			}
			for (let i = 0; i < tuples.length; i += 2) {
				let steamID = tuples[i + 1]
				if (steamID && steamID.match(steamIDRE)) {
					let name = decodeURI(tuples[i]).substr(0, 32)
					name = `"${name}"`.padEnd(32, ' ')
					let result = `#  0 ${name} [${steamID}]`

					this.state.value += '\r\n' + `#  0 ${name} [${steamID}]`
				}
			}
		}
	}

	onclick() {
		return this.props.onClick(this.state.value)
	}

	oninput() {
		this.state.value = document.querySelector('#input').value

		let lines = this.state.value.split(/\r\n|\n/)

		let newHash = ''
		lines.forEach((i) => {
			if (i.match(statusRE)) {
				let result = statusRE.exec(i)

				let nameServer = result[1]
				let steamID = result[2].replace(/[\[|\]]/g, '')
				newHash += `${nameServer},${steamID},`
			}
		})

		if (newHash[newHash.length - 1] === ',') {
			newHash = newHash.slice(0, -1)
		}
		window.location.hash = newHash
	}

	render() {
		return this.html`
			<textarea id="input" placeholder="" rows="16" cols="80" oninput=${this}>${this.state.value}</textarea>
			<br>
			<br>
			<input type="button" onclick=${this} value="Check" class="btn btn-primary btn-lg ">
		`
	}
}

const http = require('http')
const fs = require('fs')
const jsdom = require('jsdom').JSDOM

const request = (url) => {
	return new Promise(resolve => {
		http.get(url, res => {
			console.log(res.statusCode, res.statusMessage)
			let data = ''
			res.on('data', chunk => data += chunk)
			res.on('end', () => {resolve(data)})
		}).on('error', err => {throw err})
	})
}

request('http://etf2l.org/etf2l/archives/').then(page => {
	const document = new jsdom(page).window.document

	let result = {}
	let tournamentCategories = document.querySelectorAll('#content h2')

	for (let categoryEl of tournamentCategories) {
		format = categoryEl.textContent
		tournamentNames = [...categoryEl.nextElementSibling.querySelectorAll('li a')] //Season A, Season A Mid Playoffs
		content = tournamentNames.map(value => ({
			name: value.textContent,
			url: value.href,
			id: value.href.match(/\/(\d+)$/)[1]
		}))

		result[format] = content.reduce((previousValue, currentValue) => {
			previousValue[currentValue.name] = currentValue
			return previousValue
		}, {})
	}

	fs.writeFile('dump.json', JSON.stringify(result, null, '\t'), (err => {
		if (err) throw err
		console.log('done')
	}))

})



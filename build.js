const fs = require('fs')

fs.readFile('./tf2-status.html', 'utf8', function(error, htmlFile) {
	if (error) {
		throw error
	}
	let mainJS = fs.readFileSync('./main.js', 'utf8')
	let componentsJS = fs.readFileSync('./components.js', 'utf8')

	let result = htmlFile.replace(/<script src="main.js"><\/script>/, `<script>${mainJS}</script>`)
	result = result.replace(/<script src="components.js"><\/script>/, `<script>${componentsJS}</script>`)
	result = result.replace(/<script src="libs\/node-steamid.min.js"><\/script>/, `<script src="https://raw.githubusercontent.com/mazatf2/tf2-status/master/libs/node-steamid.min.jss"></script>`)

	fs.writeFile('./dist/tf2-status.html', result, 'utf8', function(error) {
		if (error) throw error
	})
})

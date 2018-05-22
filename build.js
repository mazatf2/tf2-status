// @flow

const fs = require('fs')

fs.readFile('./tf2-status.html', 'utf8', function (error, htmlFile) {
	if (error) {
		throw error
	}
	fs.readFile('./main.js', 'utf8', function (error, jsFile) {
		if (error) throw error
		let result = htmlFile.replace(/<script src="main.js"><\/script>/, `<script>
${jsFile}
</script>`)

		fs.writeFile('./dist/tf2-status.html', result, 'utf8', function (error) {
			if (error) throw error
		})
	})
})


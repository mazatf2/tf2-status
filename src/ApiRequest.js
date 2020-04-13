import Queue from 'smart-request-balancer'

const queue = new Queue({
	rules: {
		common: {
			rate: 1,
			limit: 1,
			priority: 1,
		},
	},
	retryTime: 300,
	ignoreOverallOverheat: true,
})

export const ApiRequest = (url) => {
	return new Promise((resolve, reject) => {
		try {
			queue.request((retry) => fetch(url))
				.then(response => resolve(response))
				.catch(err => reject(err))
		} catch (err) { //catch 404
			console.error(err)
			reject(err)
		}
	})
}

import SteamID from 'steamid'
import {ApiRequest} from './ApiRequest'

export class Player {
	constructor(params) {
		params = params || {}
		let steamID = new SteamID(params.steamID)

		this.playerID = params.playerID
		this.steamID64 = steamID.getSteamID64()
		this.steamID2 = steamID.getSteam2RenderedID()
		this.steamID3 = steamID.getSteam3RenderedID()
		this.nameServer = params.nameServer || {}
		this.steamProfilePic = ''
		this.nameETF2L = ''
		this.country = ''
		this.ETF2LProfileID = ''
		this.bans = []
		this.teams = []
		this.played6on6 = []
		this.playedHL = []
		this.playedRest = []
		this.results = []
	}

	fetchInfo() {
		return new Promise((resolve, reject) => {
			new ApiRequest(`http://api.etf2l.org/player/${this.steamID64}.json`)
				.then((response) => {
					response.json()
						.then((json) => {
							if (json.status && json.status.message === 'OK' && json.player) {
								let nameETF2L = json.player.name
								let country = json.player.country
								this.nameETF2L = nameETF2L
								this.country = country
								this.ETF2LProfileID = json.player.id
								this.steamProfilePic = json.player.steam.avatar
								this.bans = json.player.bans || []
								this.teams = json.player.teams

								this.played6on6 = []
								this.playedHL = []
								this.playedRest = []

								resolve(this)
							} else {
								reject(this)
							}

						})
				})
				.catch((err) => {
					console.log(err)
				})
		})
	}

	fetchResults() {
		const checkTotalPages = (json) => {
			return new Promise(resolve => {
				let total_pages = json.page.total_pages || 0

				let requests = []
				for (let i = 1; i < total_pages; i += 1) {
					const pageID = i + 1
					requests.push(new fetchPage(pageID))
				}
				Promise.all(requests).then(() => resolve())
			})

		}

		const addResults = (json) => {
			return new Promise(resolve => {
				let results = json.results
				this.results = this.results.concat(results)

				for (let i of results) {
					let type = i.competition.type //6on6, 1v1, HL

					if (type === '6on6') {
						this.played6on6.push(i)
					} else if (type === 'Highlander') {
						this.playedHL.push(i)
					} else {
						this.playedRest.push(i)
					}
				}
				resolve()
			})
		}

		const fetchPage = (pageID) => {
			return new Promise(resolve => {
				new ApiRequest(`http://api.etf2l.org/player/${this.steamID64}/results/${pageID}.json?since=0&per_page=100`)
					.then(response => response.json())
					.then((json) => {
						if (json.status && json.status.message === 'OK' && json.results) {
							addResults(json).then(() => {
								resolve(json)
							})
						}
					})
			})
				.catch(function(error) {
					console.log(error)
				})
		}

		return new Promise(resolve => {
			fetchPage(1).then(json => checkTotalPages(json)).then(() => {
				resolve(this)
			})
		})

	}

}

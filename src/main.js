import hyperHTML from 'hyperhtml'
import {app as router} from 'a-route'
import {FrontPage} from './FrontPage'

let frontPage = new FrontPage()
let path = window.location.pathname
let tableContainer = document.querySelector('#container')

router.get(path, (a) => {
	hyperHTML(tableContainer)`${frontPage}`
})

router.navigate(path)

// Import electron store for saving all the items
const Store = require('electron-store')
const store = new Store()
// Ipc renderer
const { ipcRenderer } = require('electron')
// Helpers
const { copyTextById, readStore, uniqueUuid } = require('./js/helpers.js')

const settings = {
	maxTextLength: 50,
}

// DOM Elements
const itemsContainer = document.querySelector('.items-container')
const items = itemsContainer.querySelectorAll('.item')
const plusBtnContainer = document.querySelector('.plus-btn')
const plusBtnImg = document.querySelector('.plus-btn-img')
const plusBtnForm = document.querySelector('.plus-btn-form')
const plusBtnInput = document.querySelector('.plus-btn-form input')

// Render all the items that are in the store
renderAll()

// DOM listeners
document.addEventListener('keyup', event => {
	switch (event.code) {
		case 'Enter':
			if (!event.ctrlKey) break
			showPlusBtnInput(true)
			break
	}
})

// Copy item's text on click
plusBtnContainer.addEventListener('click', () => {
	showPlusBtnInput(true)
})

// Add the item to the store after form submits
plusBtnForm.addEventListener('submit', event => {
	event.preventDefault()
	const value = plusBtnInput.value
	if (value) addItem(value)
	plusBtnInput.value = ''
	showPlusBtnInput(false)
})

plusBtnInput.addEventListener('blur', () => {
	showPlusBtnInput(false)
})
plusBtnInput.addEventListener('keyup', event => {
	if (event.code === 'Escape') showPlusBtnInput(false)
})

document.addEventListener(
	'contextmenu',
	event => {
		const id = event.target.getAttribute('data-id')
		const msg = {
			ID: id,
		}
		ipcRenderer.send('ctxmenu:show', msg)
	},
	false
)

// ipc listeners //
ipcRenderer.on('delete-item', (event, ID) => {
	removeItem(ID)
})
ipcRenderer.send('ready-to-reload')
ipcRenderer.on('reload-items', () => {
	itemsContainer.innerHTML = ''
	renderAll()
	ipcRenderer.send('ready-to-reload')
})

/**
 * Set the state of the plus btn
 */
function showPlusBtnInput(state = false) {
	if (state) {
		plusBtnImg.classList.add('hide')
		plusBtnForm.classList.remove('hide')
		plusBtnInput.focus()
	} else {
		plusBtnImg.classList.remove('hide')
		plusBtnForm.classList.add('hide')
	}
}

/**
 * Render all items in store
 */
function renderAll() {
	const items = readStore()
	const keys = Object.keys(items)
	if (keys.length > 0)
		keys.forEach(key => {
			renderItem(key)
		})
}

/**
 * Render an item based on ID
 * @param {number} id - the id of the item that should be rendered
 */
function renderItem(id) {
	const p = document.createElement('p')
	const text = readStore(id)
	p.classList = 'item'
	p.setAttribute('data-id', id)
	p.innerText =
		text.length > settings.maxTextLength
			? text.substr(0, settings.maxTextLength) + '...'
			: text
	p.addEventListener('click', () => {
		const id = p.getAttribute('data-id')
		copyTextById(id)
	})
	itemsContainer.appendChild(p)
}

/**
 * Add item to store
 * @param {String} text - the text that should be inserted
 */
function addItem(text) {
	const id = uniqueUuid()
	store.set('items.' + id, text)
	renderItem(id)
}
/**
 * Remove item from store
 * @param {String} id - the ID of the item that should be removed
 */
function removeItem(id) {
	store.delete('items.' + id)
	const element = document.querySelector(`[data-id="${id}"]`)
	element.remove()
}

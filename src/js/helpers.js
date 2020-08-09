const { v4: uuid } = require('uuid')
const Store = require('electron-store')
const store = new Store()

/**
 * Generate a unique uuid (recursive)
 * @param {Store} store - A placeholder for store
 */
function uniqueUuid(store = readStore()) {
	const id = uuid()
	if (store[id]) return uniqueUuid(store)
	return id
}

/**
 * Get all items in store
 * @param {String} id - The ID to read (reads everything if empty)
 */
function readStore(id) {
	const data = store.get('items')
	if (!data) store.set('items', {})
	return store.get(`items${id ? '.' + id : ''}`)
}

/**
 * Copy to clipboard by ID
 * @param {string} id - The ID to get the text from
 */
function copyTextById(id) {
	const text = readStore(id)
	ipcRenderer.send('copy-and-hide', text)
}

module.exports = {
	copyTextById,
	readStore,
	uniqueUuid,
	store,
}

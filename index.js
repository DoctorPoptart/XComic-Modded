const { app, BrowserWindow, net } = require('electron')

app.setAppUserModelId("XComic")

function createWindow () {
	const win = new BrowserWindow({
		icon: __dirname+'/Image/favicon.ico',
		minWidth: 800,
		minHeight: 600,
		frame: false,
		center: true,
		title: 'X Comic Downloader v2.3.3',
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false
		}
	})


	win.maximize(true)
	win.setMenu(null)

	win.addListener('close', e => {
		e.preventDefault()
	})

	win.loadFile(require('path').join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
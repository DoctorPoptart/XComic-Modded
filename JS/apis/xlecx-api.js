let fetch = require("node-fetch")
const cookie = "dle_user_id=166860; dle_password=f41fd326b9781460115e96121182305a;"
class XlecxAPI {
	#status = [403, 404, 500, 503]
	#statusMessage = [
		"You don't have the permission to View this Page.",
		"Page Not Found.",
		"Internal Server Error.",
		"Server is unavailable at this Time."
	]

	#predefined_tags = [
		{
			"name": "Dick girls",
			"url": "futanari/" 
		},
		{
			"name": "Blowjob",
			"url": "blowjob/"
		},
		{
			"name": "Furry",
			"url": "furry/",
		},
		{
			"name": "Incest",
			"url": "incest/"
		},
		{
			"name": "3D",
			"url": "3d/"
		},
		{
			"name": "Yaoi",
			"url": "yaoi/"
		},
		{
			"name": "Yuri",
			"url": "yuri/"
		}
	]


	constructor() {
		this.baseURL = 'https://xlecx.one'
		this.groupURL = '/xfsearch/group/'
		this.artistURL = '/xfsearch/artist/'
		this.parodyURL = '/xfsearch/parody/'
		this.tagURL = '/tags/'
		this.searchURL = '/index.php?do=search'
	}

	#lastSlash(str) {
		const base = new String(str).substring(str.lastIndexOf('/') + 1)
		return base
	}

	#getOverviewPages(text) {
		return Number(text.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace('шьп', '').replace(/ /g, ''))
	}

	#getPagnitionNumber(text, list = []) {
		let txt = text.replace('http://','').replace('https://','').replace('xlecx.one','').replace('xlecx.org','').replace('xlecx.com','')
		for (let i = 0; i < list.length; i++) txt = txt.replace(list[i],'')
		return Number(txt.replace('/page/','').replace(/\//g,''))
	}

	#getThumb(text) {
		return text.replace('http://','').replace('https://','').replace('xlecx.one','').replace('xlecx.org','').replace('xlecx.com','')
	}

	getPage(options = {page:1, random:false, pagination:true, category:false}, callback) {
		const page = options.page || 1
		const random = options.random || false
		const pagination = options.pagination || true
		const category = options.category || false
		callback = callback || null
		const url = this.baseURL+'/page/'+page+'/'

		if (typeof callback !== 'function') throw "Callback Should Be Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			let href
			container = htmlDoc.getElementById("dle-content").children
			
			// Category
			if (category == true) {
				arr.categories = this.#predefined_tags
			}

			// Random
			if (random == true) {
				arr.random = []
				li = htmlDoc.getElementsByClassName("sect__content")[1].children
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					
					href = li[i].getAttribute("href")
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.random.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}
			}

			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
						"thumb": image,
						"pages": pages,
						"url": href
					})
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
				}
				arr.pagination.push([">", page+1])
			}

			if (hasPost == false && category == false && random == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getCategories(callback) {
		const url = this.baseURL+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html'), slashReg = new RegExp('/', 'g'), arr = []
			let li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			for (let i=0; i<li.length; i++) arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL, '').replace(slashReg, '') })
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getCategory(name, options = {page:1, random:false, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const random = options.random || false
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+'/'+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			

			arr.categories = this.#predefined_tags


			// Random
			if (random == true) {
				arr.random = []
				li = htmlDoc.getElementsByClassName("sect__content")[1].children
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					
					href = li[i].getAttribute("href")
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					arr.random.push({
						"id": this.#lastSlash(href),
						"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
						"thumb": image,
						"pages": pages,
						"url": href
					})
				}
			}

			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
				}
				arr.pagination.push([">", page+1])
			}

			if (hasPost == false && category == false && random == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getComic(id, options = {raw:false, related:true}, callback) {
		const raw = options.raw || false
		const related = options.related || true
		const url = this.baseURL+'/'+id
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, arr = {}

			let li = htmlDoc.getElementsByClassName('page')[0].children
			if (li.length != 0) {
				li = li[0]
				arr.url = url
				arr.title = li.getElementsByTagName('h1')[0].textContent
				arr.images = []



				let info = htmlDoc.getElementsByClassName("page__subinfo")[0].children

				// Groups
				if (0 in info) {
					let t = info[0].getElementsByTagName('a')
					if (t.length > 0) {
						arr.groups = []
						for (let i=0; i<t.length; i++) {
							arr.groups.push({
								"name": t[i].textContent,
								"url": t[i].getAttribute('href')
							})
						}
					}
				}
				

				// Artist
				if (1 in info) {
					let t = info[1].getElementsByTagName('a')
					if (t.length > 0 ) {
						arr.artists = []
						for (let i=0; i<t.length; i++) {
							arr.artists.push({
								"name": t[i].textContent,
								"url": t[i].getAttribute('href')
							})
						}
					}
				}

				// Parody
				if (2 in info) {
					let t = info[2].getElementsByTagName('a')
					if (t.length > 0) {
						arr.parody = []
						for (let i=0; i<t.length; i++) {
							arr.parody.push({
								"name": t[i].textContent,
								"url": t[i].getAttribute('href')
							})
						}
					}
				}

				// Tags
				if (3 in info) {
					let t = info[3].getElementsByTagName('a')
					if (t.length > 0) {
						arr.tags = []
						for (let i=0; i<t.length; i++) {
							arr.tags.push({
								"name": t[i].textContent,
								"url": t[i].getAttribute('href')
							})
						}
					}
				}


				// Images
				let partsGallery = htmlDoc.getElementById("partsGallery")
				let pageTexts = htmlDoc.getElementsByClassName("page__text")
				if (partsGallery) {
					gg = partsGallery.getElementsByTagName("img")
					for (let i=0; i<gg.length; i++) {
						bb = gg[i].getAttribute('src')
						arr.images.push({
							"src": bb,
							"thumb": bb
						})
					}
				} else if (pageTexts.length > 0) {
					gg = pageTexts[0].getElementsByTagName("img")
					for (let i=0; i<gg.length; i++) {
						bb = gg[i].getAttribute('src') || gg[i].getAttribute('data-src') 
						arr.images.push({
							"src": this.baseURL+bb.replace("/thumbs", ""),
							"thumb": this.baseURL+bb.replace("/thumbs", "")
						})
					}
				}
				

				// Related
				if (related == true) {
					li = htmlDoc.getElementsByClassName("sect__content")[1].children
					console.log(li)
					if (li.length > 0) {
						arr.related = []
						for (let i = 0; i < li.length; i++) {

							let pages = undefined
							let thumbLabels = li[i].getElementsByClassName("thumb__label")
							if (thumbLabels.length > 0) {
								pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
							}

							let href = li[i].getAttribute("href")
							let images = li[i].getElementsByTagName("img")
							let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
							if (images.length > 0) image = images[0].getAttribute("src")
							try {
								arr.related.push({
									"id": this.#lastSlash(href),
									"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
									"thumb": image,
									"pages": pages,
									"url": href
								})
							} catch(e) {}
						}
					}
				}
				
			} else arr = null

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getComicRelated(id, callback) {
		const url = this.baseURL+'/'+id
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, arr = [], li

			li = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('full-in')
			if (li.length != 0) {
				gg = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('floats clearfix')
				if (gg.length > 0) {
					li = gg[0].getElementsByClassName('thumb')
					if (li.length > 0) {
						for (let i = 0; i < li.length; i++) {
							gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
							bb = li[i].getElementsByClassName('th-time icon-l')[0]
							if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
							else bb = null

							let images = li[i].getElementsByTagName("img")
							let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
							if (images.length > 0) image = images[0].getAttribute("src")
							try {
								arr.content.push({
									"id": this.#lastSlash(href),
									"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
									"thumb": image,
									"pages": pages,
									"url": href
								})
							} catch(e) {}
						}
					} else arr = null
				} else arr = null
			} else arr = null

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getAllTags(category = false, callback = (error = '', result = {}) => {}) {
		category = category || false
		const url = this.baseURL+'/tags/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, li

			li = htmlDoc.getElementsByClassName('clouds_xsmall')
			arr.tags = []
			for (let i=0; i<li.length; i++) {
				gg = li[i].children[0]
				arr.tags.push({
					"name": gg.textContent,
					"url": gg.getAttribute('href')
				})
			}


			arr.categories = this.#predefined_tags


			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getGroup(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.groupURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback to Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			container = htmlDoc.getElementsByClassName('main')[0].children
			

			arr.categories = this.#predefined_tags


			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					let href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
					arr.pagination.push([">", page+1])
				}
				
			}
			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getArtist(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.artistURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			

			arr.categories = this.#predefined_tags

			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					let href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
					arr.pagination.push([">", page+1])
				}
				
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getParody(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.parodyURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			

			arr.categories = this.#predefined_tags


			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					let href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
					arr.pagination.push([">", page+1])
				}
				
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getTag(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.tagURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {"headers": {"cookie": cookie}}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			

			arr.categories = this.#predefined_tags


			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					let href = li[i].getAttribute("href")

					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}
					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
					arr.pagination.push([">", page+1])
				}
				
			}
			
			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	search(text, options = {page:1, pagination:true, category:false}, callback) {
		text = text || null
		if (text == null) throw "Text value can't Be Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		callback = callback || null
		const url = this.baseURL+this.searchURL

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				"Cookie": cookie,
				credentials: "same-origin"
			},
			body: `do=search&subaction=search&search_start=${page}&full_search=0&result_from=${(page - 1) * 15 + 1}&story=${text}`
		}).then(response => {
			if (!response.ok) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2

			// Category
			arr.categories = this.#predefined_tags

			li = htmlDoc.getElementById("dle-content").children[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				console.log(li)
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("thumb")) continue
					
					let href = li[i].getAttribute("href")

					console.log(li[i])
					let pages = undefined
					let thumbLabels = li[i].getElementsByClassName("thumb__label")
					if (thumbLabels.length > 0) {
						pages = thumbLabels[0].textContent.replace(/\D/g,'')+" Pages"
					}

					let images = li[i].getElementsByTagName("img")
					let image = "https://xlecx.one/templates/VideoTrex/dleimages/no_image.jpg"
					if (images.length > 0) image = images[0].getAttribute("src")
					try {
						arr.content.push({
							"id": this.#lastSlash(href),
							"title": li[i].getElementsByClassName("thumb__title")[0].textContent,
							"thumb": image,
							"pages": pages,
							"url": href
						})
					} catch(e) {}
				}

				// Pagination
				let pagination_pages = htmlDoc.getElementsByClassName("pagination__pages")
				arr.pagination = []
				
				
				if (pagination == true && pagination_pages.length > 0) {
					arr.pagination.push(["<", page-1])	
					li = pagination_pages[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage
						value = li[i].textContent

						if (li[i].tagName == 'SPAN') pPage = null
						else pPage = li[i].textContent
						
						arr.pagination.push([value, pPage])
					}
					arr.pagination.push([">", page+1])
				}
				
			}
		

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}
}
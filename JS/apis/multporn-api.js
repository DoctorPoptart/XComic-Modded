class MultpornAPI {
	#status = [403, 404, 500, 503]
	#statusMessage = [
		"You don't have the permission to View this Page.",
		"Page Not Found.",
		"Internal Server Error.",
		"Server is unavailable at this Time."
	]

	constructor() {
		this.baseURL = 'https://multporn.net'
		this.characterURL = '/characters/'
		this.artistURL = '/authors_comics/'
		this.parodyURL = '/comics/'
		this.tagURL = '/category/'
		this.searchURL = 'https://multporn.net/search?type=1&sort_by=search_api_relevance&undefined=Search&views_fulltext='
	}

	#lastSlash(str) {
		const base = new String(str).substring(str.lastIndexOf('/') + 1)
		return base
	}
	#getPagnitionNumber(text, list = []) {
		let txt = text.replaceAll('http://','').replaceAll('https://','').replaceAll('xlecx.one','').replaceAll('xlecx.org','').replaceAll('xlecx.com','')
		for (let i = 0; i < list.length; i++) txt = txt.replaceAll(list[i],'')
		return Number(txt.replaceAll('/page/','').replaceAll(/\//g,''))
	}

	#getThumb(text) {
		return text.replaceAll('http://','').replaceAll('https://','').replaceAll('xlecx.one','').replaceAll('xlecx.org','').replaceAll('xlecx.com','')
	}

	getPage(options = {page:1, pagination:true}, callback) {
		const page = options.page || 1
		const random = options.random || false
		const pagination = options.pagination || true
		const category = options.category || false
		callback = callback || null
		const url = this.baseURL+'/new?type=1&sort_by=changed&sort_order=DESC&page='+(page-1)+'/'

		if (typeof callback !== 'function') throw "Callback Should Be Function."

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

			li = htmlDoc.getElementsByClassName("view-content")[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("masonry-item")) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")

					let thumb = li[i].getElementsByClassName("views-field-field-preview")[0].children[0].children[0].children[0].getAttribute("src")
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}


				// Pagination
				arr.pagination = []
				if (page > 1) arr.pagination.push(["<", page-1])
				if (pagination == true) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
				}
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

		fetch(url).then(response => {
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
			for (let i=0; i<li.length; i++) arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL, '').replaceAll(slashReg, '') })
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
			
			// // Category
			// if (category == true) {
			// 	arr.categories = []
			// 	li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			// 	for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			// }

			li = htmlDoc.getElementsByClassName("view-content")[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("masonry-item")) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")

					let thumb = li[i].getElementsByClassName("views-field-field-preview")[0].children[0].children[0].children[0].getAttribute("src")
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}


				// Pagination
				arr.pagination = []
				if (page > 1) arr.pagination.push(["<", page-1])
				if (pagination == true) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
				}
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
		const url = this.baseURL+'/comics/'+id
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
			let gg = 0, bb = 0, arr = {}


			arr.url = url
			arr.title = htmlDoc.getElementById("page-title").innerText.substring(1)
			arr.images = []

			// Artist
			if (htmlDoc.getElementsByClassName("field-name-field-author").length > 0) {
				let authors = htmlDoc.getElementsByClassName("field-name-field-author")[0].getElementsByClassName("links")[0].children
				arr.artists = []
				for (let i=0; i<authors.length; i++) {
					arr.artists.push({
						"name": authors[i].children[0].innerText,
						"url": authors[i].children[0].getAttribute("href")
					})
				}
			}

			// Parody
			if (htmlDoc.getElementsByClassName("field-name-field-com-group").length > 0) {
				let authors = htmlDoc.getElementsByClassName("field-name-field-com-group")[0].getElementsByClassName("links")[0].children
				arr.parody = []
				for (let i=0; i<authors.length; i++) {
					arr.parody.push({
						"name": authors[i].children[0].innerText,
						"url": authors[i].children[0].getAttribute("href")
					})
				}
			}

			// Tags
			if (htmlDoc.getElementsByClassName("field-name-field-category").length > 0) {
				let authors = htmlDoc.getElementsByClassName("field-name-field-category")[0].getElementsByClassName("links")[0].children
				arr.tags = []
				for (let i=0; i<authors.length; i++) {
					arr.tags.push({
						"name": authors[i].children[0].innerText,
						"url": authors[i].children[0].getAttribute("href")
					})
				}
			}

			// Images

			let li = htmlDoc.getElementsByClassName("jb-image")
			arr.images = []
			for (let i=0; i<li.length; i++) {
				let src = li[i].children[0].getAttribute("src").substring(0, li[i].children[0].getAttribute("src").lastIndexOf("?"))
				arr.images.push({
					"src": src,
					"thumb": src
				})
			}

			// Related
			arr.related = []
			li = htmlDoc.getElementsByClassName("row-first")
			if (li.length > 0) {
				li = li[0].children

				
				for (let i=0; i<li.length; i++) {
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")

					let thumb = li[i].getElementsByClassName("views-field-field-preview")[0].children[0].children[0].children[0]
					arr.related.push({
						"id": this.#lastSlash(href),
						"title": title,
						"thumb": thumb.getAttribute("src"),
						"pages": null,
						"url": href
					})
				}
			}


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

							arr.push({
								"id": this.#lastSlash(gg),
								"title": li[i].getElementsByClassName('th-title')[0].textContent,
								"thumb": this.#getThumb(li[i].getElementsByTagName('img')[0].getAttribute('src')),
								"pages": bb,
								"url": gg
							})
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

			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			}

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
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			}

			container = htmlDoc.getElementById("dle-content").children
			if (container.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]

					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": this.#getThumb(save2[0].getAttribute('src')),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					li = htmlDoc.getElementById('bottom-nav') || null
					arr.pagination = []
					if (li != null) {
						li = li.querySelector('.navigation').children || null
						for (let i = 0; i < li.length; i++) {
							let value, pPage
							if (li[i].textContent == "") {
								if (i == li.length - 1) value = ">"
								else value = "<"
							} else value = li[i].textContent

							if (li[i].tagName == 'SPAN') pPage = null
							else {
								pPage = this.#getPagnitionNumber(li[i].getAttribute('href'), [this.groupURL, name.replaceAll(/ /g, '%20')])
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
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
		const url = this.baseURL+"/authors_comics/"+(name.replaceAll(" ", "_"))+"?page=0,"+(page-1)
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
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// // Category
			// if (category == true) {
			// 	arr.categories = []
			// 	li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			// 	for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			// }

			li = htmlDoc.getElementsByClassName("view-content")[0].getElementsByTagName("td")
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("col")) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")
					let thumb = "https://multporn.net/sites/default/files/styles/pre_authors_comics/public/default_images/no-image_1_0.jpg?itok=Vf9KoZcc"
					try {
						let fields = li[i].children
						let preview
						for (let i=0;i<fields.length;i++) {
							if (fields[i].className.includes("preview")) {
								preview = fields[i]
								break
							}
						}
						thumb = preview.children[0].children[0].children[0].getAttribute("src")
					} catch(e) {
						console.error(e)
					}
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}


				// Pagination
				arr.pagination = []
				if (page > 1) arr.pagination.push(["<", page-1])
				if (pagination == true) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
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
		const url = this.baseURL+'/comics/'+(name.replaceAll(" ", "_").replaceAll("-","_").replaceAll(":", ""))+'?page=0,'+(page-1)
		console.log(url)
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
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// // Category
			// if (category == true) {
			// 	arr.categories = []
			// 	li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			// 	for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			// }

			li = htmlDoc.getElementsByClassName("view-content")[0].getElementsByTagName("td")
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					console.log(li[i])
					if (!li[i].className.includes("col")) continue
					if (li[i].getElementsByClassName("views-field-title").length < 1) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")
					let thumb = "https://multporn.net/sites/default/files/styles/pre_authors_comics/public/default_images/no-image_1_0.jpg?itok=Vf9KoZcc"
					try {
						let fields = li[i].children
						let preview
						for (let i=0;i<fields.length;i++) {
							if (fields[i].className.includes("preview")) {
								preview = fields[i]
								break
							}
						}
						thumb = preview.children[0].children[0].children[0].getAttribute("src")
					} catch(e) {
						console.error(e)
					}
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}


				// Pagination
				arr.pagination = []
				if (page > 1) arr.pagination.push(["<", page-1])
				if (pagination == true) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
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
		const url = this.baseURL+'/category/'+(name.replaceAll(" ", "_"))+"?page=0,"+(page-1)
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
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// // Category
			// if (category == true) {
			// 	arr.categories = []
			// 	li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			// 	for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replaceAll(this.baseURL+'/', '').replaceAll(slashReg, '') })
			// }

			li = htmlDoc.getElementsByClassName("view-content")[0].getElementsByTagName("td")
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("col")) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")
					let thumb = "https://multporn.net/sites/default/files/styles/pre_authors_comics/public/default_images/no-image_1_0.jpg?itok=Vf9KoZcc"
					try {
						let fields = li[i].children
						let preview
						for (let i=0;i<fields.length;i++) {
							if (fields[i].className.includes("preview")) {
								preview = fields[i]
								break
							}
						}
						thumb = preview.children[0].children[0].children[0].getAttribute("src")
					} catch(e) {
						console.error(e)
					}
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}


				// Pagination
				arr.pagination = []
				if (page > 1) arr.pagination.push(["<", page-1])
				if (pagination == true) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
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
		const url = this.baseURL+"/search?type=1&sort_by=search_api_relevance&undefined=Search&views_fulltext="+text+"&page="+(page-1)
		console.log(url)

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {
			method: 'GET',
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


			arr.categories = []


			container = htmlDoc.getElementsByClassName("view-content")[0].getElementsByTagName("div")
			li = container
			if (container.length > 1) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (!li[i].className.includes("masonry-item")) continue
					let title_field = li[i].getElementsByClassName("views-field-title")[0].children[0].children[0]
					let title = title_field.innerText
					let href = title_field.getAttribute("href")

					let thumb = li[i].getElementsByClassName("views-field-field-preview")[0].children[0].children[0].children[0].getAttribute("src")
					
					arr.content.push({
						"id": this.#lastSlash(href),
						"title": title,
						"pages": null,
						"thumb": thumb,
						"url": href
					})
				}

				// Pagination
				let pager = htmlDoc.getElementsByClassName("pager")
				arr.pagination = []
				if (pagination == true && pager.length > 0) {
					li = htmlDoc.getElementsByClassName("pager")[0].children
					for (let i = 0; i < li.length; i++) {
						let value, pPage

						if (li[i].className == "pager-item") {
							pPage = Number(li[i].children[0].innerText)
							value = li[i].children[0].innerText
						} else if (li[i].className == "pager-last last") {
							value = ">"
							pPage = page+1
						} else if (li[i].className == "pager-current first") {
							value = "1"
							pPage = 1
						} else if (li[i].className.includes("pager-current")) {
							value = li[i].innerText
							pPage = Number(li[i].innerText)
						}
						
						
						if (value) {
							arr.pagination.push([value, pPage])
						}
						
					}
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
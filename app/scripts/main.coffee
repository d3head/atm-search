replaceCurrency = (->
  translate_re = /(rur|usd|eur)/g
  translate =
    rur: "рубли"
    usd: "доллары"
    eur: "евро"

  (s) ->
    s.replace translate_re, (match, entity) ->
      translate[entity]
)()

$("#atm-search").selectize
	highlight: true
	valueField: "title"
	labelField: "title"
	searchField: ["title", "address"]
	sortField: "asc"
	create: false
	openOnFocus: false
	persist: false
	maxItems: 1
	render:
		option: (item, escape) ->
	    "<div><span class='title'>" + escape(item.title) + "</span><span class='address'>" + escape(item.address) + "</span></div>"

	onItemRemove: ->
		$("#YMapsID").empty()
		$(".content").fadeOut("fast")

	onChange: ->
		$("#YMapsID").empty()
		$(".content").fadeOut("fast")

	onItemAdd: (value, item) ->
	#	$("h1").text(value)
		$.ajax
			url: "http://127.0.0.1:3000/search/" + encodeURIComponent(value)
			type: "GET"
			error: ->
				callback()
				return

			success: (res) ->
				$(".content").fadeIn("fast")
				$("h1").text(res[0].title)
				$("h2").text(res[0].address)
				if res[0].is24 == 1
					is24 = "Да"
				else
					is24 = "Нет"
				$("p.around > span").text(is24)
				currency = replaceCurrency(res[0].out.toString())
				$("p.currency > span").text(currency)
				myMap = new ymaps.Map("YMapsID",
				  center: [
				    res[0].lat
				    res[0].lon
				  ]
				  zoom: 16
				  controls: []
				)
				myPlacemark = new ymaps.Placemark(myMap.getCenter(),
				  balloonContentBody: [
				    "<address>"
				    "<strong>" + res[0].title + "</strong>"
				    "<br/>"
				    "" + res[0].address + ""
				    "</address>"
				  ].join("")
				,
				  preset: "islands#redDotIcon"
				)
				myMap.geoObjects.add myPlacemark

				return

		return

	load: (query, callback) ->
	  return callback()  unless query.length
	  $.ajax
	    url: "http://127.0.0.1:3000/search/" + encodeURIComponent(query)
	    type: "GET"
	    error: ->
	      callback()
	      return

	    success: (res) ->
	      callback res.slice(0, 5)
	      return

	  return

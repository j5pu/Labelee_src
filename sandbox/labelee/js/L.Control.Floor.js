L.Control.Floor = L.Control.extend({
	options: {
		position: 'bottomright',
		panOffset: 500
	},
//
	onAdd: function (map) {
		var className = 'leaflet-control-floor',
			container = L.DomUtil.create('div', className),
			off = this.options.panOffset;

		this._panButton('Up'   , className + '-up'   
						, container, map, new L.Point(    0 , -off));
		//this._panButton('Left' , className + '-left' 
		//, container, map, new L.Point( -off ,  0));
		//this._panButton('Right', className + '-right'
		//				, container, map, new L.Point(  off ,  0));
		this._panButton('Down' , className + '-down'
						, container, map, new L.Point(    0 ,  off));
		
		return container;
	},

	_panButton: function (title, className, container, map, offset, text) {
		var wrapper = L.DomUtil.create('div', className + "-wrap", container);
		var link = L.DomUtil.create('a', className, wrapper);
		link.href = '#';
		link.title = title;
		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', function(){ alert ('Ascensor');map.panBy(offset); }, map)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)

		return link;
	}
});

L.Map.mergeOptions({
    panControl: true
});

L.Map.addInitHook(function () {
    if (this.options.panControl) {
		this.panControl = new L.Control.Floor();
		this.addControl(this.panControl);
	}
});

L.control.floor = function (options) {
    return new L.Control.Floor(options);
};

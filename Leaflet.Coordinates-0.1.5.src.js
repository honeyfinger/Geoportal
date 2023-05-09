L.Control.Coordinates = L.Control.extend({
	options: {
	},

	onAdd: function(map) {
		this._map = map;

		var className = 'leaflet-control-coordinates',
			container = this._container = L.DomUtil.create('div', className),
			options = this.options;

		this._labelcontainer = L.DomUtil.create("div", "uiElement label", container);
		this._label = L.DomUtil.create("span", "labelFirst", this._labelcontainer);

		this._inputcontainer = L.DomUtil.create("div", container);
		var xSpan, ySpan;
		if (options.useLatLngOrder) {
			this._inputY = this._createInput("inputY", this._inputcontainer);
			this._inputX = this._createInput("inputX", this._inputcontainer);
		} else {
		
		}

		map.on("mousemove", this._update, this);
		return container;
	},

	_createInput: function(classname, container) {
		var input = L.DomUtil.create("input", classname, container);
		return input;
	},

	_handleKeypress: function(e) {
		switch (e.keyCode) {
			case 27: //Esc
				this.collapse();
				break;
			case 13: //Enter
				this._handleSubmit();
				this.collapse();
				break;
			default: //All keys
				this._handleSubmit();
				break;
		}
	},

	_createCoordinateLabel: function(ll) {
		var opts = this.options,
			x, y;
		if (opts.customLabelFcn) {
			return opts.customLabelFcn(ll, opts);
		}
		if (opts.labelFormatterLng) {
			x = opts.labelFormatterLng(ll.lng);
		} else {
			x = L.Util.template(opts.labelTemplateLng, {
				x: this._getNumber(ll.lng, opts)
			});
		}
		if (opts.labelFormatterLat) {
			y = opts.labelFormatterLat(ll.lat);
		} else {
			y = L.Util.template(opts.labelTemplateLat, {
				y: this._getNumber(ll.lat, opts)
			});
		}
		if (opts.useLatLngOrder) {
			return y + " " + x;
		}
		return x + " " + y;
	},

	_getNumber: function(n, opts) {
		var res;
		if (opts.useDMS) {
			res = L.NumberFormatter.toDMS(n);
		} else {
			res = L.NumberFormatter.round(n, opts.decimals, opts.decimalSeperator);
		}
		return res;
	},

	_update: function(evt) {
		var pos = evt.latlng,
			opts = this.options;
		if (pos) {
			pos = pos.wrap();
			this._currentPos = pos;
			this._inputX.value = L.NumberFormatter.round(pos.lng, opts.decimals, opts.decimalSeperator);
			this._label.innerHTML = this._createCoordinateLabel(pos);
		}
	},
});

L.control.coordinates = function(options) {
	return new L.Control.Coordinates(options);
};

L.NumberFormatter = {
	round: function(num, dec, sep) {
		var res = L.Util.formatNum(num, dec) + "",
			numbers = res.split(".");
		if (numbers[1]) {
			var d = dec - numbers[1].length;
			for (; d > 0; d--) {
				numbers[1] += "0";
			}
			res = numbers.join(sep || ".");
		}
		return res;
	},

	toDMS: function(deg) {
		var d = Math.floor(Math.abs(deg));
		var minfloat = (Math.abs(deg) - d) * 60;
		var m = Math.floor(minfloat);
		var secfloat = (minfloat - m) * 60;
		var s = Math.round(secfloat);
		if (s == 60) {
			m++;
			s = "00";
		}
		if (m == 60) {
			d++;
			m = "00";
		}
		if (s < 10) {
			s = "0" + s;
		}
		if (m < 10) {
			m = "0" + m;
		}
		var dir = "";
		if (deg < 0) {
			dir = "-";
		}
		return ("" + dir + d + "&deg; " + m + "' " + s + "''");
	},	
};
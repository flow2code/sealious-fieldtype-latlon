var Sealious = require("sealious");

var latlong = new Sealious.FieldType({
	name: "latlong",
	has_index: function(){
		return false;
		return "2dsphere";
	},
	is_proper_value: function(context, params, value) {
		var synonyms = {
			"latitude": "lat",
			"long": "lon",
			"longitude": "lon",
		};

		if(value instanceof Array){
			value = {lat: value[0], lon: value[1]};
		}

		for(var i in synonyms){
			if(value[i]){
				value[synonyms[i]] = value[i];
				delete value[i];
			}
			}

		var required_attrs = ["lat", "lon"];
		for(var i in required_attrs){
			if(value[required_attrs[i]] === undefined){
				return Promise.reject("'." + required_attrs[i] + "' attribute not found!");
			}
		}
		for(var i in value){
			if(required_attrs.indexOf(i) == -1){
				return Promise.reject("Unknown attribute: '" + i + "'");
			}
		}
		if(parseFloat(value.lat) == NaN) return Promise.reject("Value for the 'lat' attribute is not a number!");
		if(parseFloat(value.lon) == NaN) return Promise.reject("Value for the 'lon' attribute is not a number!");
		if(Math.abs(value.lon)>180) return Promise.reject("Value out of range: 'lon'. Allowed range is <-180, 180>");
		if(Math.abs(value.lat)>90) return Promise.reject("Value out of range: 'lat'. Allowed range is <-90, 90>");
		return Promise.resolve();
	},
	encode: function(context, params, value){
		if(value instanceof Array){
			value = {lat: value[0], lon: value[1]};
		}
		return   { "type": "Point", "coordinates": [value.lon, value.lat].map(parseFloat) };
	},
	format: function(context, decoded_value, format){
		switch(format){
			case "geoJSON": return decoded_value;
			case "array": return decoded_value.coordinates;
			default: return decoded_value;
		}
	},
});


module.exports = latlong;

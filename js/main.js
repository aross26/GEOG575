function createMap(){

    
    //Varibles for attribution box on the map.
    var mbAttr = '<a href="http://openstreetmap.org">OpenStreetMap</a> |' + ' <a href="http://mapbox.com">Mapbox</a> |' + '<a href="https://annamoose.github.io/">Annamoose</a>'+ ' <a href="https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer">USGS WBD</a> |'; 
    
    //Variable for storing your Mapbox API Token
    var apitoken = 'pk.eyJ1IjoiYW5uYW1vb3NlIiwiYSI6ImNqNnh3dDlkdDFvbGYyd21ubzVyemFrdTIifQ.25r36ZiVm1gzeDwHBp_ZrA' 
        
     //URL used for Standard MaxBox Styles
    var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}';
    
    //styleURL used for Custom MapBox Style 
    var mbStyleUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={token}';
    
    //For basemap control layers 
    var satellite = L.tileLayer(mbStyleUrl, {id: 'annamoose/ck1fg0hqh3mqo1co4qq8f1dyj', token: apitoken,  attribution: mbAttr});
    
    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', token: apitoken, attribution: mbAttr});
    
    var outdoors = L.tileLayer(mbUrl, {id: 'mapbox.outdoors', token: apitoken,  attribution: mbAttr});
    
    //appears to be an issue with the WBD services... the HydroCached ones work.  
    //var wbd = L.tileLayer.wms("https://hydro.nationalmap.gov:443/arcgis/services/wbd/MapServer/WmsServer?", {
    var nhd = L.tileLayer.wms("https://basemap.nationalmap.gov:443/arcgis/services/USGSHydroCached/MapServer/WmsServer?", {
        layers: '0',
        format: 'image/png',
        transparent: true,
        attribution: "USGS"
    });


    var overlayMap = {
        "Drainage" : nhd,
    };
          
	//create the map
	var map = L.map('map', {
		center: [47.35, -100.29],
		zoom: 7,
        layers: outdoors //default 
	});
    
  //create the basemap control layer and add to map*/
    var baseLayers = {
		"Outdoors": outdoors,
        "Grayscale": grayscale,
		"Satellite": satellite,
       };
    
    L.control.layers(baseLayers, overlayMap).addTo(map); 
    getData(map);
};

//processing the GeoJSON and getting TIMESTAMPS for slider
//example 8; 

function processData(data) {
	var timestamps = [];
	var min = Infinity; 
	var max = -Infinity;
	for (var feature in data.features) {
		var properties = data.features[feature].properties; 
			for (var attribute in properties) { 
				if (attribute != "StationID" && attribute != "WATER_NAME" && attribute != "WATER_TYPE" && attribute != "count" && attribute != "SUBBASIN") {
					if ( $.inArray(attribute,timestamps) === -1) {
						timestamps.push(attribute);		
					}
					if (properties[attribute] < min) {	
						min = properties[attribute];
					}
					if (properties[attribute] > max) { 
						max = properties[attribute]; 
					}
				}
			}
		}
		return {
			timestamps : timestamps,
			min : min,
			max : max
		}
	};

//Step 6 Drawing proportional symbols, 
//example 10, adding markers to the map  
//Step 7 Scaling the proportional Symbols, example 12, but data values are so small that it doesn't show up very well or it's not calculating?
    //update propSymbols not cycling trhough timestamps, later it's not cycling through the timestamps 
function createPropSymbols(timestamps, data, map) { 
    cities = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                fillColor: "#faa21b",
                color: "#faa21b",
                weight: 1,
                fillOpacity: 0.6
            })  .on({
                mouseover: function() {
                    this.openPopup();
                    this.setStyle({color: "red"});
                },
                mouseout: function() {
                    this.closePopup();
                    this.setStyle({color: "#709749"}); 
                },
                click: function() {
                    $("#panel").html(panelContent);
                }
            });
        }
    }).addTo(map);
    updatePropSymbols(timestamps[0], map);
};

//DOESN"T WORK create pop-up content and bind to features
function onEachFeature(feature, layer) {
    var popContent = " ";
    if(feature.properties) {
        for (var property in feature.properties) {
            popUpContent += "<p>"+ property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popUpContent);
    };
};

//Proportional Symbols radius.  This call does not work as written.
function calcPropRadius(attValue) {
		var scaleFactor = 10;
		var area = attValue * scaleFactor;
        var radius = Math.sqrt(area/Math.PI);
        return radius;
	};

//DOESN'T WORK; can't read property of '1991' of undefined (var props)
//be ablet to pass timestamps to other functions
function updatePropSymbols(timestamp, map) {
    map.eachLayer(function(layer) {
        var props = layer.properties;
    //var radius = calcPropRadius(1);
    // var popupContent = "<b>" + String(props[timestamp]) +
        var popupContent = "<b>" + String(2) +
            " mg/L</b><b>" + 
           // "<i>" + props.name + 
            "</i> in </i>" +
            timestamp + "</i>";
        //layer.setRadius(radius);
        layer.bindPopup(popupContent);
        //layer.bindPopup(popupContent, {offset: new L.Point(0, -radius) });
    });
};


//DOESN'T WORK becuase there's no code here yet.  create timeslider that shows points that had samples during that particular year
// maybe? put the update createPropSymbols and iterate through the timestmaps n, N+1
function createSlider(timestamps){
    
}

//VALUES DON'T SHOW UP; BUT THE PANEL IS CREATED. create sequence controls to cycle through the timestamps and sample results
//if this one had UpdatePropsymbols and passed the iterative timestamps n, n+1 to slider
//create slider would be right after this; pass attributes as timestamp?

function createSequenceControls(map, attributes) {
    $('#panel').append('<input class="range-slider" type = "range">');
    $('.range-slider').attr({
        max: 29,
        min: 0,
        value: 0,
        step: 1
    });
};

//Main function to load geojson (works); 
//CALL TO OTHER FUNCTIONS. DOESN"T COMPLETELY WORK. load the features on the map; call functions to interact with features 
function getData(map) {
$.getJSON("data/pNDlakes.geojson")
    .done(function(data) {
        console.log(data);
        var attributes = processData(data);
        console.log(attributes.timestamps);
        createPropSymbols(attributes.timestamps, data, map);
        createSequenceControls(map);
//sequence controls added here
//      onEachFeature(feature, layer);
        updatePropSymbols();     
    })    
.fail(function() {alert("It seems we have a problem Hal")});    

}

$(document).ready(createMap); 	







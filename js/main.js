//create map
function createMap(){
    var map = L.map('map').setView([38.85, -90.34], 8);

    //add tile layers
    var mapboxOutdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        id: 'outdoors-v11', 
        attribution: '', 
        maxZoom: 18, 
        accessToken: 'pk.eyJ1IjoiYXJvc3MyNiIsImEiOiJjamxoYTNzcm8xZ2ZwM3FyMGh6eTNybXU2In0.ZT_iEx097pRHYa-40g4lyw'
    });
    var osmBase = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        minZoom: 1,
        maxZoom: 16
    });    
    var terrainBase = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png', {
        attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design<\/a>, ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0<\/a> &mdash; ' +
            'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        minZoom: 1,
        maxZoom: 16
    });

    // add initial basemap to map
    var base = terrainBase.addTo(map);

    // load feature layers
    var riverPools = L.esri.featureLayer({
        url: 'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/HREP_Project_Explorer/FeatureServer/4?token=Ca2cLJX0yvc9-KQZ_cjGlQY0EDWsqkGpv_5I86j0Vqs3yCz1m8unHl2bJSWr0HNaicop8zguT2XlC9watLYI8pOV33rdQDS7V2iXezlpUP7U4g7GZdPIPSiAd4LPgwpMBC2E6lMM93XmHF3_sVJVeDd3H7fVY0qC7Vv2iuv0pBOXIJdAqfQfiw68m1NhjYxabBVdksqS39hpKuqhe7ZVbtghK_coZ1NFOny6gerhPapyRi5YCW2zFXvxCpuIO-EyjDQVNrs515d2Ak8_m1i0Aw..'
    }).addTo(map);

// function to update basemap
function setBasemap(basemap) {
    if (base) {
        map.removeLayer(base);
    }

    if (
        basemap === 'Topographic' ||
        basemap === 'Imagery'
    ) {
        layer = L.esri.basemapLayer(basemap);
        map.addLayer(layer);
    } else if (
        basemap === 'Outdoor'
    ) {
        layer = mapboxOutdoors;
        map.addLayer(layer);
    } else if (
        basemap === 'Terrain'
    ) {
        layer = terrainBase;
        map.addLayer(layer);
    }
};

// update basemap when selection changes
var basemapSelector = document.getElementById('basemaps');
basemapSelector.addEventListener('change', function () {
    var basemap = (basemapSelector.value);
    console.log(basemap);
    setBasemap(basemap);
});

//zoom to selected pool
var poolSelector = document.getElementById('pools');
poolSelector.addEventListener('change', function() {
    var feat = (poolSelector.value);
    riverPools.query().where(feat).bounds(function (error, latLngBounds, response) {
        if (error) {
            console.log(error);
            return;
        }
        map.fitBounds(latLngBounds);
    })
})

};

$(document).ready(createMap)
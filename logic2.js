// Define coordinates for New York City and zoom level
let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Create the map object with options
let map = L.map('map-id', {
    center: newYorkCoords,
    zoom: mapZoomLevel
});

// Create the tile layer
let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to create markers and layer groups based on station status
function createMarkers(responseStations, responseStatus) {
    let stations = responseStations.data.stations;
    let status = responseStatus.data.stations;

    // Initialize layer groups for different station statuses
    let comingSoonLayer = L.layerGroup().addTo(map);
    let emptyLayer = L.layerGroup().addTo(map);
    let outOfOrderLayer = L.layerGroup().addTo(map);
    let lowLayer = L.layerGroup().addTo(map);
    let healthyLayer = L.layerGroup().addTo(map);

    // Loop through the stations array
    stations.forEach(station => {
        // Find the corresponding status for the station
        let stationStatus = status.find(s => s.station_id === station.station_id);
        let numBikesAvailable = stationStatus ? stationStatus.num_bikes_available : 0;
        let isInstalled = stationStatus ? stationStatus.is_installed : false;
        let isRenting = stationStatus ? stationStatus.is_renting : false;

        // Determine the layer based on the station status
        let marker;
        if (!isInstalled) {
            marker = L.ExtraMarkers.icon({
                icon: 'fa-bicycle',
                markerColor: 'orange',
                shape: 'circle',
                prefix: 'fa'
            });
            comingSoonLayer.addLayer(L.marker([station.lat, station.lon], { icon: marker })
                .bindPopup(`Station: ${station.name}<br>Capacity: ${station.capacity}<br>Available Bikes: ${numBikesAvailable}`));
        } else if (numBikesAvailable === 0) {
            marker = L.ExtraMarkers.icon({
                icon: 'fa-bicycle',
                markerColor: 'red',
                shape: 'circle',
                prefix: 'fa'
            });
            emptyLayer.addLayer(L.marker([station.lat, station.lon], { icon: marker })
                .bindPopup(`Station: ${station.name}<br>Capacity: ${station.capacity}<br>Available Bikes: ${numBikesAvailable}`));
        } else if (!isRenting) {
            marker = L.ExtraMarkers.icon({
                icon: 'fa-bicycle',
                markerColor: 'blue',
                shape: 'circle',
                prefix: 'fa'
            });
            outOfOrderLayer.addLayer(L.marker([station.lat, station.lon], { icon: marker })
                .bindPopup(`Station: ${station.name}<br>Capacity: ${station.capacity}<br>Available Bikes: ${numBikesAvailable}`));
        } else if (numBikesAvailable < 5) {
            marker = L.ExtraMarkers.icon({
                icon: 'fa-bicycle',
                markerColor: 'yellow',
                shape: 'circle',
                prefix: 'fa'
            });
            lowLayer.addLayer(L.marker([station.lat, station.lon], { icon: marker })
                .bindPopup(`Station: ${station.name}<br>Capacity: ${station.capacity}<br>Available Bikes: ${numBikesAvailable}`));
        } else {
            marker = L.ExtraMarkers.icon({
                icon: 'fa-bicycle',
                markerColor: 'green',
                shape: 'circle',
                prefix: 'fa'
            });
            healthyLayer.addLayer(L.marker([station.lat, station.lon], { icon: marker })
                .bindPopup(`Station: ${station.name}<br>Capacity: ${station.capacity}<br>Available Bikes: ${numBikesAvailable}`));
        }
    });

    // Create layer control
    let overlayMaps = {
        "Coming Soon": comingSoonLayer,
        "Empty Stations": emptyLayer,
        "Out of Order": outOfOrderLayer,
        "Low Stations": lowLayer,
        "Healthy Stations": healthyLayer
    };

    L.control.layers(null, overlayMaps).addTo(map);
}

// Perform API calls to get station information and status
Promise.all([
    d3.json('https://gbfs.citibikenyc.com/gbfs/en/station_information.json'),
    d3.json('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
]).then(([responseStations, responseStatus]) => {
    createMarkers(responseStations, responseStatus);
});
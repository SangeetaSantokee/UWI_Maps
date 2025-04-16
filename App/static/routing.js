// Routing Functionality
let routingControl = null;

let pointSelectionMode = null;
let startLatLng = null;
let endLatLng = null;

function enablePointSelection(type) {
    pointSelectionMode = type;
    alert(`Click on the map to select the ${type === 'start' ? 'starting' : 'ending'} point.`);
}

map.on('click', function(e) {
    if (!pointSelectionMode) return;

    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    if (pointSelectionMode === 'start') {
        startLatLng = e.latlng;
        document.getElementById('start-coords').textContent = `Lat: ${lat}, Lng: ${lng}`;
    } else if (pointSelectionMode === 'end') {
        endLatLng = e.latlng;
        document.getElementById('end-coords').textContent = `Lat: ${lat}, Lng: ${lng}`;
    }

    pointSelectionMode = null;
});

function calculateRoute() {
    if (!startLatLng || !endLatLng) {
        alert("Please select both start and end points on the map.");
        return;
    }

    if (routingControl !== null) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            startLatLng,
            endLatLng
        ],
        routeWhileDragging: false,
        showAlternatives: true,
        createMarker: function(i, wp) {
            return L.marker(wp.latLng).bindPopup(i === 0 ? "Start" : "End");
        }
    }).addTo(map);
}

function clearRoute() {
    if (routingControl !== null) {
        map.removeControl(routingControl);
        routingControl = null;

        // Reset coordinates and labels
        startLatLng = null;
        endLatLng = null;
        document.getElementById('start-coords').textContent = 'Not selected';
        document.getElementById('end-coords').textContent = 'Not selected';
    }
}

function setCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            startLatLng = L.latLng(lat, lng);
            document.getElementById('start-coords').textContent = `Lat: ${lat}, Lng: ${lng}`;

            // Optionally add a temporary marker or popup
            L.popup()
                .setLatLng(startLatLng)
                .setContent("Start: Your Current Location")
                .openOn(map);
        },
        function(error) {
            alert("Unable to retrieve your location: " + error.message);
        }
    );
}

function recenterMap() {
    map.setView([10.6411, -61.3995], 16); // UWI STA center
}
function setCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const startLatLng = L.latLng(lat, lng);

            // Center the map to user's current location
            map.setView(startLatLng, 17); // Zoom level 17 is more focused

            // Show a popup at the current location
            L.popup()
                .setLatLng(startLatLng)
                .setContent("You are here!")
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
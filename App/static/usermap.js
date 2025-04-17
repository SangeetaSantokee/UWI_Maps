const map = L.map('map').setView([10.6411, -61.3995], 16); // Center on UWI STA

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let allMarkers = [];

function createColoredIcon(color) {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

fetch('/api/markers')
    .then(res => res.json())
    .then(data => {
        allMarkers = data.map(m => {
            // Assuming 'm.color' exists in your data
            const icon = createColoredIcon(m.color);

            return {
                ...m,
                marker: L.marker([m.lat, m.lng], { icon: icon })
                    .bindTooltip(m.name, {
                        permanent: true,
                        direction: 'top',
                        offset: [0, -30],
                        className: 'marker-label'
                    })
                    .bindPopup(`<strong>${m.name}</strong><br>Type: ${m.type}<br>Faculty: ${m.faculty}`)
            };
        });

        updateMapMarkers();  // This updates the map whenever markers are fetched
    });

function updateMapMarkers() {
    const selectedFaculty = document.getElementById('facultyFilter').value;
    const showBuildings = document.getElementById('toggleBuildings').checked;
    const showClassrooms = document.getElementById('toggleClassrooms').checked;

    // Remove existing markers to re-render the updated set
    allMarkers.forEach(m => map.removeLayer(m.marker));

    allMarkers.forEach(m => {
        const matchFaculty = !selectedFaculty || m.faculty === selectedFaculty;
        const matchType = (showBuildings && m.type === "Building") || (showClassrooms && m.type === "Classroom");

        if (matchFaculty && matchType) {
            m.marker.addTo(map);
        }
    });
}

// Event listeners to trigger updates on filter change
document.getElementById('facultyFilter').addEventListener('change', updateMapMarkers);
document.getElementById('toggleBuildings').addEventListener('change', updateMapMarkers);
document.getElementById('toggleClassrooms').addEventListener('change', updateMapMarkers);
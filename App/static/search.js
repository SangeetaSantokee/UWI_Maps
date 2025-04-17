const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('searchSuggestions');

function filterSuggestions() {
    const input = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";

    allMarkers.forEach(m => {
        const displayText = `${m.name} (${m.faculty}, ${m.type})`;
        if (m.name.toLowerCase().includes(input)) {
            const option = document.createElement("option");
            option.value = displayText;
            option.dataset.name = m.name;
            suggestions.appendChild(option);
        }
    });
}

// Zoom to marker when user selects a valid item
searchInput.addEventListener("change", () => {
    const inputText = searchInput.value;
    const selected = allMarkers.find(m => {
        const displayText = `${m.name} (${m.faculty}, ${m.type})`;
        return displayText === inputText;
    });

    if (selected) {
        map.setView([selected.lat, selected.lng], 18);
        selected.marker.openPopup();
    }
});

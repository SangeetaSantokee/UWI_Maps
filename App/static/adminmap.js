document.addEventListener('DOMContentLoaded', function() {
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
});

// At the top or just after DOMContentLoaded
let pendingDeleteMarker = null;
let pendingLeafletMarker = null;

document.addEventListener('DOMContentLoaded', function() {
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  const deleteModal = M.Modal.getInstance(document.getElementById('delete-modal'));
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  const deleteMessage = document.getElementById('delete-message');

  // Confirm button handler
  confirmDeleteBtn.addEventListener('click', () => {
    if (pendingDeleteMarker && pendingLeafletMarker) {
      fetch(`/api/markers/${pendingDeleteMarker.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      .then(res => res.json())
      .then(result => {
        map.removeLayer(pendingLeafletMarker);
        M.toast({ html: 'Marker deleted successfully!' });

        // Reset UI and states
        cancelBtn.style.display = 'none';
        document.getElementById('submit-edit').style.display = 'none';
        pendingDeleteMarker = null;
        pendingLeafletMarker = null;
        deleteModal.close();
      });
    }
  });
});

let selectedColor = "red"; // Default color
let editMode = false;
let deleteMode = false;

const cancelBtn = document.getElementById('cancel-action');

function checkFormFields() {
  const name = document.getElementById('marker-name').value.trim();
  const type = document.getElementById('marker-type').value;
  const faculty = document.getElementById('marker-faculty').value;
  const colorSelected = document.querySelector('.color-circle.selected');

  // Show cancel button only if form is in edit or delete mode, or any field is filled
  if ((editMode || deleteMode) || name || type || faculty || colorSelected) {
    cancelBtn.style.display = 'inline-block';
  } else {
    cancelBtn.style.display = 'none';
  }
}

// Call checkFormFields when input changes
document.getElementById('marker-name').addEventListener('input', checkFormFields);
document.getElementById('marker-type').addEventListener('change', checkFormFields);
document.getElementById('marker-faculty').addEventListener('change', checkFormFields);
document.querySelectorAll('.color-circle').forEach(circle => {
  circle.addEventListener('click', checkFormFields);
});

document.querySelectorAll('.color-circle').forEach(circle => {
  circle.addEventListener('click', () => {
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
    circle.classList.add('selected');
    selectedColor = circle.getAttribute('data-color');
  });
});

const map = L.map('map').setView([10.6411, -61.3995], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Create icon based on color
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

let selectedMarker = null;
let selectedMarkerId = null;

// Load and add existing markers
fetch('/api/markers', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
})
.then(response => response.json())
.then(markers => {
    markers.forEach(marker => {
      const icon = createColoredIcon(marker.color);

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

      leafletMarker.bindTooltip(marker.name, {
          permanent: true,
          direction: 'top',
          offset: [0, -30],
          className: 'marker-label'
      });

      leafletMarker.on('click', () => {
        selectedMarker = leafletMarker;
        selectedMarkerId = marker.id;

        if (editMode) {
            // Populate form with marker data
            document.getElementById('marker-name').value = marker.name;
            document.getElementById('marker-type').value = marker.type;
            document.getElementById('marker-faculty').value = marker.faculty;
            document.getElementById('submit-edit').style.display = 'inline-block';
            M.updateTextFields(); // reinit Materialize
            M.FormSelect.init(document.querySelectorAll('select'));

            document.querySelectorAll('.color-circle').forEach(c => {
              c.classList.remove('selected');
              if (c.getAttribute('data-color') === marker.color) {
                c.classList.add('selected');
                selectedColor = marker.color;
              }
            });

            M.toast({html: `Editing marker: ${marker.name}`});
        } else if (deleteMode) {
          pendingDeleteMarker = marker;
          pendingLeafletMarker = leafletMarker;
          document.getElementById('delete-message').textContent = `Are you sure you want to delete marker: ${marker.name}?`;
        
          const deleteModal = M.Modal.getInstance(document.getElementById('delete-modal'));
          deleteModal.open();
        }
        // Reset modes after action
        editMode = false;
        deleteMode = false;
      });
      leafletMarker.bindPopup(`<strong>${marker.name}</strong><br>Type: ${marker.type}<br>Faculty: ${marker.faculty}`);
    });
});
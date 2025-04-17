let newMarkerData = null;

  document.getElementById('submit-marker').addEventListener('click', () => {
      if (editMode || deleteMode) {
          M.toast({html: 'Cannot add markers while in edit or delete mode'});
          return;
      }


      const name = document.getElementById('marker-name').value;
      const type = document.getElementById('marker-type').value;
      const faculty = document.getElementById('marker-faculty').value;
      const color = selectedColor;

      if (!name || !type || !faculty || !color) {
          M.toast({html: 'Please fill all fields'});
          return;
      }

      M.toast({html: 'Click on the map to place the marker'});
      document.getElementById('map').style.cursor = 'crosshair';

      map.once('click', function(e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          document.getElementById('map').style.cursor = '';

          fetch('/api/markers', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              },
              body: JSON.stringify({ name, type, faculty, lat, lng, color })
          })
          .then(res => res.json())
          .then(data => {
              const icon = createColoredIcon(color);

              L.marker([lat, lng], { icon })
                .addTo(map)
                .bindTooltip(name, {
                    permanent: true,
                    direction: 'top',
                    offset: [0, -30],
                    className: 'marker-label'
                })
                .bindPopup(`<strong>${name}</strong><br>Type: ${type}<br>Faculty: ${faculty}`);
              
              M.toast({html: 'Marker Added!'});

              // Clear form fields
              document.getElementById('marker-name').value = '';
              document.getElementById('marker-type').selectedIndex = 0;
              document.getElementById('marker-faculty').selectedIndex = 0;
              M.FormSelect.init(document.querySelectorAll('select')); // Reinitialize Materialize selects

              // Reset selected color
              document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
              selectedColor = 'red'; // Reset to default or leave blank
              document.querySelector(`.color-circle[data-color="${selectedColor}"]`).classList.add('selected');

              // Hide buttons after completion
              cancelBtn.style.display = 'none';
              document.getElementById('submit-edit').style.display = 'none';
              
              //Reload the page after adding a marker (For better functionality)
              setTimeout(() => {
                location.reload();
              }, 1000);
          });
      });
  });

  document.getElementById('submit-edit').addEventListener('click', () => {
    const name = document.getElementById('marker-name').value;
    const type = document.getElementById('marker-type').value;
    const faculty = document.getElementById('marker-faculty').value;
    const color = selectedColor;

    if (!selectedMarkerId) {
        M.toast({html: 'No marker selected for editing'});
        return;
    }

    fetch(`/api/markers/${selectedMarkerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ name, type, faculty, color })
    })
    .then(res => res.json())
    .then(result => {
      M.toast({html: 'Marker updated successfully!'});

      // Update marker on the map
      if (selectedMarker) {
          selectedMarker.setTooltipContent(name); // Update label
          const newIcon = createColoredIcon(color);
          selectedMarker.setIcon(newIcon); // Update icon color
          selectedMarker.bindPopup(`<strong>${name}</strong><br>Type: ${type}<br>Faculty: ${faculty}`); // Update popup too
      }

      // Reset form
      document.getElementById('submit-edit').style.display = 'none';
      cancelBtn.style.display = 'none';
      editMode = false;
      selectedMarkerId = null;
      selectedMarker = null;

      document.getElementById('marker-name').value = '';
      document.getElementById('marker-type').selectedIndex = 0;
      document.getElementById('marker-faculty').selectedIndex = 0;
      M.FormSelect.init(document.querySelectorAll('select'));
    });

  });


  document.getElementById('delete-marker').addEventListener('click', () => {
    if (editMode) {
        M.toast({html: 'Cannot delete markers while in edit mode'});
        return;
    }

    deleteMode = true;
    editMode = false;
    cancelBtn.style.display = 'inline-block';
    M.toast({html: 'Click a marker to delete'});
  });

  document.getElementById('update-marker').addEventListener('click', () => {
    editMode = true;
    deleteMode = false;
    cancelBtn.style.display = 'inline-block';
    M.toast({html: 'Click a marker to edit'});
  });

  document.getElementById('delete-marker').addEventListener('click', () => {
    deleteMode = true;
    editMode = false;
    cancelBtn.style.display = 'inline-block';
    M.toast({html: 'Click a marker to delete'});
  });

  cancelBtn.addEventListener('click', () => {
    editMode = false;
    deleteMode = false;
    document.getElementById('map').style.cursor = '';
    cancelBtn.style.display = 'none';
    M.toast({html: 'Action cancelled'});
  });

  document.getElementById('cancel-action').addEventListener('click', () => {
  // Clear form fields
  document.getElementById('marker-name').value = '';
  document.getElementById('marker-type').selectedIndex = 0;
  document.getElementById('marker-faculty').selectedIndex = 0;
  M.FormSelect.init(document.querySelectorAll('select'));

  // Deselect all colors
  document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
  selectedColor = 'red'; // Reset to default if needed
  document.querySelector(`.color-circle[data-color="${selectedColor}"]`).classList.add('selected');

  // Hide both buttons
  document.getElementById('submit-edit').style.display = 'none';
  document.getElementById('cancel-action').style.display = 'none';

  // Reset modes
  editMode = false;
  deleteMode = false;
});
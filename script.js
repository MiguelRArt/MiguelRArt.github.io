// Initialize the map with Esri World Imagery (satellite view)
const map = L.map('map').setView([4.982495, -74.402882], 18);

// Add the Esri Satellite tiles
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

// Initialize the FeatureGroup to store drawn layers
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Add the Leaflet.draw control to the map
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        remove: true
    },
    draw: {
        polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
                color: '#ff0000'
            }
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
    }
});
map.addControl(drawControl);

// Event listener for when a layer is created
map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    layer.notes = []; // Initialize an empty array to store notes
    drawnItems.addLayer(layer);

    // Open a popup with options to add a note
    openNotePopup(layer);
});

// Open a popup to manage notes
function openNotePopup(layer) {
    // Helper function to refresh popup content
    const refreshPopupContent = () => {
        const notesHtml = layer.notes.map((note, index) => `
            <div>
                <b>Note ${index + 1}:</b> ${note}
                <button data-index="${index}" class="edit-note">Edit</button>
                <button data-index="${index}" class="delete-note">Delete</button>
            </div>
        `).join("");

        const popupContent = `
            <form>
                <label for="newNote">Add a new note:</label><br>
                <textarea id="newNote" rows="2" style="width: 100%;" placeholder="Write your note here..."></textarea><br>
                <button type="button" id="addNote">Add Note</button>
            </form>
            <hr>
            <div id="notesContainer">${notesHtml || "<i>No notes added yet.</i>"}</div>
        `;

        layer.bindPopup(popupContent);
        layer.openPopup(); // Reopen the popup with refreshed content
    };

    // Add event listeners immediately
    refreshPopupContent();

    layer.off('popupopen'); // Remove previous listeners to avoid duplication
    layer.on('popupopen', () => {
        document.getElementById('addNote').addEventListener('click', () => {
            const newNote = document.getElementById('newNote').value.trim();
            if (newNote === "") {
                alert("Note cannot be empty.");
                return;
            }
            layer.notes.push(newNote); // Add the new note
            refreshPopupContent(); // Refresh the popup
        });

        document.querySelectorAll('.edit-note').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const updatedNote = prompt("Edit your note:", layer.notes[index]);
                if (updatedNote !== null && updatedNote.trim() !== "") {
                    layer.notes[index] = updatedNote; // Update the note
                    refreshPopupContent(); // Refresh the popup
                }
            });
        });

        document.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (confirm("Are you sure you want to delete this note?")) {
                    layer.notes.splice(index, 1); // Remove the note
                    refreshPopupContent(); // Refresh the popup
                }
            });
        });
    });

    // Trigger the popupopen event manually for the first time
    layer.fire('popupopen');
}

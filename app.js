const API_URL = "https://raw.githubusercontent.com/mandala-wt/Klettersteig/main/data.json";

let data = [];
let map;
let markers = [];

const app = document.getElementById("app");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

async function loadData() {
  const res = await fetch(API_URL + "?t=" + new Date().getTime());
  data = await res.json();
  render(data);
}

function initMap() {
  map = L.map('map').setView([47.5, 11.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

function updateMap(list) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  list.forEach(item => {
    if (item.lat && item.lng) {

      // Farbe je Schwierigkeit
      let color = "blue";
      if (item.schwierigkeit?.startsWith("A")) color = "green";
      else if (item.schwierigkeit?.startsWith("B")) color = "blue";
      else if (item.schwierigkeit?.startsWith("C")) color = "orange";
      else if (item.schwierigkeit?.startsWith("D")) color = "red";

      const marker = L.circleMarker([item.lat, item.lng], {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
      }).addTo(map);

      const popup = `
        <div style="min-width:150px;">
          <strong>${item.name}</strong><br>
          ${item.region || ""}<br>
          Schwierigkeit: ${item.schwierigkeit || "-"}<br>
          Dauer: ${item.dauer || "-"}<br><br>

          <a href="${item.url}" target="_blank">Details</a><br>
          <a href="https://www.google.com/maps?q=${item.lat},${item.lng}" target="_blank">
            Navigation starten
          </a>
        </div>
      `;

      marker.bindPopup(popup);

      markers.push(marker);
    }
  });

  // 🔥 Automatischer Zoom
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  }
}

function render(list) {
  app.innerHTML = list.map(item => `
    <div class="card">
      <strong>${item.name}</strong><br>
      Schwierigkeit: ${item.schwierigkeit || "-"}<br>
      Dauer: ${item.dauer || "-"}<br>
      <a href="${item.url}" target="_blank">Öffnen</a>
    </div>
  `).join("");

  updateMap(list);
}

function applyFilterAndSearch() {
  const f = filter.value;
  const s = search.value.toLowerCase();

  let filtered = data;

  if (f !== "all") {
    filtered = filtered.filter(item =>
      item.schwierigkeit && item.schwierigkeit.startsWith(f)
    );
  }

  if (s) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(s)
    );
  }

  render(filtered);
}

filter.addEventListener("change", applyFilterAndSearch);
search.addEventListener("input", applyFilterAndSearch);

initMap();
loadData();
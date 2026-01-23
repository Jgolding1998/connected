/*
 * Connected App Script
 *
 * This script powers the interactive behaviour of the Connected website.
 * It maintains a simple event store in the browser's localStorage, renders
 * events on a world map using Leaflet, shows them on a calendar using
 * FullCalendar, lists them in cards, and supports adding new events.
 * Additionally, a basic chat interface and a profile/reels section are
 * implemented for demonstration purposes.
 */

// Default sample events used if no events are stored in localStorage
// Define a default set of reel images to associate with events. Each event
// will use a copy of this array to avoid referencing the same array object.
const defaultEventReels = [
  'https://images.pexels.com/photos/3157506/pexels-photo-3157506.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/211356/pexels-photo-211356.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/206410/pexels-photo-206410.jpeg?auto=compress&cs=tinysrgb&w=800'
];
// Add some amusing, fictional events related to "Skyler" for demonstration purposes.
// These events will appear by default if the user hasn't created any yet.
const defaultEvents = [
  {
    id: 1,
    title: 'New Year\'s Gala',
    description: 'Ring in the new year with style at the annual New Year\'s Gala in New York City.',
    date: '2026-01-31T20:00',
    lat: 40.7128,
    lon: -74.0060,
    city: 'New York',
    image:
      'https://images.pexels.com/photos/313707/pexels-photo-313707.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 2,
    title: 'LA Tech Conference',
    description: 'Join developers and entrepreneurs for a day of innovation and networking in Los Angeles.',
    date: '2026-02-15T09:00',
    lat: 34.0522,
    lon: -118.2437,
    city: 'Los Angeles',
    image:
      'https://images.pexels.com/photos/2480708/pexels-photo-2480708.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 3,
    title: 'London Music Festival',
    description: 'Experience live performances from top artists at the London Music Festival.',
    date: '2026-03-20T18:00',
    lat: 51.5074,
    lon: -0.1278,
    city: 'London',
    image:
      'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 4,
    title: 'Tokyo Gaming Expo',
    description: 'Discover the latest in gaming technology at the Tokyo Gaming Expo.',
    date: '2026-04-10T10:00',
    lat: 35.6895,
    lon: 139.6917,
    city: 'Tokyo',
    image:
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 5,
    title: 'Paris Food Fair',
    description: 'Taste cuisines from around the world at the Paris Food Fair.',
    date: '2026-05-05T11:00',
    lat: 48.8566,
    lon: 2.3522,
    city: 'Paris',
    image:
      'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 6,
    title: 'Sydney Beach Party',
    description: 'Celebrate summer with a beach party in beautiful Sydney.',
    date: '2026-12-25T15:00',
    lat: -33.8688,
    lon: 151.2093,
    city: 'Sydney',
    image:
      'https://images.pexels.com/photos/356830/pexels-photo-356830.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  }
  ,
  // Fun "Skyler" themed events for the Connected platform
  {
    id: 7,
    title: 'Celebrating Skyler Party',
    description: 'Join us for a light‑hearted celebration of Skyler with music, cake and games!',
    date: '2026-06-15T18:00',
    lat: 38.9517, // Columbia, Missouri
    lon: -92.3341,
    city: 'Columbia',
    image: 'https://images.pexels.com/photos/207962/pexels-photo-207962.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 8,
    title: 'Skyler Trivia Night',
    description: 'Test your knowledge about all things Skyler in this quirky trivia competition — prizes included!',
    date: '2026-07-10T19:00',
    lat: 38.9517,
    lon: -92.3341,
    city: 'Columbia',
    image: 'https://images.pexels.com/photos/716411/pexels-photo-716411.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  },
  {
    id: 9,
    title: 'Skyler Charity Auction',
    description: 'Bid on Skyler’s prized possessions to raise money for charity — all in good fun!',
    date: '2026-08-05T17:00',
    lat: 38.9517,
    lon: -92.3341,
    city: 'Columbia',
    image: 'https://images.pexels.com/photos/534064/pexels-photo-534064.jpeg?auto=compress&cs=tinysrgb&w=800',
    privacy: 'public',
    creator: 'Jane Doe',
    reels: [...defaultEventReels]
  }
];

// Retrieve events from localStorage or fall back to defaults
let events = [];
function loadEvents() {
  try {
    // Load events using a storage key that reflects the new app name to avoid
    // collisions with any previous versions (such as the earlier "Get Connected").
    const stored = localStorage.getItem('connected_events');
    if (stored) {
      events = JSON.parse(stored).map(e => ({
        ...e,
        date: e.date
      }));
    } else {
      events = [...defaultEvents];
    }
  } catch (err) {
    console.error('Error loading events', err);
    events = [...defaultEvents];
  }
}

function saveEvents() {
  // Persist events to localStorage under the new key
  localStorage.setItem('connected_events', JSON.stringify(events));
}

// Haversine distance in miles between two latitude/longitude pairs
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Global calendar instance
let calendar;

// Current selected location for radius filtering (default: Columbia, Missouri)
let currentLocation = { lat: 38.9517, lon: -92.3341 };

// A base64-encoded version of the world map image. Embedding the map directly
// into the script avoids loading issues on some devices. The string was
// generated from world_map_small.png using base64 encoding.
const worldMapDataURI = 'data:image/png;base64,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';

// Variables to manage the custom interactive map
// Scale factor for zooming (1 means the map is shown at its original size)
let mapScale = 1;
// Translation offsets for panning (in pixels)
let mapTranslateX = 0;
let mapTranslateY = 0;
// Dimensions of the source world map image. We resize the image to this size in index.html.
// If you change the file used, update these values accordingly.
// Set the original dimensions of the world map image to match the actual
// resolution of world_map_small.png (768x512). Correct dimensions are
// important so that the coordinate conversion functions work properly and
// the map displays at the correct aspect ratio. If these values do not
// match the real image size, the map may appear stretched or not render
// correctly. Adjust them here if you resize the map asset.
const mapOriginalWidth = 768;
const mapOriginalHeight = 512;

// Variables for Leaflet-based map. When Leaflet is available these
// hold references to the map and markers/circles. These enable
// redrawing and cleanup when the map needs to be refreshed.
let leafletMap;
let leafletUserMarker;
let leafletRadiusCircle;
let leafletEventMarkers = [];

/*
 * Leaflet interactive map initialisation and updating
 *
 * The functions `initMapLeaflet` and `updateMapLeaflet` provide an
 * interactive experience using the Leaflet library. They are loaded
 * alongside the original static map implementation so that if Leaflet
 * fails to load (for example, due to network issues) the rest of the
 * application can still operate without breaking. When Leaflet is
 * available, we call these functions instead of the static map logic.
 */

function initMapLeaflet() {
  const mapContainer = document.getElementById('map');
  // Remove existing map if present
  if (leafletMap && leafletMap.remove) {
    leafletMap.remove();
  }
  // Clear out any fallback or custom content
  mapContainer.innerHTML = '';
  try {
    // Initialise the Leaflet map centered on the user's current location
    leafletMap = L.map('map').setView([currentLocation.lat, currentLocation.lon], 2);
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);
    // Hook up custom zoom buttons to Leaflet's zoom controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomInBtn && zoomOutBtn) {
      zoomInBtn.onclick = () => leafletMap.zoomIn();
      zoomOutBtn.onclick = () => leafletMap.zoomOut();
    }
    // When the map is clicked, update the current location and refresh views
    leafletMap.on('click', e => {
      currentLocation = { lat: e.latlng.lat, lon: e.latlng.lng };
      updateMapLeaflet();
      renderList();
      updateCalendar();
    });
    // Attach radius filter button behaviour
    const radiusBtn = document.getElementById('filterRadiusBtn');
    if (radiusBtn) {
      radiusBtn.onclick = () => {
        updateMapLeaflet();
        renderList();
        updateCalendar();
      };
    }
    // Draw markers and radius circle initially
    updateMapLeaflet();
  } catch (err) {
    // If Leaflet cannot be initialised, display a fallback message
    const fallback = document.createElement('p');
    fallback.textContent = 'Interactive map could not be loaded. Please check your connection.';
    fallback.style.padding = '2rem';
    fallback.style.textAlign = 'center';
    fallback.style.color = 'var(--text-light)';
    mapContainer.appendChild(fallback);
  }
}

function updateMapLeaflet(eventList = events) {
  // Only update if the Leaflet map has been initialised
  if (!leafletMap) return;
  // Determine which events to display. Apply radius filtering when passed the
  // global events array; otherwise assume the caller has filtered already.
  let filtered = eventList;
  if (eventList === events) {
    const radiusMilesVal = parseFloat(document.getElementById('radiusInput').value) || 100;
    filtered = events.filter(ev => {
      return haversineDistance(currentLocation.lat, currentLocation.lon, ev.lat, ev.lon) <= radiusMilesVal;
    });
  }
  // Remove existing markers and radius indicator
  if (leafletUserMarker) {
    leafletMap.removeLayer(leafletUserMarker);
    leafletUserMarker = null;
  }
  if (leafletRadiusCircle) {
    leafletMap.removeLayer(leafletRadiusCircle);
    leafletRadiusCircle = null;
  }
  leafletEventMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletEventMarkers = [];
  // Add marker for the selected location
  leafletUserMarker = L.circleMarker([currentLocation.lat, currentLocation.lon], {
    radius: 6,
    color: '#0b3556',
    fillColor: '#00a9c4',
    fillOpacity: 1,
    weight: 3
  }).addTo(leafletMap);
  // Draw the radius circle (convert miles to metres)
  const radiusMiles = parseFloat(document.getElementById('radiusInput').value) || 100;
  const radiusMeters = radiusMiles * 1609.34;
  leafletRadiusCircle = L.circle([currentLocation.lat, currentLocation.lon], {
    radius: radiusMeters,
    color: '#5e84c8',
    fillColor: '#5e84c8',
    fillOpacity: 0.1
  }).addTo(leafletMap);
  // Add markers for each event in the filtered list
  filtered.forEach(ev => {
    const marker = L.circleMarker([ev.lat, ev.lon], {
      radius: 5,
      color: '#5e84c8',
      fillColor: '#00a9c4',
      fillOpacity: 1
    }).addTo(leafletMap);
    marker.on('click', () => {
      showEventModal(ev);
    });
    leafletEventMarkers.push(marker);
  });
}

// Override the original updateMap function so that any existing calls to
// updateMap() invoke our Leaflet implementation instead. If Leaflet is
// unavailable, updateMapLeaflet() gracefully does nothing.
//
// NOTE: We no longer set updateMap to updateMapLeaflet by default because
// loading Leaflet may fail in restricted environments (e.g. local files or
// corporate networks). Leaving the override in place would cause the static
// map to never render. Instead, we retain the assignment here but comment
// it out. If you wish to enable Leaflet when available, you can uncomment
// the line below, but ensure that initMapLeaflet() is called conditionally.
// updateMap = updateMapLeaflet;
// A container div to hold event markers; created in initMap()
let markerLayerDiv;
// The underlying world map image element. Created in initMap().
let baseMapImg;

// Convert latitude and longitude to pixel coordinates on the map image
function latLonToPixel(lat, lon, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

// Convert pixel coordinates on the map image back to latitude and longitude
function pixelToLatLon(x, y, width, height) {
  const lon = (x / width) * 360 - 180;
  const lat = 90 - (y / height) * 180;
  return { lat, lon };
}

// Initialize the interactive Leaflet map and set up event listeners
function initMap() {
  const mapContainer = document.getElementById('map');
  // Reset scale and translation for a fresh map
  mapScale = 1;
  mapTranslateX = 0;
  mapTranslateY = 0;
  // Remove any existing marker overlay but preserve controls inside the map container
  if (markerLayerDiv && markerLayerDiv.parentNode) {
    markerLayerDiv.parentNode.removeChild(markerLayerDiv);
  }
  // Configure the map container to display the world map using the embedded data URI
  mapContainer.style.backgroundImage = `url(${worldMapDataURI})`;
  mapContainer.style.backgroundSize = `${mapOriginalWidth * mapScale}px ${mapOriginalHeight * mapScale}px`;
  mapContainer.style.backgroundPosition = `${mapTranslateX}px ${mapTranslateY}px`;
  mapContainer.style.backgroundRepeat = 'no-repeat';
  mapContainer.style.position = 'relative';
  mapContainer.style.cursor = 'grab';

  // Create the base map image element and append it behind markers
  baseMapImg = document.createElement('img');
  // Use the embedded map data URI as the image source
  baseMapImg.src = worldMapDataURI;
  baseMapImg.style.position = 'absolute';
  baseMapImg.style.top = '0';
  baseMapImg.style.left = '0';
  baseMapImg.style.userSelect = 'none';
  baseMapImg.draggable = false;
  mapContainer.appendChild(baseMapImg);

  // Create an overlay for event markers
  markerLayerDiv = document.createElement('div');
  markerLayerDiv.style.position = 'absolute';
  markerLayerDiv.style.top = '0';
  markerLayerDiv.style.left = '0';
  markerLayerDiv.style.width = '100%';
  markerLayerDiv.style.height = '100%';
  // Do not capture pointer events on the overlay so dragging works properly
  markerLayerDiv.style.pointerEvents = 'none';
  mapContainer.appendChild(markerLayerDiv);

  // Set up zoom button handlers
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  if (zoomInBtn && zoomOutBtn) {
    zoomInBtn.onclick = () => {
      mapScale = Math.min(mapScale * 1.5, 8);
      updateMap();
    };
    zoomOutBtn.onclick = () => {
      mapScale = Math.max(mapScale / 1.5, 0.5);
      updateMap();
    };
  }

  // Setup dragging for panning
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  mapContainer.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    mapContainer.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (dragging) {
      mapTranslateX += e.clientX - lastX;
      mapTranslateY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      updateMap();
    }
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      mapContainer.style.cursor = 'grab';
    }
  });
  // Touch dragging for mobile devices
  mapContainer.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length === 1) {
        dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );
  mapContainer.addEventListener(
    'touchmove',
    e => {
      if (dragging && e.touches.length === 1) {
        const touch = e.touches[0];
        mapTranslateX += touch.clientX - lastX;
        mapTranslateY += touch.clientY - lastY;
        lastX = touch.clientX;
        lastY = touch.clientY;
        updateMap();
      }
    },
    { passive: true }
  );
  mapContainer.addEventListener('touchend', () => {
    dragging = false;
  });

  // Attach the radius filter button to update map, list and calendar
  const radiusBtn = document.getElementById('filterRadiusBtn');
  if (radiusBtn) {
    radiusBtn.onclick = () => {
      const radius = parseFloat(document.getElementById('radiusInput').value) || 100;
      const filtered = events.filter(ev => {
        return (
          haversineDistance(currentLocation.lat, currentLocation.lon, ev.lat, ev.lon) <=
          radius
        );
      });
      updateMap(filtered);
      renderList(filtered);
      updateCalendar(filtered);
    };
  }

  // When the user clicks on the map, update the current location based on the clicked point.
  mapContainer.addEventListener('click', e => {
    // Ignore if the click originated from the zoom buttons (which are inside the map container)
    const targetId = e.target.id;
    if (targetId === 'zoomInBtn' || targetId === 'zoomOutBtn') return;
    const rect = mapContainer.getBoundingClientRect();
    // Compute coordinates relative to the map image, removing translation and scaling
    const xRelative = (e.clientX - rect.left - mapTranslateX) / mapScale;
    const yRelative = (e.clientY - rect.top - mapTranslateY) / mapScale;
    // Convert to latitude and longitude
    const latLon = pixelToLatLon(xRelative, yRelative, mapOriginalWidth, mapOriginalHeight);
    currentLocation = { lat: latLon.lat, lon: latLon.lon };
    // Apply radius filtering and update all views
    const radiusMiles = parseFloat(document.getElementById('radiusInput').value) || 100;
    const filtered = events.filter(ev => {
      return (
        haversineDistance(currentLocation.lat, currentLocation.lon, ev.lat, ev.lon) <=
        radiusMiles
      );
    });
    updateMap(filtered);
    renderList(filtered);
    updateCalendar(filtered);
  });

  // Initial draw of the map and markers
  updateMap();
}

// Place markers on the interactive map based on the provided events
function updateMap(eventList = events) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  // Update base map image dimensions and position according to current scale and translation
  if (baseMapImg) {
    baseMapImg.style.width = `${mapOriginalWidth * mapScale}px`;
    baseMapImg.style.height = `${mapOriginalHeight * mapScale}px`;
    baseMapImg.style.transform = `translate(${mapTranslateX}px, ${mapTranslateY}px)`;
  }
  // Determine which events should be displayed. If eventList is the global events array, apply radius filtering.
  let filtered = eventList;
  if (eventList === events) {
    const radiusMiles = parseFloat(document.getElementById('radiusInput').value) || 100;
    filtered = events.filter(ev => {
      return (
        haversineDistance(currentLocation.lat, currentLocation.lon, ev.lat, ev.lon) <=
        radiusMiles
      );
    });
  }
  // Ensure marker overlay exists
  if (!markerLayerDiv) return;
  // Clear existing markers
  markerLayerDiv.innerHTML = '';
  // Draw marker for current selected location
  const centerX = ((currentLocation.lon + 180) / 360) * mapOriginalWidth * mapScale + mapTranslateX;
  const centerY = ((90 - currentLocation.lat) / 180) * mapOriginalHeight * mapScale + mapTranslateY;
  createCenterMarker(centerX, centerY);
  // Draw markers for each event in the filtered list
  filtered.forEach(ev => {
    const x = ((ev.lon + 180) / 360) * mapOriginalWidth * mapScale + mapTranslateX;
    const y = ((90 - ev.lat) / 180) * mapOriginalHeight * mapScale + mapTranslateY;
    createEventMarker(x, y, ev);
  });
}

// Helper function to create an event marker on the map overlay
function createEventMarker(x, y, ev) {
  const marker = document.createElement('div');
  marker.className = 'map-marker';
  marker.style.position = 'absolute';
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  marker.title = `${ev.title} - ${new Date(ev.date).toLocaleString()}`;
  // Enable pointer events on the marker so clicks register even though the
  // overlay container disables pointer events. Without this, clicks on
  // markers would be ignored.
  marker.style.pointerEvents = 'auto';
  marker.addEventListener('click', e => {
    // Prevent the click from propagating to the map container, which would
    // update the current location.
    e.stopPropagation();
    showEventModal(ev);
  });
  markerLayerDiv.appendChild(marker);
}

// Helper function to create the marker for the current selected location
function createCenterMarker(x, y) {
  const marker = document.createElement('div');
  marker.className = 'center-marker';
  marker.style.position = 'absolute';
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  markerLayerDiv.appendChild(marker);
}

// Initialize the FullCalendar and populate events
function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: events.map(e => ({
      id: String(e.id),
      title: e.title,
      start: e.date,
      extendedProps: { description: e.description, city: e.city }
    })),
    eventClick: info => {
      // On calendar event click, find the full event object by its id and
      // open the event modal with details and reels. Use preventDefault to
      // avoid navigation.
      info.jsEvent.preventDefault();
      const id = parseInt(info.event.id, 10);
      const ev = events.find(e => e.id === id);
      if (ev) {
        showEventModal(ev);
      }
    }
  });
  calendar.render();
}

// Update calendar events without reinitialising the entire calendar
function updateCalendar(eventList = events) {
  if (!calendar) return;
  calendar.removeAllEvents();
  eventList.forEach(e => {
    calendar.addEvent({
      id: String(e.id),
      title: e.title,
      start: e.date,
      extendedProps: { description: e.description, city: e.city }
    });
  });
}

// Render the list view of events
function renderList(eventList = events) {
  const container = document.getElementById('eventList');
  container.innerHTML = '';
  if (eventList.length === 0) {
    container.innerHTML = '<p>No events found in this area.</p>';
    return;
  }
  eventList.forEach(e => {
    const card = document.createElement('div');
    card.className = 'event-card';
    const img = document.createElement('img');
    img.src = e.image || 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800';
    img.alt = e.title;
    card.appendChild(img);
    const content = document.createElement('div');
    content.className = 'card-content';
    const title = document.createElement('h4');
    title.textContent = e.title;
    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = `${new Date(e.date).toLocaleString()} • ${e.city}`;
    const desc = document.createElement('p');
    desc.textContent = e.description;
    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(desc);
    card.appendChild(content);
    container.appendChild(card);
    // Make clicking a card open the event modal with details and reels
    card.addEventListener('click', () => showEventModal(e));
  });
}

// Render the user's profile and reels
function renderProfile() {
  const userEventsContainer = document.getElementById('userEvents');
  userEventsContainer.innerHTML = '';
  const userEvents = events.filter(e => e.creator === 'Jane Doe');
  if (userEvents.length === 0) {
    userEventsContainer.innerHTML = '<p>You haven\'t created any events yet.</p>';
  } else {
    userEvents.forEach(e => {
      const card = document.createElement('div');
      card.className = 'event-card';
      const img = document.createElement('img');
      img.src = e.image;
      img.alt = e.title;
      const content = document.createElement('div');
      content.className = 'card-content';
      const title = document.createElement('h4');
      title.textContent = e.title;
      const meta = document.createElement('div');
      meta.className = 'event-meta';
      meta.textContent = `${new Date(e.date).toLocaleString()} • ${e.city}`;
      content.appendChild(title);
      content.appendChild(meta);
      card.appendChild(img);
      card.appendChild(content);
      userEventsContainer.appendChild(card);
    });
  }
}

// Render reels (simple gallery of random images)
function renderReels() {
  const gallery = document.getElementById('reelsGallery');
  gallery.innerHTML = '';
  // Use a set of placeholder reel images
  const reelImages = [
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/208821/pexels-photo-208821.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3523519/pexels-photo-3523519.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];
  reelImages.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Reel image';
    gallery.appendChild(img);
  });
}

// Display event details and associated reels in a modal overlay. If an event
// does not specify reels, fall back to the defaultEventReels defined at the
// top of this file. The modal contains elements for title, date/location,
// description, and a reels gallery.
function showEventModal(ev) {
  const modal = document.getElementById('eventModal');
  if (!modal) return;
  const titleEl = modal.querySelector('#modalTitle');
  const metaEl = modal.querySelector('#modalMeta');
  const descEl = modal.querySelector('#modalDesc');
  const reelsContainer = modal.querySelector('#modalReels');
  // Populate modal text content
  if (titleEl) titleEl.textContent = ev.title;
  if (metaEl) metaEl.textContent = `${new Date(ev.date).toLocaleString()} • ${ev.city}`;
  if (descEl) descEl.textContent = ev.description;
  // Clear any existing reel images
  if (reelsContainer) reelsContainer.innerHTML = '';
  // Choose reels: use event-specific reels if present, else fallback
  const reels = Array.isArray(ev.reels) && ev.reels.length > 0 ? ev.reels : defaultEventReels;
  reels.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${ev.title} reel`;
    reelsContainer.appendChild(img);
  });
  // Show the modal
  modal.classList.add('active');
}

// Close and hide the event modal
function closeEventModal() {
  const modal = document.getElementById('eventModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Setup navigation to switch between views
function setupNavigation() {
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      switchView(viewId);
    });
  });
}

// Show the selected view and hide others
function switchView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach(v => {
    v.classList.remove('active');
  });
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.add('active');
    // On switching to list view or calendar view, re-render with latest events
    if (viewId === 'listView') {
      renderList();
    } else if (viewId === 'calendarView') {
      updateCalendar();
    } else if (viewId === 'profileView') {
      renderProfile();
      renderReels();
    }
  }

  // Update navigation active state
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Handle add event form submission
function handleAddEvent(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value.trim();
  const description = document
    .getElementById('eventDescription')
    .value.trim();
  const date = document.getElementById('eventDate').value;
  const lat = parseFloat(document.getElementById('eventLatitude').value);
  const lon = parseFloat(document.getElementById('eventLongitude').value);
  const city = document.getElementById('eventCity').value.trim();
  const image = document.getElementById('eventImage').value.trim();
  const privacy = document.getElementById('eventPrivacy').value;
  if (!title || !description || !date || isNaN(lat) || isNaN(lon) || !city) {
    alert('Please fill in all required fields.');
    return;
  }
  const newEvent = {
    id: Date.now(),
    title,
    description,
    date,
    lat,
    lon,
    city,
    image: image || 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    privacy,
    creator: 'Jane Doe'
  };
  events.push(newEvent);
  saveEvents();
  // Update all views
  updateMap();
  updateCalendar();
  renderList();
  renderProfile();
  alert('Event added successfully!');
  // Reset form
  e.target.reset();
  // Redirect to list view to show the new event
  switchView('listView');
}

// Chat functionality (simple local messages)
let messages = [];
function initChat() {
  const chatMessagesEl = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  function renderChat() {
    chatMessagesEl.innerHTML = '';
    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message ' + (msg.sender === 'me' ? 'sent' : 'received');
      msgDiv.textContent = msg.text;
      chatMessagesEl.appendChild(msgDiv);
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }
  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    messages.push({ sender: 'me', text });
    // Simulate a reply from a friend after a short delay
    setTimeout(() => {
      messages.push({ sender: 'friend', text: 'Thanks for your message!' });
      renderChat();
    }, 1000);
    renderChat();
    messageInput.value = '';
  }
  sendMessageBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
  // Add some initial messages
  messages = [
    { sender: 'friend', text: 'Hi there! Welcome to Connected.' },
    { sender: 'me', text: 'Hello! Glad to be here.' }
  ];
  renderChat();
}

// Entry point: load events and initialise everything
document.addEventListener('DOMContentLoaded', () => {
  // Load any stored events or fall back to defaults
  loadEvents();
  // Initialise the interactive map within a try/catch block. If any
  // unexpected error occurs during initialisation, we catch it so that
  // the rest of the application (lists, calendar, profile, etc.)
  // can continue functioning. Our map implementation no longer relies on
  // external libraries like Leaflet, so this is mainly a precaution.
  try {
    // Initialise our static interactive map. We prefer the static map by default
    // because Leaflet may not load in offline or restricted environments. If you
    // wish to use the Leaflet-based map when available, call initMapLeaflet()
    // conditionally (e.g. after checking if window.L exists).
    initMap();
  } catch (err) {
    console.error('Map initialisation failed:', err);
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML =
        '<p style="color: #ccc; padding: 1rem;">Interactive map could not be loaded. Please check your connection.</p>';
    }
  }
  // Initialise the calendar inside a try/catch block. If the FullCalendar
  // library fails to load for any reason, we still want the rest of the
  // application (navigation, list view, map, add events, etc.) to work.
  try {
    initCalendar();
  } catch (err) {
    console.error('Calendar initialisation failed:', err);
  }
  // Render the initial list and profile/reels
  renderList();
  renderProfile();
  renderReels();
  // Set up navigation so that clicking nav links switches views
  setupNavigation();
  // Initialise the chat interface
  initChat();
  // Attach the add event form handler
  document.getElementById('addEventForm').addEventListener('submit', handleAddEvent);
  // Set the default view to the map view and highlight the corresponding nav link
  switchView('mapView');

  // Set up modal close behaviour. Clicking the X button or outside the modal
  // content will close the event modal if it is open.
  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeEventModal);
  }
  const modalEl = document.getElementById('eventModal');
  if (modalEl) {
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) {
        closeEventModal();
      }
    });
  }
});
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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
    creator: 'Jane Doe'
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

// Variables to manage the custom interactive map
// Scale factor for zooming (1 means the map is shown at its original size)
let mapScale = 1;
// Translation offsets for panning (in pixels)
let mapTranslateX = 0;
let mapTranslateY = 0;
// Dimensions of the source world map image. We resize the image to this size in index.html.
// If you change the file used, update these values accordingly.
const mapOriginalWidth = 1024;
const mapOriginalHeight = 682;
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
  // Configure the map container to display the world map image
  mapContainer.style.backgroundImage = "url('world_map_small.png')";
  mapContainer.style.backgroundSize = `${mapOriginalWidth * mapScale}px ${mapOriginalHeight * mapScale}px`;
  mapContainer.style.backgroundPosition = `${mapTranslateX}px ${mapTranslateY}px`;
  mapContainer.style.backgroundRepeat = 'no-repeat';
  mapContainer.style.position = 'relative';
  mapContainer.style.cursor = 'grab';

  // Create the base map image element and append it behind markers
  baseMapImg = document.createElement('img');
  baseMapImg.src = 'world_map_small.png';
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
  marker.addEventListener('click', () => {
    alert(
      `${ev.title}\n\n${ev.description}\nLocation: ${ev.city}\nDate: ${new Date(
        ev.date
      ).toLocaleString()}`
    );
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
      const { title } = info.event;
      const { description, city } = info.event.extendedProps;
      alert(`${title}\n\n${description}\nLocation: ${city}\nDate: ${new Date(
        info.event.start
      ).toLocaleString()}`);
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
});
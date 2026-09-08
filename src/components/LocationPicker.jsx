import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LocationPicker.module.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Recenters the map whenever `center` changes
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

// Handles click-to-place
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const DEFAULT_CENTER = [30.3753, 69.3451]; // Pakistan, roughly centered

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text + ", Pakistan")}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setPosition([lat, lng]);
    setSearchText(place.display_name);
    setSuggestions([]);
    onLocationSelect({ lat, lng });
  };

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    onLocationSelect({ lat: latlng[0], lng: latlng[1] });
  };

  const [gpsStatus, setGpsStatus] = useState("");

const useMyLocation = () => {
  if (!navigator.geolocation) {
    setGpsStatus("❌ Geolocation is not supported by your browser.");
    return;
  }
  setGpsStatus("📡 Getting your location…");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      setPosition(latlng);
      onLocationSelect({ lat: latlng[0], lng: latlng[1] });
      setGpsStatus("✅ Location set!");
    },
    (err) => {
      if (err.code === 1) {
        setGpsStatus("❌ Location access denied. Please allow location in your browser settings, then try again.");
      } else if (err.code === 2) {
        setGpsStatus("❌ Location unavailable. Try searching your address instead.");
      } else {
        setGpsStatus("❌ Could not get location. Try searching instead.");
      }
    },
    { timeout: 10000 }
  );
};

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search your address…"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button type="button" className={styles.gpsBtn} onClick={useMyLocation}>
          📍 Use my location
        </button>
      </div>
      {gpsStatus && <p className={styles.hint}>{gpsStatus}</p>}

      {searching && <p className={styles.hint}>Searching…</p>}

      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((s) => (
            <li key={s.place_id} onClick={() => selectSuggestion(s)}>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.mapWrapper}>
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? 15 : 5}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onPick={handleMapClick} />
          {position && <FlyTo center={position} />}
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <p className={styles.hint}>
        {position
          ? `📍 Location set (${position[0].toFixed(5)}, ${position[1].toFixed(5)}). Click the map to adjust.`
          : "Search above, use your current location, or click on the map to set your location."}
      </p>
    </div>
  );
};

export default LocationPicker;
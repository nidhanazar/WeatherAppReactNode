import React, { useState, useEffect } from "react";
import axios from "axios";
import clearSky from './images/clear-sky.jpg';
import cloudySky from './images/cloudy-sky.jpg';
import rainySky from './images/rainy-sky.jpg';
import snowySky from './images/snowy-sky.jpg';
import thunderstormSky from './images/thunderstorm-sky.jpg';
import defaultSky from './images/default-img.jpg';
import "./css/Dashboard.css";

function Dashboard() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status
  const [backgroundImage, setBackgroundImage] = useState(defaultSky); // Default background image

  // Fetch recent searches from the backend when the component mounts
  useEffect(() => {
  const fetchRecentSearches = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recent-searches");
      setRecentSearches(response.data); // Update the state with the data from the API
    } catch (err) {
      console.error("Failed to fetch recent searches:", err);
    }
  };

  fetchRecentSearches(); // This ensures it fetches data on mount
}, []); 

const handleSearch = async () => {
    if (!city) return alert("Enter a city");
  
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5000/api/weather", { city });
  
      setWeatherData(response.data);
      setCity("");
      setBackgroundImage(getWeatherBackground(response.data.weather[0].main));
  
      // Optionally refresh recent searches
      const recent = await axios.get("http://localhost:5000/api/recent-searches");
      setRecentSearches(recent.data);
  
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert(err.response.data.error);
      } else {
        alert("Failed to fetch weather data.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Function to get the weather background image based on the condition
  const getWeatherBackground = (weather) => {
    weather = weather.toLowerCase();
    switch (weather) {
      case "clear":
        return clearSky;
      case "clouds":
        return cloudySky;
      case "rain":
        return rainySky;
      case "snow":
        return snowySky;
      case "thunderstorm":
        return thunderstormSky;
      default:
        return defaultSky;
    }
  };

  // Function to format the date in MM/DD/YYYY, HH:mm:ss AM/PM format
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="dashboard"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh", // Ensures the background covers the entire screen
      }}
    >
      <h1>Weather</h1>

      <div className="search-bar">
        <input
          type="text"
          id="city"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Side-by-side layout: Weather Card on the left, Recent Searches on the right */}
      <div className="card-container">

        {/* Weather Card (only visible when loading is done and weather data exists) */}
        {!loading && weatherData && (
          <div className="weather-card">
            <div className="weather-card-header">
              <h2>Weather Details</h2>
            </div>

            <div className="weather-header">
              <div>
                <h3>{weatherData.name}</h3>
                <p className="weather-date-time">{new Date().toLocaleString()}</p>
                <p>Weather: {weatherData.weather[0].main}</p>
              </div>
              <div className="weather-stats">
                <p className="temperature">{weatherData.main.temp}°C</p>
                <p className="humidity">
                  Humidity: {weatherData.main.humidity}%
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Recent Searches Card (always visible, even when loading) */}
        <div className="recent-searches-card scrollable">
          <h2>Recent Searches</h2>
          <div className="recent-list">
            {recentSearches.map((item, index) => (
              <div key={index} className="recent-item">
                <strong>{item.city}</strong> — 
                <br />
                <small>{formatTime(item.time)}</small>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default Dashboard;

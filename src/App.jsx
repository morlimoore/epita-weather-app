import React, { useState, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";
import { requestFCMToken } from "./firebase";

const Notifications = ({ onTokenReceived }) => {
  const [notificationStatus, setNotificationStatus] = useState("default");

  useEffect(() => {
    setNotificationStatus(Notification.permission);
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === "granted") {
        const token = await requestFCMToken(); // <-- use the exported function
        onTokenReceived(token);
        console.log("FCM Token:", token);
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotificationStatus("denied");
    }
  };

  return (
    <div className="notifications">
      <h3>Daily Weather Alerts</h3>
      {notificationStatus === "granted" ? (
        <p>Notifications enabled for daily weather updates.</p>
      ) : (
        <>
          <p>Enable notifications to receive daily morning weather alerts.</p>
          <button onClick={requestNotificationPermission} disabled={notificationStatus === "denied"}>
            {notificationStatus === "denied" ? "Notifications Blocked" : "Enable Notifications"}
          </button>
        </>
      )}
    </div>
  );
};

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(savedSearches);

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const query = `${latitude},${longitude}`;
          fetchData(query);
        },
        (geoError) => {
          setLoading(false);
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setError("Location access denied. Please enter a city name.");
          } else {
            setError("Unable to retrieve location. Please enter a city name.");
          }
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    async function subscribe() {
      const token = await requestFCMToken();
      if (token) {
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, location: "Paris" })
        });
      }
    }
    subscribe();
  }, []);

  const fetchData = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(query);
      setWeatherData(data);
      setCityName("");
      if (!query.includes(",")) {
        updateRecentSearches(data.location.name);
      }
    } catch (error) {
      setError("City not found or invalid location. Please try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchData(cityName);
    }
  };

  const updateRecentSearches = (city) => {
    const updatedSearches = [
      city,
      ...recentSearches.filter((c) => c !== city),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleRecentSearch = (city) => {
    setCityName(city);
    fetchData(city);
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const getTemperature = () => {
    if (!weatherData) return "";
    return isCelsius
      ? `${weatherData.current.temp_c} °C`
      : `${weatherData.current.temp_f} °F`;
  };

  const handleTokenReceived = (token) => {
    fetch("YOUR_BACKEND_ENDPOINT/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, location: weatherData?.location?.name || "User Location" })
    }).catch((error) => console.error("Error sending token to backend:", error));
  };

  return (
    <div>
      <div className="app">
        <h1>Weather App</h1>
        <div className="search">
          <input
            type="text"
            placeholder="Enter city name..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="unit-toggle">
          <span>°C</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={!isCelsius}
              onChange={toggleTemperatureUnit}
            />
            <span className="slider round"></span>
          </label>
          <span>°F</span>
        </div>
        <Notifications onTokenReceived={handleTokenReceived} />
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {weatherData && (
          <div className="weather-info">
            <h2>
              {weatherData.location.name}, {weatherData.location.region},{" "}
              {weatherData.location.country}
            </h2>
            <p>Temperature: {getTemperature()}</p>
            <p>Condition: {weatherData.current.condition.text}</p>
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
            />
            <p>Humidity: {weatherData.current.humidity}%</p>
            <p>Pressure: {weatherData.current.pressure_mb} mb</p>
            <p>Visibility: {weatherData.current.vis_km} km</p>
          </div>
        )}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h3>Recent Searches</h3>
            <ul>
              {recentSearches.map((city, index) => (
                <li key={index} onClick={() => handleRecentSearch(city)}>
                  {city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
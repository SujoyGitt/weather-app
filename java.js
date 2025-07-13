let getElement = (elem) => document.querySelector(elem);

// Load saved theme
let userTheme = localStorage.getItem("weather_theme") || "auto";

// Basic UI elements
let weather_search = getElement(".weather_search");
let city_name = getElement(".city_name");
let date = getElement(".date");
let weatherBtn = getElement(".weather_btn");
let weatherIcon = getElement(".weather_icon");
let degree = getElement(".degree span");
let minMax = getElement(".min_max");
let feelsLike = getElement(".feels_like");
let humidity = getElement(".humidity");
let wind = getElement(".wind");
let windDir = getElement(".wind_dir");
let pressure = getElement(".pressure");
let seaLevel = getElement(".sea_level");
let groundLevel = getElement(".ground_level");
let cloudiness = getElement(".cloudiness");
let sunrise = getElement(".sunrise");
let sunset = getElement(".sunset");

const apiKey = "e6e0f31a4a5fa27ddf8ef856d26902f8";
let currentUnit = "metric"; // default is Celsius

const getWeatherData = async (city = "Barddhamān") => {
  const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

  try {
    const res = await fetch(api);
    const data = await res.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    // Destructure needed info including coordinates
    const {
      main,
      name,
      weather,
      wind: windData,
      sys,
      dt,
      clouds,
      coord,
    } = data;

    // Update UI for current weather (your existing code)
    city_name.innerText = `${name}, ${getCountryName(sys.country)}`;
    date.innerText = getDate(dt);
    weatherBtn.innerText = weather[0].main;
    const iconCode = weather[0].icon;
    weatherIcon.innerHTML = `<img class='mx-auto w-20 h-20' src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">`;
    degree.innerText = Math.round(main.temp);
    minMax.innerText = `Min: ${Math.round(main.temp_min)}° / Max: ${Math.round(
      main.temp_max
    )}°`;
    feelsLike.innerText = `${Math.round(main.feels_like)}°`;
    humidity.innerText = `${main.humidity}%`;
    wind.innerText = `${windData.speed} m/s`;
    windDir.innerText = `${windData.deg}°`;
    pressure.innerText = `${main.pressure} hPa`;
    seaLevel.innerText = `${main.sea_level || "—"} hPa`;
    groundLevel.innerText = `${main.grnd_level || "—"} hPa`;
    cloudiness.innerText = `${clouds.all}%`;
    sunrise.innerText = getTime(sys.sunrise);
    sunset.innerText = getTime(sys.sunset);

    // **Call 7-day forecast with new coordinates**
    get7DayForecast(coord.lat, coord.lon);

    // save to search history in localstorage fuction
    updateSearchHistory(name);

  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Reset UI on error (your existing code)
    city_name.innerText = "❌ City is not found";
    date.innerText = "";
    weatherIcon.innerHTML = `<p class="text-red-500 text-sm">Icon is not loaded</p>`;
    weatherBtn.innerText = "--";
    degree.innerText = "-";
    minMax.innerText = "-";
    feelsLike.innerText = "-";
    humidity.innerText = "-";
    wind.innerText = "-";
    windDir.innerText = "-";
    pressure.innerText = "-";
    seaLevel.innerText = "-";
    groundLevel.innerText = "-";
    cloudiness.innerText = "-";
    sunrise.innerText = "-";
    sunset.innerText = "-";

    // Clear weekly forecast on error
    document.getElementById("weeklyForecast").innerHTML = "";
  }
};

function getCountryName(code) {
  const region = new Intl.DisplayNames(["en"], { type: "region" });
  return region.of(code);
}

function getDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function getTime(timestamp) {
  const time = new Date(timestamp * 1000);
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

let debounceTimer;

weather_search.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = e.target.value.trim();
    if (query.length >= 3) {
      getWeatherData(query);
    }
  }, 500);
});

// Run once DOM is fully loaded
window.addEventListener("load", () => {
  getWeatherData("barddhaman");
  renderSearchHistory();
});

// get 7 days forecast
async function get7DayForecast(lat = 23.2324, lon = 87.8615) {
  const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  try {
    const res = await fetch(api);
    const data = await res.json();

    console.log(data);

    const days = data.daily.time;
    const tempsMax = data.daily.temperature_2m_max;
    const tempsMin = data.daily.temperature_2m_min;

    let html = "";

    for (let i = 0; i < days.length; i++) {
      html += `
    <div class="bg-white/10 p-4 rounded-lg flex flex-col justify-between items-center text-center">
      <div>
        <p class="font-semibold">${formatDate(days[i])}</p>
        <p class="text-xs text-gray-300">Min: ${tempsMin[i]}°C / Max: ${
        tempsMax[i]
      }°C</p>
      </div>
      <div class="text-3xl mt-2">☁️</div>
    </div>
  `;
    }

    document.getElementById("weeklyForecast").innerHTML = html;
  } catch (err) {
    console.error("❌ Forecast fetch failed:", err);
  }
}

function formatDate(dateStr) {
  const options = { weekday: "long", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", options);
}

// run after load
get7DayForecast();

// 🎤 Voice Search Setup
const voiceBtn = document.getElementById("voiceSearch");
const listeningMsg = document.getElementById("listeningMsg");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", () => {
    recognition.start();
    voiceBtn.classList.add("listening-glow"); // Glow add
    listeningMsg.classList.remove("hidden"); // Show text
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    weather_search.value = transcript;
    getWeatherData(transcript);

    // Reset UI after done
    voiceBtn.classList.remove("listening-glow");
    listeningMsg.classList.add("hidden");
  };

  recognition.onerror = (event) => {
    alert("❌ Voice search error: " + event.error);
    voiceBtn.classList.remove("listening-glow");
    listeningMsg.classList.add("hidden");
  };

  recognition.onend = () => {
    // Backup: ensure UI resets if stopped manually
    voiceBtn.classList.remove("listening-glow");
    listeningMsg.classList.add("hidden");
  };
}

const unitToggle = document.getElementById("unitToggle");

unitToggle.addEventListener("click", () => {
  // Toggle the unit
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";

  // Update button label
  unitToggle.innerText = currentUnit === "metric" ? "°C" : "°F";
  unitToggle.title = currentUnit === "metric" ? "Switch to °F" : "Switch to °C";

  // Re-fetch with current city and new unit
  getWeatherData("Barddhaman");
});

// recent search functionality start
// LocalStorage key
const SEARCH_HISTORY_KEY = "weather_search_history";

// Load history from storage or start fresh
let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];

// Save and update history
function updateSearchHistory(city) {
  city = city.trim();

  // Don't duplicate
  const index = searchHistory.findIndex(
    (c) => c.toLowerCase() === city.toLowerCase()
  );
  if (index !== -1) {
    searchHistory.splice(index, 1); // remove old occurrence
  }

  searchHistory.unshift(city); // add to beginning
  if (searchHistory.length > 5) searchHistory.pop(); // keep last 5

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Render to UI
function renderSearchHistory() {
  const container = document.getElementById("searchHistory");
  container.innerHTML = "";

  if (searchHistory.length === 0) {
    container.innerHTML = "<li class='text-gray-400'>No recent searches</li>";
    return;
  }

  searchHistory.forEach((city, index) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded";

    // Left side: icon + city name
    const cityBtn = document.createElement("span");
    cityBtn.className =
      "flex items-center gap-2 cursor-pointer hover:underline";
    cityBtn.innerHTML = `🔍 <span>${city}</span>`;
    cityBtn.addEventListener("click", () => {
      weather_search.value = city;
      getWeatherData(city);
    });

    // Right side: remove (❌)
    const removeBtn = document.createElement("button");
    removeBtn.className = "text-red-400 hover:text-red-600 text-sm";
    removeBtn.innerText = "❌";
    removeBtn.title = "Remove from history";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering the city click
      searchHistory.splice(index, 1);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      renderSearchHistory();
    });

    li.appendChild(cityBtn);
    li.appendChild(removeBtn);
    container.appendChild(li);
  });
}

// Theme Toggle & Auto Weather

const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Apply theme on load
applyTheme(userTheme);

// Manual toggle
themeToggle.addEventListener("click", () => {
  if (userTheme === "light") {
    userTheme = "dark";
  } else if (userTheme === "dark") {
    userTheme = "light"; // stop cycling to "auto"
  }

  localStorage.setItem("weather_theme", userTheme);
  applyTheme(userTheme);
});

function applyTheme(mode, weather = null) {
  // Remove all theme color classes only (no layout classes)
  body.classList.remove(
    "from-gray-900", "via-gray-800", "to-black",
    "from-yellow-200", "to-yellow-500",
    "from-gray-500", "to-gray-800",
    "from-blue-800", "to-gray-900",
    "from-blue-100", "to-white",
    "from-purple-800"
  );

  // Add base layout & gradient container classes
  body.classList.add(
    "bg-gradient-to-br",
    "min-h-screen",
    "flex",
    "items-center",
    "justify-center",
    "font-sans",
    "px-4",
    "py-8",
    "lg:py-0"
  );

  // Reset text color
  body.classList.remove("text-black", "text-white");
  body.classList.add(
    mode === "light" || (weather && weather.toLowerCase() === "clear")
      ? "text-black"
      : "text-white"
  );

  if (mode === "light") {
    body.classList.add("from-blue-100", "to-blue-300");
    themeToggle.innerText = "🌞";
  } else if (mode === "dark") {
    body.classList.add("from-gray-900", "via-gray-800", "to-black");
    themeToggle.innerText = "🌙";
  } else if (mode === "auto" && weather) {
    themeToggle.innerText = "🎨";
  }
}


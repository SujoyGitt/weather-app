let getElement = (elem) => document.querySelector(elem);

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

const apiKey = process.env.OPENWEATHER_API_KEY;

const getWeatherData = async (city = "Barddhamān") => {
  const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(api);
    const data = await res.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    // Destructure needed info including coordinates
    const { main, name, weather, wind: windData, sys, dt, clouds, coord } = data;

    // Update UI for current weather (your existing code)
    city_name.innerText = `${name}, ${getCountryName(sys.country)}`;
    date.innerText = getDate(dt);
    weatherBtn.innerText = weather[0].main;
    const iconCode = weather[0].icon;
    weatherIcon.innerHTML = `<img class='mx-auto w-20 h-20' src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">`;
    degree.innerText = Math.round(main.temp);
    minMax.innerText = `Min: ${Math.round(main.temp_min)}° / Max: ${Math.round(main.temp_max)}°`;
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
window.addEventListener("load", getWeatherData("barddhaman"));

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

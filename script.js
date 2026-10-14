
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusText = document.getElementById("status");
const weatherCard = document.getElementById("weatherCard");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const precipitation = document.getElementById("precipitation");
const updatedAt = document.getElementById("updatedAt");

function getWeatherInfo(code, isDay) {
  const conditions = {
    0: ["Clear sky", isDay ? "☀️" : "🌙"],
    1: ["Mainly clear", isDay ? "🌤️" : "🌙"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Moderate drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    56: ["Light freezing drizzle", "🌧️"],
    57: ["Dense freezing drizzle", "🌧️"],
    61: ["Slight rain", "🌧️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    66: ["Light freezing rain", "🌧️"],
    67: ["Heavy freezing rain", "🌧️"],
    71: ["Slight snowfall", "🌨️"],
    73: ["Moderate snowfall", "🌨️"],
    75: ["Heavy snowfall", "❄️"],
    77: ["Snow grains", "❄️"],
    80: ["Slight rain showers", "🌦️"],
    81: ["Moderate rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],
    85: ["Slight snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Thunderstorm with heavy hail", "⛈️"]
  };

  return conditions[code] || ["Unknown conditions", "🌡️"];
}

async function getWeather(city) {
  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";
  statusText.className = "status";
  statusText.textContent = "Fetching weather data...";
  weatherCard.hidden = true;

  try {
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Location service is unavailable. Try again.");
    }

    const geoData = await geoResponse.json();
    const location = geoData.results?.[0];

    if (!location) {
      throw new Error("City nahi mili. Spelling check karke try karo.");
    }

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Weather service error. Please try again.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current || current.temperature_2m == null) {
      throw new Error("Weather data abhi available nahi hai.");
    }

    const [description, icon] = getWeatherInfo(
      current.weather_code,
      current.is_day === 1
    );

    cityName.textContent = [location.name, location.admin1, location.country]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .join(", ");

    weatherDescription.textContent = description;
    weatherIcon.textContent = icon;
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    precipitation.textContent = `${current.precipitation} mm`;

    updatedAt.textContent =
      `Weather time: ${current.time.replace("T", " ")} (${weatherData.timezone})`;

    weatherCard.hidden = false;
    statusText.textContent = "";
  } catch (error) {
    statusText.className = "status error";

    if (error instanceof TypeError) {
      statusText.textContent =
        "Network error. Internet connection check karke dobara try karo.";
    } else {
      statusText.textContent =
        error.message || "Kuch galat ho gaya. Please try again.";
    }
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    statusText.className = "status error";
    statusText.textContent = "Please city ka naam enter karo.";
    weatherCard.hidden = true;
    return;
  }

  getWeather(city);
});

// Default city: Faridabad
getWeather("Faridabad");

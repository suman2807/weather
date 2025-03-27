const apiKey = '271f8498c0a46931bc28cd21a70031dd';
let unit = 'metric'; // Default to Celsius
let currentData = null; // Store current weather data for unit conversion

async function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const loading = document.getElementById('loading');
    const result = document.getElementById('weatherResult');
    const forecastResult = document.getElementById('forecastResult');
    
    loading.style.display = 'flex';
    result.classList.remove('visible');
    forecastResult.classList.remove('visible');

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Weather data not available');
        const data = await response.json();
        
        if (data.cod === 200) {
            currentData = data;
            await Promise.all([
                displayWeather(data),
                getForecast(data.coord.lat, data.coord.lon)
            ]);
        } else {
            loading.style.display = 'none';
            result.innerHTML = `<p class="error">${data.message || 'City not found'}. Try again!</p>`;
            suggestCities(city);
        }
    } catch (error) {
        loading.style.display = 'none';
        result.innerHTML = `<p class="error">Error: ${error.message}. Try again later.</p>`;
    }
}

async function getForecast(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    const forecastResult = document.getElementById('forecastResult');
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Forecast data not available');
        const data = await response.json();
        
        displayForecast(data);
    } catch (error) {
        forecastResult.innerHTML = `<p class="error">Error fetching forecast: ${error.message}</p>`;
    }
}

function displayWeather(data) {
    const weather = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    const timezoneOffset = data.timezone; // Timezone offset in seconds
    const localTime = new Date((new Date().getTime() + timezoneOffset * 1000)).toUTCString().replace('GMT', '');

    const weatherHtml = `
        <div class="weather-header">
            <div class="header-content">
                <h2>${data.name}, ${data.sys.country}</h2>
                <button id="unitToggle" aria-label="Toggle temperature unit">${unit === 'metric' ? '°C' : '°F'}</button>
            </div>
            <p class="local-time">Local Time: ${localTime}</p>
        </div>
        <div class="weather-grid">
            <div class="weather-item">
                <i class="fas fa-cloud-sun"></i>
                <p>${weather.charAt(0).toUpperCase() + weather.slice(1)}</p>
                <p class="value">${temp}${unit === 'metric' ? '°C' : '°F'}</p>
            </div>
            <div class="weather-item">
                <i class="fas fa-tint"></i>
                <p>Humidity</p>
                <p class="value">${humidity}%</p>
            </div>
            <div class="weather-item">
                <i class="fas fa-wind"></i>
                <p>Wind Speed</p>
                <p class="value">${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
            </div>
            <div class="weather-item">
                <i class="fas fa-tachometer-alt"></i>
                <p>Pressure</p>
                <p class="value">${pressure} hPa</p>
            </div>
        </div>
    `;
    const result = document.getElementById('weatherResult');
    result.innerHTML = weatherHtml;
    result.classList.add('visible');
    document.getElementById('loading').style.display = 'none';

    // Re-attach the unit toggle event listener after DOM update
    document.getElementById('unitToggle').addEventListener('click', () => {
        unit = unit === 'metric' ? 'imperial' : 'metric';
        if (currentData) {
            getWeather(currentData.name); // Refresh weather with new unit
        }
    });
}

function displayForecast(data) {
    const forecastResult = document.getElementById('forecastResult');
    const dailyData = data.list.filter(reading => reading.dt_txt.includes("12:00:00")).slice(0, 5); // Get 5 days at noon

    let forecastHtml = '<h3>5-Day Forecast</h3><div class="forecast-grid">';
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const weather = day.weather[0].description;

        forecastHtml += `
            <div class="forecast-item">
                <p class="day">${dayName}</p>
                <i class="fas fa-cloud-sun"></i>
                <p class="temp">${temp}${unit === 'metric' ? '°C' : '°F'}</p>
                <p class="desc">${weather.charAt(0).toUpperCase() + weather.slice(1)}</p>
            </div>
        `;
    });
    forecastHtml += '</div>';
    forecastResult.innerHTML = forecastHtml;
    forecastResult.classList.add('visible');
}

async function getWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    const loading = document.getElementById('loading');
    const result = document.getElementById('weatherResult');
    const forecastResult = document.getElementById('forecastResult');
    
    loading.style.display = 'flex';
    result.classList.remove('visible');
    forecastResult.classList.remove('visible');

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Weather data not available');
        const data = await response.json();
        
        if (data.cod === 200) {
            currentData = data;
            await Promise.all([
                displayWeather(data),
                getForecast(lat, lon)
            ]);
        }
    } catch (error) {
        loading.style.display = 'none';
        result.innerHTML = `<p class="error">Error: ${error.message}. Try again later.</p>`;
    }
}

function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
        error => {
            alert('Unable to access location: ' + error.message);
        }
    );
}

async function suggestCities(query) {
    const suggestions = document.getElementById('citySuggestions');
    suggestions.innerHTML = '';
    
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
        const cities = await response.json();
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = `${city.name}, ${city.country}`;
            suggestions.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) getWeather(city);
    else alert('Please enter a city name.');
});

document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

document.getElementById('cityInput').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) suggestCities(query);
});

document.getElementById('geoBtn').addEventListener('click', getCurrentLocationWeather);

document.getElementById('toggleTheme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('toggleTheme').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.remove('dark-mode');
    document.getElementById('toggleTheme').innerHTML = '<i class="fas fa-moon"></i>';
}
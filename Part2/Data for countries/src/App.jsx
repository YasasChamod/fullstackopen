import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [search, setSearch] = useState('')
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  // Fetch countries based on search
  useEffect(() => {
    if (search.trim() === '') {
      setCountries([])
      setError('')
      return
    }

    setLoading(true)
    setError('')

    fetch(`https://restcountries.com/v3.1/name/${search}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Countries not found')
        }
        return response.json()
      })
      .then(data => {
        setCountries(data)
        setLoading(false)
        // Auto-select if only one country
        if (data.length === 1) {
          setSelectedCountry(data[0])
        } else {
          setSelectedCountry(null)
        }
      })
      .catch(err => {
        setCountries([])
        setError('Countries not found')
        setLoading(false)
        setSelectedCountry(null)
      })
  }, [search])

  // Fetch weather when a country is selected
  useEffect(() => {
    if (!selectedCountry || !selectedCountry.capital) {
      setWeather(null)
      return
    }

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!apiKey) {
      console.warn('OpenWeather API key not set')
      return
    }

    setWeatherLoading(true)
    const capital = selectedCountry.capital[0]

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`
    )
      .then(response => response.json())
      .then(data => {
        setWeather(data)
        setWeatherLoading(false)
      })
      .catch(err => {
        console.error('Weather fetch error:', err)
        setWeather(null)
        setWeatherLoading(false)
      })
  }, [selectedCountry])

  const handleShowCountry = (country) => {
    setSelectedCountry(country)
  }

  const handleBack = () => {
    setSelectedCountry(null)
  }

  return (
    <div className="container">
      <h1>Find countries</h1>

      <div>
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Loading...</div>}

      {selectedCountry && (
        <div className="country-details">
          <button className="back-button" onClick={handleBack}>← Back</button>

          <h2>{selectedCountry.name.common}</h2>

          {selectedCountry.flags && (
            <div className="flag">
              <img src={selectedCountry.flags.svg || selectedCountry.flags.png} alt={selectedCountry.name.common} />
            </div>
          )}

          <div className="info">
            <p><strong>Capital:</strong> {selectedCountry.capital?.join(', ') || 'N/A'}</p>
            <p><strong>Area:</strong> {selectedCountry.area?.toLocaleString() || 'N/A'} km²</p>
          </div>

          <div className="languages">
            <h3>Languages</h3>
            <ul>
              {selectedCountry.languages
                ? Object.values(selectedCountry.languages).map((lang, index) => (
                    <li key={index}>{lang}</li>
                  ))
                : <li>N/A</li>
              }
            </ul>
          </div>

          {weatherLoading && <div className="loading">Loading weather...</div>}

          {weather && weather.main && (
            <div className="weather">
              <h3>Weather in {selectedCountry.capital?.[0]}</h3>
              <div className="weather-content">
                <div className="weather-main">
                  <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
                  <p><strong>Feels like:</strong> {weather.main.feels_like}°C</p>
                  <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                  <p><strong>Condition:</strong> {weather.weather[0].main}</p>
                </div>
                {weather.weather[0].icon && (
                  <div className="weather-icon">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt={weather.weather[0].description}
                    />
                  </div>
                )}
              </div>
              <p className="weather-description">{weather.weather[0].description}</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !selectedCountry && countries.length > 10 && (
        <div className="too-many">
          Too many matches, specify another filter
        </div>
      )}

      {!loading && !error && !selectedCountry && countries.length > 1 && countries.length <= 10 && (
        <ul className="country-list">
          {countries.map((country) => (
            <li key={country.cca3}>
              {country.name.common}
              <button
                className="show-button"
                onClick={() => handleShowCountry(country)}
              >
                Show
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

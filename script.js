const inputElem = document.querySelector(".search_location input");
const searchBtnElem = document.querySelector(".search_location button");
const currentLocationElem = document.querySelector(".current_location");
const fadeContainerElem = document.querySelector(".fade-container");
const locationElem = document.querySelector(".location h2");
const dateElem = document.querySelector(".date");
const temperatureElem = document.querySelector(".temp-img h1");
const iconElem = document.querySelector(".temp-img img");
const flikeElem = document.querySelector(".feels-like");
const descElem = document.querySelector(".description");
const sunriseElem = document.getElementById("sunrise");
const sunsetElem = document.getElementById("sunset");
const humidityElem = document.getElementById("humidity");
const pressureElem = document.getElementById("pressure");
const windElem = document.getElementById("wind");

// Gera o mapa dentro da div com id="mapid"
var mymap = L.map("mapid").setView([0, 0], 15);

var OpenStreetMap_Mapnik = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mymap);

var marker = L.marker([0, 0]).addTo(mymap);

function capitalize(str) {
  var firstLetter = str[0].toUpperCase();
  var remainder = str.slice(1);
  return firstLetter + remainder;
}

function unixTimestampToHour(t) {
  var dt = new Date(t * 1000);
  var hr = "0" + dt.getHours();
  var m = "0" + dt.getMinutes();
  return hr.substr(-2) + ":" + m.substr(-2);
}

// Usando a biblioteca Moment.js pra colocar a data bonita e em pt-br
function getDate() {
  moment.locale();
  dateElem.innerHTML = moment().format("llll");
}

function refreshLocationData(lat, long, city, temp) {
  marker.setLatLng([lat, long]);
  mymap.setView([lat - 1, long]);
  marker.bindPopup(`<b>${city}</b><br><center>${temp}°</center>`).openPopup();
}

function displayValues(data) {
  fadeContainerElem.style.animation = "fade 1s"; // animação de fade sempre que nova cidade é renderizada no app

  let lat = data.coord.lat;
  let long = data.coord.lon;

  let country = data.sys.country;
  let city = data.name;
  locationElem.innerHTML = `${city}, ${country}`;

  let temp = data.main.temp;
  temperatureElem.innerHTML = `${temp}°`;

  let iconCode = data.weather[0].icon;
  iconElem.setAttribute(
    "src",
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  );

  let flike = data.main.feels_like;
  flikeElem.innerHTML = `Sensação térmica de ${flike}°`;

  let desc = data.weather[0].description;
  descElem.innerHTML = capitalize(desc);

  let sunrise = data.sys.sunrise;
  sunriseElem.innerHTML = unixTimestampToHour(sunrise);

  let sunset = data.sys.sunset;
  sunsetElem.innerHTML = unixTimestampToHour(sunset);

  let humidity = data.main.humidity;
  humidityElem.innerHTML = `${humidity}%`;

  let pressure = data.main.pressure;
  pressureElem.innerHTML = `${pressure} hPa`;

  let wind = data.wind.speed;
  windElem.innerHTML = `${wind} m/s`;

  setTimeout(() => {
    fadeContainerElem.style.removeProperty("animation");
  }, 1000);
}

async function fetchLatLong(lat, long) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?APPID=571c0196acd06051ed685dd206d01f9f&lat=${lat}&lon=${long}&units=metric&lang=pt`
  );
  const data = await response.json();

  displayValues(data);

  let city = data.name;
  let temperature = data.main.temp;

  refreshLocationData(lat, long, city, temperature);
}

function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;

      fetchLatLong(lat, long);
    });
  } else {
    alert("API de geolocalização não é suportada pelo seu navegador.");
  }
}

async function fetchCityName() {
  let cityName = inputElem.value;

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=571c0196acd06051ed685dd206d01f9f&units=metric&lang=pt`
  );
  const data = await response.json();

  if (data.cod == "404") {
    alert("Cidade não encontrada");
  } else {
    displayValues(data);

    let lat = data.coord.lat;
    let long = data.coord.lon;
    let city = data.name;
    let temperature = data.main.temp;

    refreshLocationData(lat, long, city, temperature);
  }
}

getDate();
setInterval(getDate, 60000);
fetchLatLong(51.5, -0.09); // valores de latitude e longitude para a cidade de Londres(cidade padrão)
getGeolocation();
currentLocationElem.onclick = () => getGeolocation();

searchBtnElem.onclick = () => {
  if (inputElem.value == "") {
    alert("Cidade não encontrada");
  }

  fetchCityName();
  inputElem.value = "";
};

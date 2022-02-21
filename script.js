class fetchDataApi {
  constructor() {
    this.BASE_API_URL = 'https://www.metaweather.com/api/location/';
    this.SEARCH_API_URL = `${this.BASE_API_URL}search/`;
    this.addCorsHeader();
  }

  addCorsHeader() {
    $.ajaxPrefilter(options => {
      if (options.crossDomain && $.support.cors) {
        options.url = 'https://the-ultimate-api-challenge.herokuapp.com/' + options.url;
      }
    });
  }

  getLocation(query, callback) {
    $.getJSON(this.SEARCH_API_URL, { query: query })
      .done(data => callback(data))
      .fail(() => callback(null));
  }

  getWeatherData(location, callback) {
    $.getJSON(`${this.BASE_API_URL}${location}`)
      .done(data => callback(data))
      .fail(() => callback(null));
  }
}

class domElements {
  constructor() {
    this.searchForm = $('#search-form');
    this.errorBox = $('#error-box');
    this.searchBox = $('#search-box');
    this.loaderBox = $('#loader-box');
    this.forecastBox = $('#forecast-box');
  }

  showForecast() {
    this.hideError();
    this.forecastBox.removeClass('d-none');
    this.forecastBox.addClass('d-flex');
  }

  showLoader() {
    this.loaderBox.removeClass('d-none');
  }

  hideLoader() {
    this.loaderBox.addClass('d-none');
  }

  showSearch() {
    this.searchBox.removeClass('d-none');
    this.searchBox.addClass('d-flex');
  }

  hideSearchBox() {
    this.searchBox.removeClass('d-flex');
    this.searchBox.addClass('d-none');
  }

  showError(message) {
    this.hideLoader();
    this.showSearch();
    this.errorBox.removeClass('d-none');
    this.errorBox.addClass('d-block');
    this.errorBox.html(`<p class="mb-0">${message}</p>`);
  }

  hideError() {
    this.errorBox.addClass('d-none');
  }
}

class dataMiddleware {
  constructor() {
    this.domElements = new domElements();
    this.displayForecast = new displayForecast();
  }

  gatherTodaysForecastDetails(data) {
    return {
      predictability: {
        value: data.predictability,
        unit: '%',
      },
      humidity: {
        value: data.humidity,
        unit: '%',
      },
      wind: {
        value: Math.round(data.wind_speed),
        unit: 'km/h',
      },
      'air pressure': {
        value: data.air_pressure,
        unit: 'mb',
      },
      'max temp': {
        value: Math.round(data.max_temp),
        unit: '°C',
      },
      'min temp': {
        value: Math.round(data.min_temp),
        unit: '°C',
      },
    };
  }

  gatherTodaysForecastGeneral(data) {
    return {
      currentWeekday: moment(data.aplicable_date).format('dddd'),
      todaysFullDate: moment(data.aplicable_date).format('MMMM Do'),
      locationName: data.title,
      todaysImgUrl: data.weather_state_abbr,
      todaysTemp: Math.round(data.the_temp),
      weatherState: data.weather_state_name,
    };
  }

  prepareDataForDom(data) {
    const {
      predictability,
      humidity,
      wind_speed,
      air_pressure,
      max_temp,
      min_temp,
      aplicable_date,
      the_temp,
      weather_state_abbr,
      weather_state_name,
    } = data.consolidated_weather[0];

    const todaysForecastDetails = this.gatherTodaysForecastDetails({
      predictability,
      humidity,
      wind_speed,
      air_pressure,
      max_temp,
      min_temp,
    });

    const todaysForecatGeneral = this.gatherTodaysForecastGeneral({
      aplicable_date,
      the_temp,
      weather_state_abbr,
      weather_state_name,
      title: data.title,
    });

    this.displayForecast.showTodaysForecast(todaysForecatGeneral);
    this.domElements.hideLoader();
    this.domElements.showForecast();
  }

  prepareTodaysForecastDetails(forecast) {
    $.each(forecast, (key, value) => {
      this.displayForecast.showTodaysForecastDetails({
        name: key.toUpperCase(),
        value: value.value,
        unit: value.unit,
      });
    });
  }

  prepareUpcomingDaysForecast(forecast) {
    $.each(forecast, (index, value) => {
      if (index < 1) return;

      const dayImgUrl = value.weather_state_abbr;
      const maxTemp = Math.round(value.max_temp);
      const weekDay = moment(value.applicable_date).format('dddd').substring(0, 3);

      this.displayForecast.showUpcomingDaysForecast({ dayImgUrl, maxTemp, weekDay });
    });
  }
}

class displayForecast {
  constructor() {
    this.imageURL = 'https://www.metaweather.com/static/img/weather';
  }

  showTodaysForecastDetails({ name, value, unit }) {
    $(`#forecast-details`).append(`
    <div class="d-flex justify-content-between">
    <span class="font-weight-bolder">${name}</span>
    <span>${value} ${unit}</span>
    </div>`);
  }

  showUpcomingDaysForecast({ dayImgUrl, weekday, maxTemp }) {
    $(`#forecast-details-week`).append(`

    <li class="forecastBox__week-day d-flex flex-column justify-content-center align-items-center p-2 weather-day">
    <img class"mb-2" width="30" src="${this.imageURL}/${dayImgUrl}.svg" />
    <span class="mb-2">${weekday}</span>
    <span class="font-weight-bold">${maxTemp}&deg</span>
    </li>`);
  }

  showTodaysForecast(forecast) {
    $('#forecast-card-weekday').html(forecast.currentWeekday);
    $('#forecast-card-date').html(forecast.todaysFullDate);
    $('#forecast-card-location').html(forecast.locationName);
    $('#forecast-card-img').attr('src', `${this.imageURL}/${forecast.todaysImgUrl}.svg`);
    $('#forecast-card-temp').html(forecast.todaysTemp);
    $('#forecast-card-description').html(forecast.weatherState);
  }
}

class requestControler {
  constructor() {
    this.fetchDataApi = new fetchDataApi();
    this.domElements = new domElements();
    this.dataMiddleware = new dataMiddleware();
    this.registerEventListener();
  }

  showRequestInProgress() {
    this.domElements.showLoader();
    this.domElements.hideSearchBox();
  }

  getQuery() {
    return $('#search-query').val().trim();
  }

  fetchWeather(query) {
    this.fetchDataApi.getLocation(query, location => {
      if (!location || location.length === 0) {
        this.domElements.showError('Location is not found, try again.');
        return;
      }

      this.fetchDataApi.getWeatherData(location[0].woeid, data => {
        if (!data) {
          this.domElements.showError('Request cannot be executed, please try again.');
          return;
        }

        this.dataMiddleware.prepareDataForDom(data);
      });
    });
  }
  onSubmit() {
    const query = this.getQuery();
    if (!query) return;

    this.showRequestInProgress();
    this.fetchWeather(query);
  }

  registerEventListener() {
    this.domElements.searchForm.on('submit', e => {
      e.preventDefault();
      this.onSubmit();
    });
  }
}

const request = new requestControler();

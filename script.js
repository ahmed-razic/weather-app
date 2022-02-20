/**
 *  STEPS:
 *
 *  1. Declare a class to GET weather data, and GET the woeid, output received data
 *  2. Register an event listener and attach it to the GET requests chain from above, adjust UI loading state
 *  3. Prepare data for the UI in advance and try to use unified structure before outputting to the template
 *  4. Divide classes per function to have a more clean code approach and separation on concerns
 *  5. Add error/loading states and cover edge use cases
 *
 */

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

  getLocation(query) {
    $.getJSON(this.SEARCH_API_URL, { query: query }).done(data => this.getWeatherData(data[0].woeid));
  }

  getWeatherData(location) {
    $.getJSON(`${this.BASE_API_URL}${location}`).done(data => {
      console.log('Data:', data);
    });
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

class requestControler {
  constructor() {
    this.fetchDataApi = new fetchDataApi();
    this.domElements = new domElements();
    this.registerEventListener();
  }

  showRequestInProgress() {
    this.domElements.showLoader();
    this.domElements.hideSearchBox();
  }

  getQuery() {
    return $('#search-query').val().trim();
  }

  onSubmit() {
    const query = this.getQuery();
    if (!query) return;

    this.showRequestInProgress();
    this.fetchDataApi.getLocation(query);
  }

  registerEventListener() {
    this.domElements.searchForm.on('submit', e => {
      e.preventDefault();
      this.onSubmit();
    });
  }
}

const request = new requestControler();

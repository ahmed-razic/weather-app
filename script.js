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

class getWeatherData {
  constructor() {
    const BASE_API_URL = 'https://www.metaweather.com/api/location/';
    const SEARCH_API_URL = `${BASE_API_URL}search/`;
    this.addCorsHeader();
  }

  addCorsHeader() {
    $.ajaxPrefilter(options => {
      if (options.crossDomain && $.support.cors) {
        options.url = 'https://the-ultimate-api-challenge.herokuapp.com/' + options.url;
      }
    });
  }

  getLocation() {
    $.getJSON(SEARCH_API_URL, { query: 'Istanbul' }).done(data => this.getWeatherData(data[0].woeid));
  }

  getWeatherData(location) {
    $.getJSON(`${BASE_API_URL}${location}`).done(data => {
      console.log('Data:', data);
    });
  }
}

class requestControler {
  constructor() {
    this.getWeatherData = new getWeatherData();
    this.init();
  }

  init() {
    this.getWeatherData.getLocation();
  }
}

const request = new requestControler();
request.getLocation();

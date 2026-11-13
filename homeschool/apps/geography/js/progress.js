(function (global) {
  "use strict";

  var KEY = "hs.progress.geography";

  function blank() {
    return {
      stamps: {},
      pins: [],
      done: {},
      stars: 0,
      flights: 0,
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return blank();
      data.stamps = data.stamps || {};
      data.pins = data.pins || [];
      data.done = data.done || {};
      data.stars = data.stars || 0;
      data.flights = data.flights || 0;
      return data;
    } catch (e) {
      return blank();
    }
  }

  function save(data) {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function mark(flightId, activity) {
    var data = load();
    data.done[flightId] = data.done[flightId] || [];
    if (data.done[flightId].indexOf(activity) === -1) {
      data.done[flightId].push(activity);
    }
    save(data);
    return data;
  }

  function addPin(id) {
    var data = load();
    if (data.pins.indexOf(id) === -1) {
      data.pins.push(id);
      data.flights += 1;
      save(data);
      return true;
    }
    return false;
  }

  function addStamp(id) {
    var data = load();
    if (!data.stamps[id]) {
      data.stamps[id] = true;
      data.stars += 1;
      save(data);
      return true;
    }
    return false;
  }

  function addStar() {
    var data = load();
    data.stars += 1;
    save(data);
    return data.stars;
  }

  global.HSProgress = {
    key: KEY,
    load: load,
    save: save,
    mark: mark,
    addPin: addPin,
    addStamp: addStamp,
    addStar: addStar,
  };
})(window);

(function (global) {
  "use strict";

  function progressKey() {
    if (global.HS && typeof global.HS.progressKey === "function") return global.HS.progressKey("history");
    return "hs.progress.standalone.history";
  }

  function blank() {
    return {
      stamps: {},
      tickets: [],
      done: {},
      stars: 0,
      rides: 0,
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(progressKey());
      if (!raw) return blank();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return blank();
      data.stamps = data.stamps || {};
      data.tickets = data.tickets || [];
      data.done = data.done || {};
      data.stars = data.stars || 0;
      data.rides = data.rides || 0;
      data.updatedAt = data.updatedAt || "";
      return data;
    } catch (e) {
      return blank();
    }
  }

  function save(data) {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(progressKey(), JSON.stringify(data));
    } catch (e) {}
  }

  function mark(stationId, activity) {
    var data = load();
    data.done[stationId] = data.done[stationId] || [];
    if (data.done[stationId].indexOf(activity) === -1) {
      data.done[stationId].push(activity);
    }
    save(data);
    return data;
  }

  function addTicket(stationId) {
    var data = load();
    if (data.tickets.indexOf(stationId) === -1) {
      data.tickets.push(stationId);
      data.rides += 1;
      save(data);
      return true;
    }
    return false;
  }

  function addStamp(stationId) {
    var data = load();
    if (!data.stamps[stationId]) {
      data.stamps[stationId] = true;
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

  function stampCount() {
    return Object.keys(load().stamps).length;
  }

  global.HSProgress = {
    get key() { return progressKey(); },
    load: load,
    save: save,
    mark: mark,
    addTicket: addTicket,
    addStamp: addStamp,
    addStar: addStar,
    stampCount: stampCount,
    blank: blank,
  };
})(window);

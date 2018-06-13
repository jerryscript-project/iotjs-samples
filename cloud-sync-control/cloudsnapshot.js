module.exports = {
  humidity: function(id, callback) {
    this.getSnapshots(function(error, result) {
      if (error) {
        log(error); return;
      }
      var data = result.data[0].data;
      callback(error, data['humidity'+id].value);
    });
  },
  airQuality: function(id, callback) {
    this.getSnapshots(function(error, result) {
      if (error) {
        log(error); return;
      }
      var data = result.data[0].data;
      callback(error, data['airQuality'+id].value);
    });
  },
};

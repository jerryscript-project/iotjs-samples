module.exports = {
  humidity: function(id, callback) {
    this.getSnapshots(function(error, result, res) {
      if (error) {
        log(error); return;
      }
      var data = result.data[0].data;
      callback(error, data['humidity'+id].value, res);
    });
  },
  airQuality: function(id, callback) {
    this.getSnapshots(function(error, result, res) {
      if (error) {
        log(error); return;
      }
      var data = result.data[0].data;
      callback(error, data['airQuality'+id].value, res);
    });
  },
};

var _ = require('underscore');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  query.equalTo("objectId", request.params.id);
  query.find({
    success: function(results) {
      response.success(_.VERSION);
    },
    error: function() {
      response.error("cant_find_tournament_data");
    }
  });
});

Parse.Cloud.define("before10TournamentData", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  query.equalTo("objectId", request.params.id);
  query.find({
    success: function(results) {
      var targetDate = results[0].get("tournament_date");
      var createdDate = results[0].get("createdAt");
      var query2 = new Parse.Query("tournament_mst");
      query2.lessThanOrEqualTo("tournament_date", targetDate);
      query2.addAscending("tournament_date,createdAt");
      query2.find({
        success:function(results){

          // 同じ開催日付のデータを考慮
          var before10 = _.filter(results,function(tournament){
            return !(tournament.get("tournament_date") === targetDate && tournament.get("objectId") >= request.params.id);
          }).slice(-10);
          response.success(before10);
        }
      });

    },
    error: function() {
      response.error("cant_find_tournament_data");
    }
  });
});

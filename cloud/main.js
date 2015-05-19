var _ = require('underscore');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  query.equalTo("objectId", request.params.id);
  query.find({
    success: function(results) {
      response.success(new Date());
    },
    error: function() {
      response.error(new Date());
    }
  });
});

Parse.Cloud.define("before10TournamentData", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  query.equalTo("objectId", request.params.id);
  query.find({
    success: function(results) {
      var targetDate = results[0].get("tournament_date");
      var query2 = new Parse.Query("tournament_mst");
      query2.lessThanOrEqualTo("tournament_date", targetDate);
      query2.addAscending("tournament_date,objectId");
      query2.find({
        success:function(results){

          // 同じ開催日付のデータを考慮
          var before10 = _.filter(results,function(tournament){
            return !(tournament.get("tournament_date") == targetDate && tournament.id >= request.params.id);
          }).slice(-10);
          response.success(before10.length);
        }
      });

    },
    error: function() {
      response.error("cant_find_tournament_data");
    }
  });
});

Parse.Cloud.define("searchTournamentData", function(request,response){

  var params = request.params;

  var query = new Parse.Query("tournament_mst");
  if("pref" in params && params.pref.length > 0) query.contains("pref_key",params.pref);
  if("guest_status" in params && params.guest_status.length > 0) query.contains("guest_status_key",params.guest_status);
  if("year_month" in params && params.year_month.length > 0) query.greaterThanOrEqualTo("tournament_date",params.year_month);
  query.addAscending("tournament_date,objectId");
  query.find({
    success: function(results){
      response.success(results.slice(-20));
    },
    error: function(){
      response.error("cant_find_tournament_data");
    }
  });
});

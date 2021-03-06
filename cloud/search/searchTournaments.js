var _ = require('underscore');
Parse.Cloud.define("getBefore20Tournaments", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  var params = request.params;

  if(params.id == null || params.id.length < 1) {
    response.success([]);
    return;
  }

  query.equalTo("objectId", params.id);

  query.find({
    success: function(results) {

      var targetDate = results[0].get("tournament_date_key");

      var prefQuery = new Parse.Query("tournament_mst");
      if("pref" in params && params.pref.length > 0) prefQuery.contains("pref_key",params.pref);
      var allPrefQuery = new Parse.Query("tournament_mst");
      if("pref" in params && params.pref.length > 0) allPrefQuery.contains("pref_key","全国");

      var query2 = Parse.Query.or(prefQuery,allPrefQuery);

      query2.lessThanOrEqualTo("tournament_date_key", targetDate);
      if("pref" in params && params.pref.length > 0) query2.contains("pref_key",params.pref);
      if("guest_status" in params && params.guest_status.length > 0) query2.contains("guest_status_key",params.guest_status);

      query2.addAscending("tournament_date_key,objectId");
      query2.find({
        success:function(results){

          // 同じ開催日付のデータを考慮
          var before20 = _.filter(results,function(tournament){
            return !(tournament.get("tournament_date_key") == targetDate && tournament.id >= request.params.id);
          }).slice(-20);
          response.success(before20);
        }
      });

    },
    error: function() {
      response.error("cant_find_tournament_data");
    }
  });
});

Parse.Cloud.define("getAfter20Tournaments", function(request, response) {
  var query = new Parse.Query("tournament_mst");
  var params = request.params;

  if(params.id == null || params.id.length < 1) {
    response.success([]);
    return;
  }
  query.equalTo("objectId", params.id);

  query.find({
    success: function(results) {

      var targetDate = results[0].get("tournament_date_key");

      var prefQuery = new Parse.Query("tournament_mst");
      if("pref" in params && params.pref.length > 0) prefQuery.contains("pref_key",params.pref);
      var allPrefQuery = new Parse.Query("tournament_mst");
      if("pref" in params && params.pref.length > 0) allPrefQuery.contains("pref_key","全国");

      var query2 = Parse.Query.or(prefQuery,allPrefQuery);

      query2.greaterThanOrEqualTo("tournament_date_key", targetDate);
      if("guest_status" in params && params.guest_status.length > 0) query2.contains("guest_status_key",params.guest_status);

      query2.addAscending("tournament_date_key,objectId");
      query2.find({
        success:function(results){

          // 同じ開催日付のデータを考慮
          var after20 = _.filter(results,function(tournament){
            return !(tournament.get("tournament_date_key") == targetDate && tournament.id <= request.params.id);
          }).slice(0,20);
          response.success(after20);
        }
      });

    },
    error: function() {
      response.error("cant_find_tournament_data");
    }
  });
});

Parse.Cloud.define("searchTournaments", function(request,response){

  var params = request.params;

  var prefQuery = new Parse.Query("tournament_mst");
  if("pref" in params && params.pref.length > 0) prefQuery.contains("pref_key",params.pref);
  var allPrefQuery = new Parse.Query("tournament_mst");
  if("pref" in params && params.pref.length > 0) allPrefQuery.contains("pref_key","全国");

  var query = Parse.Query.or(prefQuery,allPrefQuery);

  if("guest_status" in params && params.guest_status.length > 0) query.contains("guest_status_key",params.guest_status);
  if("year_month" in params && params.year_month.length > 0) query.greaterThanOrEqualTo("tournament_date_key",params.year_month);
  query.addAscending("tournament_date,objectId");
  query.find({
    success: function(results){
      response.success(results.slice(0,20));
    },
    error: function(){
      response.error("cant_find_tournament_data");
    }
  });
});

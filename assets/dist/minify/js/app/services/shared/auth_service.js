/**
 * Created by skyestreamptyltd on 8/16/16.
 */
(function(){
   app.service('authService',['$window',function($window){
      var self=this;
      self.getAccessToken=function(){
          var token = $window.localStorage.getItem('token');
          return token;
      }
   }]);
})();
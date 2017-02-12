(function(){
  app.service('stringService', function(){
    var self  = this;

    self.CLOSE = 'CLOSE';
    self.COPY_LINK = 'COPY LINK';
    self.NO = 'NO';
    self.YES = 'YES';
    self.EMPTY = '';
    self.OK='OK';
    self.CANCEL="CANCEL";
    self.UPGRADE="UPGRADE";

    self.firstLetter = function(str){
      return str.charAt(0).toUpperCase();
    };

    self.capitalizeFirstLetter = function (string) {
      if(string) return string[0].toUpperCase() + string.substr(1);

      return self.EMPTY;
    };

  });
}).call(this);

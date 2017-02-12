(function(){
    app.service('guidGenerator', function(){
        var self  = this;
        self.getId = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(32)
                    .substring(1);
            }
            return s4() + s4()  + s4() + s4()+s4()+ s4() + s4() + s4();
        };
    });
}).call(this);

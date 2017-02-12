/**
 * Created by skyestreamptyltd on 7/5/16.
 */
(function(){
    app.service('userRoleValidator',['$q','userModel','roleValidators','popupService','CONSTANT','$window',function($q,userModel,roleValidators,popupService,CONSTANT,$window){
        var self=this;

        self.checkUserRole=function(user,featureKey,data,showWarning){
            var defer=$q.defer();
            defer.resolve();
            var theUser=null;

            var userFeatures = userModel.getUserFeatures();

            var userFeature=userFeatures[featureKey];
            var allLicenseFeatures = userModel.getAllFeatures();
            if(!userFeature) {

                var licenseFeature = allLicenseFeatures[featureKey];
                defer.reject({result: false, type: 'role', reasons: [{key: 'license', value: {name:licenseFeature.name,message:licenseFeature.message}}]});
            }
            else {
                roleValidators.validate(user,featureKey,userFeature,data,function(err){
                    if(err && err.type && err.type=='validation'){
                        if(showWarning){
                            popupService.roleWarning(null,err)
                                .then(function(){
                                    $window.open(CONSTANT.website,"blank");
                                    console.log('UPGRADE code goes here');

                                },function(){
                                    console.log('UPGRADE CANCEL code goes here')
                                });
                        }

                    }

                    if(err){
                        defer.reject(err);
                    }
                    else{
                        defer.resolve();
                    }

                });

            }



            return defer.promise;
            //cb();
        };

    }]);
})();
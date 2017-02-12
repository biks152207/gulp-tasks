(function(){
    app.service('userModel', function($rootScope, $timeout, $window,dbEnums){
        var self  = this;

        //Settings is using local storage as a DB which is different from other model
        self.addOrUpdate = function(userInfo, cb){
            $window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
            $timeout(function(){
                $rootScope.$emit('userInfo-update', userInfo);
            });
            cb();
        };

        self.clearSession = function(){
            var requestLoginEmail =  self.getRequestLoginEmail();
            var deviceToken=self.getDeviceToken();
            var uId=self.getDeviceUniqueId();

            $window.localStorage.clear();

            self.setDeviceToken(deviceToken);
            self.setDeviceUniqueId(uId);

            if(requestLoginEmail) self.setRequestLoginEmail(requestLoginEmail);

        };

        self.getAvatar = function(){
            return JSON.parse($window.localStorage.getItem('userInfo')).avatar;
        };

        self.getDeviceToken = function(){
            return  JSON.parse($window.localStorage.getItem('device_token'));
        };

        self.getDeviceUniqueId = function(){
            return  JSON.parse($window.localStorage.getItem('uid'));
        };

        self.getLastPullTimestamp = function(){
            var timestamp =  $window.localStorage.getItem('timestamp');

            return timestamp ? new Date(timestamp): timestamp;
        };

        self.getLoggedInName = function(){
            return JSON.parse($window.localStorage.getItem('userInfo')).firstName + ' '+ JSON.parse($window.localStorage.getItem('userInfo')).lastName;
        };

        self.getLoggedInFirstName = function(){
            return JSON.parse($window.localStorage.getItem('userInfo')).firstName;
        };

        self.getLoggedInLastName = function(){
            return JSON.parse($window.localStorage.getItem('userInfo')).lastName;
        };

        self.getLoggedInShortName = function () {

            return  JSON.parse($window.localStorage.getItem('userInfo')).firstName.charAt(0).toUpperCase() + JSON.parse($window.localStorage.getItem('userInfo')).lastName.charAt(0).toUpperCase();

        };

        self.getLoggedInEmail = function(){
            return JSON.parse($window.localStorage.getItem('userInfo')).email;
        };

        self.getLoggedInId = function () {

            var userInfo= JSON.parse($window.localStorage.getItem('userInfo'))||{};
            return userInfo._id;

        };

        self.getLoggedInUser = function(){
            var userInfo = JSON.parse($window.localStorage.getItem('userInfo'));
            return {
                _id: userInfo._id,
                displayName: self.getLoggedInName(),
                displayShortName: self.getLoggedInShortName(),
                email: userInfo.email,
                avatar: userInfo.avatar
            }
        };

        self.getRequestLoginEmail = function(){
            return  $window.localStorage.getItem('request_login_email');
        };

        self.getToken = function(){
            return $window.localStorage.getItem('token');
        };


        self.get= function(cb){
            cb(JSON.parse($window.localStorage.getItem('userInfo')));
        }

        self.getTaskCustomOrders=function() {
            return JSON.parse($window.localStorage.getItem('taskCustomOrders'));
        }

        self.setTaskCustomOrders=function(taskCustomOrders){
            $window.localStorage.setItem('taskCustomOrders',JSON.stringify(taskCustomOrders));
        }

        self.isAuthenticated = function(){
            return  !!$window.localStorage.getItem('token');
        };

        self.meTopOnList = function(users, key) {
            var userId = self.getLoggedInId();
            return topOnList(users,key,userId);
        };

        self.adminTopOnList=function(users){
            var adminUser= _.find(users,function(usr){
               return usr.role==dbEnums.projectUserRole.admin;
            });
            if(adminUser){
                return topOnList(users,null,adminUser._id);
            }
            return [];
        }

        function topOnList(users,key,userId){
            var me ;
            if(key){
                for(var i=0; i<users.length; i++){
                    if(users[i][key]._id == userId){
                        me = users[i];
                        users.splice(i, 1);
                        users.unshift(me);
                        break;
                    }
                }
            }
            else{
                for(var i=0; i<users.length; i++){
                    if(users[i]._id == userId){
                        me = users[i];
                        users.splice(i, 1);
                        users.unshift(me);
                        break;
                    }
                }
            }

            return users;

        }

        self.removeRequestLoginEmail = function(){
            $window.localStorage.removeItem('request_login_email');
        };



        self.setDeviceToken = function(device_token){
            $window.localStorage.setItem('device_token', JSON.stringify(device_token));
        };

        self.setDeviceUniqueId = function(uid){
            $window.localStorage.setItem('uid', JSON.stringify(uid));
        };

        self.setLastPullTimestamp = function(timestamp){
            $window.localStorage.setItem('timestamp', timestamp);
        };

        self.setRequestLoginEmail = function(email){
            $window.localStorage.setItem('request_login_email', email);
        };

        self.setToken = function(token, cb){
            $window.localStorage.setItem('token', token);
            cb();
        };

        self.changeTaskSortOrder=function(newOrders,cb){
            var oldTaskCustomOrders=self.getTaskCustomOrders();
            //self.get(function(user){
                var saneNewOrders= _.map(newOrders||[],function(ord){
                  return {order:ord.order,taskId:ord.taskId};
                });
                var saneUserOrders=_.map(oldTaskCustomOrders||[],function(ord){
                    return {order:ord.order,taskId:ord.taskId};
                });

                var areEqual= _.isEqual(
                    _.sortBy(saneUserOrders || [],'order') ,
                    _.sortBy(saneNewOrders||[],'order'));

                if(areEqual){
                    cb();
                    return;
                }
                //var oldCustomOrders=user.taskCustomOrders;
                ////var oldArr= _.map(_.sortBy(oldCustomOrders||[],'order'),'taskId');
                ////var newArr= _.map(_.sortBy(newOrders||[],'order'),'taskId');
                //
                //user.taskCustomOrders =newOrders;
                self.setTaskCustomOrders(newOrders);
                cb();
                //self.addOrUpdate(user,cb);
                $rootScope.$emit('userInfo-sortOrder');
            //});
        };

        self.saveUserFeatures=function(userFeatures){
            $window.localStorage.setItem("user-features",JSON.stringify(userFeatures||{}));
        };

        self.getUserFeatures=function(){
            var userFeatures=$window.localStorage.getItem('user-features');
            return JSON.parse(userFeatures||"{}");
        };

        self.saveAllFeatures=function(allFeatures){
            $window.localStorage.setItem("all-features",JSON.stringify(allFeatures||{}));
        };

        self.getAllFeatures=function(){
            var allFeatures=$window.localStorage.getItem('all-features');
            return JSON.parse(allFeatures||"{}");
        };

    });
}).call(this);

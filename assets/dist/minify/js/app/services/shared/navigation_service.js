/**
 * Created by skyestreamptyltd on 5/31/16.
 */

(function(){
   app.service('navigationService',['$ionicHistory','$state','sharedData',function($ionicHistory,$state,sharedData){
        var self=this;

       self.isMatchingParams=function(viewParams,params){

           if(!viewParams || !params ){
               return false;
           }
           else if ((_.size(viewParams)==0 && _.size(params)>0 )||(_.size(params)==0 && _.size(viewParams)>0 )){
               return false;
           }

           var matches=true;
           var stateParams=viewParams||{};
           _.each(params,function(k,p){
               if(Array.isArray(params[p])){
                   var arrMatched=false;
                   _.each(params[p],function(av,ak){
                       if(params[p][ak]==stateParams[p]){
                           arrMatched=true;
                           return false;
                       }
                   });


                   matches= arrMatched;
                   return matches;

               }
              else if(params[p]!==stateParams[p]){
                  matches=false;
                  return false;
              }

           });

           return matches;
       }
       function findPreviousState(relativeView){
           //var previousView = $ionicHistory.backView();
           var currentIndex=0;
           var backView
           if(relativeView.backViewId){
               backView=$ionicHistory.getViewById(relativeView.backViewId);
           }
           else{
               return {view:relativeView,count:currentIndex};
           }

           var uiStateRelative=$state.get(relativeView.stateName);
           var uiStateBack=$state.get(backView.stateName);
           if(!uiStateRelative||!uiStateBack){
               return {view:relativeView,count:currentIndex};
           }
           var nextView=relativeView;
           var skipped=true;
           //if((!uiStateRelative.stateGroup ||!uiStateBack.stateGroup)){
               //return {view:backView,count:1};nextView
               if(!uiStateBack.skipNavigation || !self.isMatchingParams(backView.stateParams,uiStateBack.skipParams)){
                   nextView=backView;
                   currentIndex=1;
                   skipped=false;
               }

           //}

           if((uiStateRelative.stateGroup && uiStateBack.stateGroup && uiStateRelative.stateGroup==uiStateBack.stateGroup)
               || skipped){
               var nextViewResult=findPreviousState(backView);
               nextView=nextViewResult.view;
               if(nextViewResult.view!=backView){
                   currentIndex+=nextViewResult.count+(uiStateBack.skipNavigation?1:0);
               }
           }

           return {view:nextView,count:currentIndex};

           //var allHistories=$ionicHistory.viewHistory().views;
           //var previousView;
           //if(relativeView.index>0){
           //    previousView=allHistories
           //}
           //if(previousView){
           //    var previousState=$state.get(previousView.stateName);
           //
           //}
           //else{
           //    return null;
           //}
           ////if(previousView)
       }


       self.goBack=function(newParams){
           var currentView=$ionicHistory.currentView();
           var result = findPreviousState(currentView);
           var previousView=result.view;
           if(currentView!=previousView){
               if(newParams){
                   previousView.stateParams=angular.extend(previousView.stateParams,newParams);
               }
               $ionicHistory.nextViewOptions({disableBack:true});
               $state.go(previousView.stateName,previousView.stateParams);
               //$ionicHistory.goBack(result.count * -1);
           }
           else{
               sharedData.home();
           }
       }

       //self.goBackIfRequired=function(){
       //    var currentView=$ionicHistory.currentView();
       //    var result = findPreviousState(currentView);
       //}

        //if(previousView){
        ////(previousView.stateName=='/task/list/'? $ionicHistory.goBack(step||-2):$state.go(previousView.stateName, previousView.stateParams) )
        //
        //
        //}
        //else{
        //    sharedData.home();
        //}
        //
        //}


   }]) ;
})();

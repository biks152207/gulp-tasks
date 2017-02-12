(function(){
    app.service('taskListView', ["$rootScope", "taskService", "userModel", "platformService", "$state", "$timeout", "$window", "popupService", "$q", "dbEnums", "sync", function($rootScope, taskService, userModel, platformService, $state, $timeout, $window,popupService,$q,dbEnums,sync){

        var self  = this;
        var isFavourite = false;

        function openDefaultView(item, type){
            $timeout(function(){
                if(!platformService.isMobileDevice()){

                    $rootScope.rightDefaultViewVisible = true;
                    $rootScope.default = {
                        edit: true
                    };
                    $state.go('/task/list/',{type: type, id: item.id}, {notify: false});

                }
            });
        }



        self.clearAllSelected = function(){
            self.setSelected();
            $rootScope.rightDefaultViewVisible = false;
            $rootScope.default = {
                edit: false
            };
            $rootScope.selectedItems = {};
            isFavourite = false;
            $rootScope.multipleSelect =    $rootScope.singleSelect =   false;
            $rootScope.$emit('task-footer-toggle');
        };

        self.clicked = function (item, type, multiSelectEnable) {
            var deff=$q.defer();

            function f(item, type, multiSelectEnable){
                var selected = self.getSelected();
                $rootScope.rightDefaultViewVisible = false;
                $rootScope.default = {
                    edit: false
                };
                var newType=type;
                if(!$rootScope.selectedItems) $rootScope.selectedItems = {};
                if(item.status==dbEnums.status.complete){
                    $rootScope.closedTask=item;
                    //newType=sharedData.STATE.CLOSED;
                }
                else{
                    delete $rootScope.closedTask;
                }
                if(multiSelectEnable){
                    var index = self.findIndex(selected, item);
                    if (index > -1) {
                        selected.splice(index, 1);
                        delete $rootScope.selectedItems[item.id];

                    }
                    else {

                        selected.push(item);
                        $rootScope.selectedItems[item.id] = true;
                    }
                    self.setSelected(selected);
                    if(self.singleSelect()){
                        openDefaultView(selected[0], newType);
                    }
                }
                else{
                    var unSelect = self.singleSelect() && selected[0].id == item.id;
                    selected.forEach(function(tItem){
                        delete $rootScope.selectedItems[tItem.id];
                    });
                    selected = [];
                    if(!unSelect){
                        selected.push(item);
                        $rootScope.selectedItems[item.id] = true;
                        openDefaultView(item, newType);
                    }
                    self.setSelected(selected);
                }

                $rootScope.multipleSelect =   selected.length > 1;
                $rootScope.singleSelect =   selected.length == 1;
                //if(platformService.isMobileDevice() || item.status!=dbEnums.status.complete)
                    $rootScope.$emit('task-footer-toggle');

                deff.resolve(true);
            };


            var taskSelectionChangeEvent=$rootScope.$broadcast('beforeTaskListSelectionChange',item,type,multiSelectEnable);

            if(taskSelectionChangeEvent.defaultPrevented){
                popupService.discard($rootScope)
                    .then(function(v){
                        if(v){
                            f(item, type, multiSelectEnable);
                        }
                        else{
                            deff.resolve(false);
                        }
                    });
                return;
            }
            else{
                f(item, type, multiSelectEnable);
            }

            return deff.promise;
            //return !selected.length;
        };


        self.findIndex = function(list, item){

            for(var i = 0;i< list.length; i++) {
                if(list[i].id == item.id){
                    return i;
                }
            }
            return  -1;
        };

        self.getSingleSelected = function(){
            var selected = self.getSelected();
            if(self.singleSelect()){
                return selected[0];
            }
            return {};
        };

        self.getTaskIds = function(){

            var selected = self.getSelected();
            var taskIds = [];
            selected.forEach(function(item){
                taskIds.push(item.id);
            });

            return taskIds;

        };

        self.isAllFavourite = function() {
            var selected = self.getSelected();
            var isFavourite = true;
            selected.forEach(function (item) {
                isFavourite = isFavourite && taskService.isFavourite(item, userModel.getLoggedInId());
            });
            return isFavourite;
        };

        self.isSelected = function(){
            var selected = self.getSelected();
            return selected.length;
        };

        self.multipleSelect = function(){
            var selected = self.getSelected();
            return selected.length > 1;
        };

        self.singleSelect = function(){
            var selected = self.getSelected();
            return selected.length == 1;
        };

        self.setDefaultView = function(){

            $rootScope.rightDefaultViewVisible = false;
            $rootScope.default = {
                edit: true
            };
        };

        self.setSelected = function(selected){
            var list = selected || [];
            $window.localStorage.setItem('selected', JSON.stringify(list));
        };

        self.getSelected = function(){

            return JSON.parse($window.localStorage.getItem('selected'));

        };

        self.setAllFilterViews=function(filterViews){

            $window.localStorage.setItem('filterViews',JSON.stringify(filterViews));


        }

        self.setFilterView=function(filterKey,view){
            var existingSelectedView=JSON.parse($window.localStorage.getItem('filterViews')||'{}');
            //var filterView=existingSelectedView[filterKey];
            existingSelectedView[filterKey]= view;
            $window.localStorage.setItem('filterViews',JSON.stringify(existingSelectedView));
            saveFilterView(filterKey,view);
        };

        self.getFilterView=function(filterKey){
            var existingSelectedView=JSON.parse($window.localStorage.getItem('filterViews')||'{}');
            var filterView=existingSelectedView[filterKey];
            if(!filterView){
                filterView=existingSelectedView[filterKey]='default';

                $window.localStorage.setItem('filterViews',JSON.stringify(existingSelectedView));
                saveFilterView(filterKey,filterView);
            }

            filterView= _.find(self.viewTypes,function(val,key){
                return val.value==filterView;
            });


            return filterView;

        };

        self.setSelectedFilterView=function(filterViewKey){
            var selectedFilterView=self.getFilterView(filterViewKey);
            $rootScope.filterView={};
            $rootScope.filterView.select=selectedFilterView;
            $rootScope.filterView.list=self.filterViewTypes[filterViewKey];
            $rootScope.filterView.key=filterViewKey;
        }

        function saveFilterView(filterKey,filterView){
            sync.add(dbEnums.collections.Settings,
                {
                    filterView: filterView,
                    filterKey:filterKey,
                    userId: userModel.getLoggedInId()
                }, dbEnums.events.Settings.filterViewUpdate);
        }

        self.clearFilterView=function(){
            $rootScope.filterView={};
        }

        self.viewTypes=[
            {
                name:'Default',
                value:'default',
                isDateView:false
            },
            {
                name:'Narrow',
                value:'narrow',
                isDateView:false
            },
            {
                name:'Wide',
                value:'wide',
                isDateView:false
            }
        ];
        self.filterViewTypes={
            'inbox':self.viewTypes,
            'project':self.viewTypes,
            'assignee':self.viewTypes,
            'filter':self.viewTypes,
            'label':self.viewTypes,
            'today':_.filter(self.viewTypes,{isDateView:false}),
            'next7days':_.filter(self.viewTypes,{isDateView:false}),
            'overdue':_.filter(self.viewTypes,{isDateView:false}),
            'watching':_.filter(self.viewTypes,{isDateView:false}),
            'favourites':_.filter(self.viewTypes,{isDateView:false})
        };

        self.defaultViewType= _.find(self.viewTypes,{'value':'default'});

        $rootScope.$on('$stateChangeSuccess',function(event,toState,toParams,fromState,fromParams){
            if (!userModel.isAuthenticated()) {
                return;
            }

            var sortKey='project';

            self.setSelectedFilterView(sortKey);


        });

    }]);
}).call(this);

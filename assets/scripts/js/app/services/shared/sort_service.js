(function(){
    app.service('sortService', function($window, stringService, filterService, $rootScope, $q, $state,settingsService,sync,dbEnums,userModel){
        var self = this;

        self.DEFAULT_ORDER = {
                name: 'DESC',
                value: 'desc'
        };

        self.DEFAULT_SORT = {
                name: 'Due date',
                value: 'due',
                showDateBar: true
        };

        self.FILTER_TYPE = {
            DEFAULT: 'Filter',
            CUSTOM: 'My Filters'
        };

        self.FILTERS = [
            {
                name: 'Inbox',
                value: 'inbox',
                type: self.FILTER_TYPE.DEFAULT
            },
            {
                name: 'Today',
                value: 'today',
                type: self.FILTER_TYPE.DEFAULT
            },
            {
                name: 'Next 7 days',
                value: 'next7days',
                type: self.FILTER_TYPE.DEFAULT
            },
            {
                name: 'Overdue',
                value: 'overdue',
                type:self.FILTER_TYPE.DEFAULT
            },
            {
                name: 'Favourites',
                value: 'favourites',
                type: self.FILTER_TYPE.DEFAULT
            },
            {
                name: 'Watching',
                value: 'watching',
                type: self.FILTER_TYPE.DEFAULT
            }];

        self.SORTS = [
            {
                name: 'Due date',
                value: 'due',
                showDateBar: true
            }
            ,
            {
                name: 'Priority',
                value: 'priority',
                showDateBar: false
            },

            //{
            //    name: 'Project name',
            //    value: 'project.name',
            //    showDateBar: false
            //},
            //
            //{
            //    name: 'Task title',
            //    value: 'name',
            //    showDateBar: false
            //},

            {
                name: 'My order',
                value: 'custom',
                showDateBar: true
            }
            ,

            {
                name: 'Plan view',
                value: 'plan',
                showDateBar: false
            }
        ];

        self.ORDERS = [
            {
                name: 'Ascending',
                value: 'asc'
            },
            {
                name: 'Descending',
                value: 'desc'
            }];


        self.getFilterByValue = function(value){

            for(var i = 0; i< self.FILTERS.length; i++ ){
                if(self.FILTERS[i].value == value){
                    return self.FILTERS[i];
                }
            }
            return null;
        };

        self.getFilterType = function(){
            return JSON.parse($window.localStorage.getItem('filterType')) ;
        };

        self.getOrder = function(){
            var existingSortOption=self.getSortOptionByKey(($rootScope.sorts||{}).key||'project');
            var selectedSortOrder=parseSortOrder(existingSortOption.order);
            return selectedSortOrder;

            //var setting=settingsService.getSettings();
            //setting.sort=setting.sort||{};
            //var order=_.find(self.ORDERS,{'value':setting.sort.order});
            //return order
            //    || JSON.parse($window.localStorage.getItem('order')); //TODO: remove this. setting.sort.order can handle it properly.
            //return JSON.parse($window.localStorage.getItem('order'));
        };

        self.getSortType = function(){
            var existingSortOption=self.getSortOptionByKey(($rootScope.sorts||{}).key||'project');
            var selectedSort=parseSortValue(existingSortOption.sort);
            return selectedSort;

            //var setting=settingsService.getSettings();
            //setting.sort=setting.sort||{};
            //var sortType=_.find(self.SORTS,{'value':setting.sort.sortType});
            //return sortType
            //    || JSON.parse($window.localStorage.getItem('sortType')); //TODO: remove this. setting.sort.sortType can handle it properly.

            //return JSON.parse($window.localStorage.getItem('sortType'));
        };

        self.setAll = function(id, noFilter,key){
            var defer = $q.defer();

            self.setAllFilters(id, noFilter).then(function(){
                //self.setAllSorts(key);
                //self.setAllOrders();
                defer.resolve();
            });
            return defer.promise;
        };

        self.setAllFilters = function(id, noFilter){
            var defer = $q.defer();
            var filters = [];
            filterService.getAll().then(function(list){
                filters ={
                    list: angular.copy(self.FILTERS)
                };
                list.forEach(function(cFilter){
                    var customFilter = {
                        name: cFilter.name,
                        value: cFilter.id,
                        type: self.FILTER_TYPE.CUSTOM
                    };
                    if( filters.list.indexOf(customFilter)<=-1) {
                        filters.list.push(customFilter);

                        if(id == customFilter.value && !noFilter){
                            filters.select = customFilter;
                        }
                    }

                });
                if(!filters.select && !noFilter){
                    filters.select =  self.getFilterType();
                }

                $rootScope.filters = filters;
                defer.resolve();
            });
            return defer.promise;
        };

        self.setAllSorts = function(sortKey){

            var existingSortOption=self.getSortOptionByKey(sortKey);
            var sortList=self.getSortOrdersByKey(sortKey);
            var selectedSort= parseSortValue(existingSortOption.sort);

            $rootScope.sorts={
                list:sortList,
                select:selectedSort,
                key:sortKey
            };

        };

        self.setAllOrders = function(key){
            var existingSortOption=self.getSortOptionByKey(key);
            var selectedOrder= parseSortOrder(existingSortOption.order);

            $rootScope.orders={
                list:self.ORDERS,
                select:selectedOrder,
                key:key
            };
            //$rootScope.orders =    {
            //    select: self.getOrder(),
            //    list: self.ORDERS
            //};
        };

        self.setDefault = function(filterTypeValue,sort){
            self.setFilterTypeByValue(filterTypeValue);
            if(!sort){
                self.setOrder(self.DEFAULT_ORDER);
                self.setSortType(self.DEFAULT_SORT);
            }

        };

        self.setFilterTypeByValue = function(filterType){
            self.setFilterType(self.getFilterByValue(filterType));
        };

        self.setFilterType = function(filterType){
            filterType = filterType || stringService.EMPTY;
            $window.localStorage.setItem('filterType', JSON.stringify(filterType)) ;
        };

        self.setOrder = function(order){
            var setting=settingsService.getSettings();
            setting.sort=setting.sort||{};
            setting.sort.order=order.value;
            settingsService.updateSort(setting);
            //$window.localStorage.setItem('order', JSON.stringify(order));

        };

        self.setSortType = function(sortType){
            var setting=settingsService.getSettings();
            setting.sort=setting.sort||{};
            setting.sort.sortType=sortType.value;
            settingsService.updateSort(setting);

            //$window.localStorage.setItem('sortType', JSON.stringify(sortType));
        };


        $rootScope.changeFilter = function(selected){
            self.setFilterType(selected);
            switch(selected.type){
                case self.FILTER_TYPE.DEFAULT:
                    $state.go('/task/list/', {'type':selected.value});
                    break;
                case self.FILTER_TYPE.CUSTOM:
                    $state.go('/filter/details',{id: selected.value});
                    break;

            }
        };

        $rootScope.changeOrder = function(selected){
            self.setOrder(selected);
            $rootScope.$emit('task:list-sorted');
        };

        $rootScope.changeSort = function(selected){
            self.setSortType(selected);
            $rootScope.$emit('task:list-sorted');
        };


        $rootScope.$on('$stateChangeSuccess',function(event,toState,toParams,fromState,fromParams){
            if (!userModel.isAuthenticated()) {
                return;
            }

            var sortKey=toState.sortKey;
            if(sortKey=='list'){
                sortKey=toParams.type;
            }

            if(!sortKey){
                return;
            }

            self.setAllSorts(sortKey);
            self.setAllOrders(sortKey);


        });

        self.getSortOptionByKey=function(sortKey){
            var existingSortOptionsStr=$window.localStorage.getItem('sortOptions')||'{}';
            var existingSortOptions=JSON.parse(existingSortOptionsStr);
            var existingOpt=existingSortOptions[sortKey];
            if(!existingOpt){
                existingOpt={
                    sort:self.DEFAULT_SORT_TYPES[sortKey],
                    order:'asc'
                };
                existingSortOptions[sortKey]=existingOpt;
                $window.localStorage.setItem('sortOptions',JSON.stringify(existingSortOptions));
                saveSortOptions(sortKey,existingOpt);

            }

            //var sortToReturn= _.find(self.SORTS,function(val,ky){
            //    return val.value==existingOpt.sort;
            //});


            return existingOpt;
        };


        self.setSortOptionByKey=function(sortKey,sortOption){
            var existingSelectedOption=JSON.parse($window.localStorage.getItem('sortOptions')||'{}');
            //var filterView=existingSelectedView[filterKey];
            existingSelectedOption[sortKey]= sortOption;
            $window.localStorage.setItem('sortOptions',JSON.stringify(existingSelectedOption));
            saveSortOptions(sortKey,sortOption);
        };

        $rootScope.changeSortValue=function(sortKey,sortValue){
            var existingOption=self.getSortOptionByKey(sortKey);
            existingOption['sort']=sortValue;
            self.setSortOptionByKey(sortKey,existingOption);
            $rootScope.$emit('task:list-sorted');
            //$rootScope.sorts=$rootScope.sorts||{list:self.SORT_ORDERS_LIST[sortKey]};
            //$rootScope.sorts.list=self.SORT_ORDERS_LIST[sortKey];
            //var selectedSort= _.find($rootScope.sorts.list,{'value':sortValue});
            //$rootScope.sorts.select=selectedSort;

        };

        $rootScope.changeSortOrder=function(sortKey,sortOrder){
            var existingOption=self.getSortOptionByKey(sortKey);
            existingOption['order']=sortOrder;
            self.setSortOptionByKey(sortKey,existingOption);
            $rootScope.$emit('task:list-sorted');
        };


        function saveSortOptions(sortKey,sortOption){
            sync.add(dbEnums.collections.Settings,
                {
                    sortOption: sortOption,
                    sortKey:sortKey,
                    userId: userModel.getLoggedInId()
                }, dbEnums.events.Settings.sortUpdate);
        };

        self.getSortOrdersByKey=function(key){
            var allSorts=self.SORT_ORDERS_LIST[key];
            if(!allSorts){
                allSorts=self.SORT_ORDERS_LIST['default'];
            }

            return allSorts;
        }


        function parseSortValue(sortValue){
            var sortList=self.SORTS;
            var selectedSort= _.find(sortList,function(sort,ky){
                return sort.value==sortValue;
            });
            return selectedSort;
        }

        function parseSortOrder(sortOrder){
            var selectedOrder= _.find(self.ORDERS,function(ord,ky){
               return ord.value==sortOrder;
            });
            return selectedOrder;
        }

        self.DEFAULT_SORT_TYPES = {
            'inbox': 'due',
            'today': 'due',
            'next7days': 'due',
            'overdue': 'due',
            'watching': 'due',
            'favourites': 'due',
            'closed':'due',
            'project':'plan',
            'assignee':'due',
            'label':'due',
            'filter':'due'

        };


        self.SORT_ORDERS_LIST={
            'inbox': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'today': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'next7days': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'overdue': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'watching': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'favourites': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'closed': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'project': self.SORTS,
            'assignee': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'label': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'filter': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'}),
            'filter': _.filter(self.SORTS,function(sort,ky){return sort.value!='plan'})

        };

        //self.sortKeys={
        //    'inbox':'inbox',
        //    'today':'today',
        //    'next7days':'next7days',
        //    'overdue':'overdue',
        //    'watching':'watching',
        //    'favourites':'favourites',
        //    'closed':'closed',
        //    'project':'project'
        //
        //}
        //
    });
}).call(this);
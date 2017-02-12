(function(){
    app.service('headerService', function(){
        var self  = this;
        self.activeScope = null;

        self.taskHeader = {};

        self.setAddTaskHeader = function(scope){
            self.activeScope = scope;

            self.taskHeader = {
                title: 'Add Task',
                taskObject:scope.taskObject,
                taskId:null,
                createType:'add',
                createButtonName :'Add Task',
                createButtonLink : '#/task/add',
                noteButtonLink : '#/task/note/',
                addTab : true,
                isSaved : true
            }
        };

        self.setEditTaskHeader = function (scope, id){
            self.activeScope = scope;

            self.taskHeader = {
                title: 'Edit Task',
                taskObject:scope.taskObject,
                taskId:id,
                createType:'edit',
                createButtonName :'Edit Task',
                createButtonLink : '#/task/edit/'+id,
                noteButtonLink : '#/task/note/'+id,
                addTab : true,
                isSaved : true
            }
        };

        self.setTaskNoteHeader = function(scope, id){

            self.activeScope = scope;
            self.taskHeader = {
                title: 'Add Note',
                taskObject:scope.taskObject,
                taskId:id,
                createType:id ?'edit' : 'add',
                createButtonName : id ?'Edit Task' : 'Add Task',
                createButtonLink : id ?'#/task/edit/'+id :'#/task/add',
                noteButtonLink : id ?'#/task/note/'+id : '#/task/note/',
                noteTab : true,
                isSaved : !id
            }


        };

    });
}).call(this);

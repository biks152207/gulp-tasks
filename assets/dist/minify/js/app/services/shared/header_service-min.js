(function(){app.service("headerService",function(){var t=this;t.activeScope=null,t.taskHeader={},t.setAddTaskHeader=function(e){t.activeScope=e,t.taskHeader={title:"Add Task",taskObject:e.taskObject,taskId:null,createType:"add",createButtonName:"Add Task",createButtonLink:"#/task/add",noteButtonLink:"#/task/note/",addTab:!0,isSaved:!0}},t.setEditTaskHeader=function(e,a){t.activeScope=e,t.taskHeader={title:"Edit Task",taskObject:e.taskObject,taskId:a,createType:"edit",createButtonName:"Edit Task",createButtonLink:"#/task/edit/"+a,noteButtonLink:"#/task/note/"+a,addTab:!0,isSaved:!0}},t.setTaskNoteHeader=function(e,a){t.activeScope=e,t.taskHeader={title:"Add Note",taskObject:e.taskObject,taskId:a,createType:a?"edit":"add",createButtonName:a?"Edit Task":"Add Task",createButtonLink:a?"#/task/edit/"+a:"#/task/add",noteButtonLink:a?"#/task/note/"+a:"#/task/note/",noteTab:!0,isSaved:!a}}})}).call(this);
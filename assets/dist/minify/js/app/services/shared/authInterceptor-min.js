app.service("authInterceptor",["$window","$window","$q","TodoZuDB",function(e,e,t,o){this.request=function(t){var o=e.localStorage.getItem("token");o&&(t.headers=t.headers||{},t.headers["x-access-token"]=o);var r=JSON.parse(e.localStorage.getItem("socketInfo")||"{}");return r.id&&(t.headers["x-socket-id"]=r.id),t}}]);
(function(){app.service("guidGenerator",function(){var t=this;t.getId=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(32).substring(1)}return t()+t()+t()+t()+t()+t()+t()+t()}})}).call(this);
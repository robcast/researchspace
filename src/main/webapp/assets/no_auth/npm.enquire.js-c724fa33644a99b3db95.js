(window.webpackJsonp=window.webpackJsonp||[]).push([[407],{2060:function(t,i){t.exports={isFunction:function isFunction(t){return"function"==typeof t},isArray:function isArray(t){return"[object Array]"===Object.prototype.toString.apply(t)},each:function each(t,i){for(var e=0,n=t.length;e<n&&!1!==i(t[e],e);e++);}}},2557:function(t,i,e){var n=e(2558);t.exports=new n},2558:function(t,i,e){var n=e(2559),s=e(2060),r=s.each,o=s.isFunction,a=s.isArray;function MediaQueryDispatch(){if(!window.matchMedia)throw new Error("matchMedia not present, legacy browsers require a polyfill");this.queries={},this.browserIsIncapable=!window.matchMedia("only all").matches}MediaQueryDispatch.prototype={constructor:MediaQueryDispatch,register:function(t,i,e){var s=this.queries,h=e&&this.browserIsIncapable;return s[t]||(s[t]=new n(t,h)),o(i)&&(i={match:i}),a(i)||(i=[i]),r(i,(function(i){o(i)&&(i={match:i}),s[t].addHandler(i)})),this},unregister:function(t,i){var e=this.queries[t];return e&&(i?e.removeHandler(i):(e.clear(),delete this.queries[t])),this}},t.exports=MediaQueryDispatch},2559:function(t,i,e){var n=e(2560),s=e(2060).each;function MediaQuery(t,i){this.query=t,this.isUnconditional=i,this.handlers=[],this.mql=window.matchMedia(t);var e=this;this.listener=function(t){e.mql=t.currentTarget||t,e.assess()},this.mql.addListener(this.listener)}MediaQuery.prototype={constuctor:MediaQuery,addHandler:function(t){var i=new n(t);this.handlers.push(i),this.matches()&&i.on()},removeHandler:function(t){var i=this.handlers;s(i,(function(e,n){if(e.equals(t))return e.destroy(),!i.splice(n,1)}))},matches:function(){return this.mql.matches||this.isUnconditional},clear:function(){s(this.handlers,(function(t){t.destroy()})),this.mql.removeListener(this.listener),this.handlers.length=0},assess:function(){var t=this.matches()?"on":"off";s(this.handlers,(function(i){i[t]()}))}},t.exports=MediaQuery},2560:function(t,i){function QueryHandler(t){this.options=t,!t.deferSetup&&this.setup()}QueryHandler.prototype={constructor:QueryHandler,setup:function(){this.options.setup&&this.options.setup(),this.initialised=!0},on:function(){!this.initialised&&this.setup(),this.options.match&&this.options.match()},off:function(){this.options.unmatch&&this.options.unmatch()},destroy:function(){this.options.destroy?this.options.destroy():this.off()},equals:function(t){return this.options===t||this.options.match===t}},t.exports=QueryHandler}}]);
//# sourceMappingURL=npm.enquire.js-c724fa33644a99b3db95.js.map
(window.webpackJsonp=window.webpackJsonp||[]).push([[423],{2813:function(e,t,n){e.exports=function(e){"use strict";e="default"in e?e.default:e;var t=function(){function defineProperties(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(e,t,n){return t&&defineProperties(e.prototype,t),n&&defineProperties(e,n),e}}(),n=function(e){function Popup(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,Popup);var t=e||{};void 0===t.autoPan&&(t.autoPan=!0),void 0===t.autoPanAnimation&&(t.autoPanAnimation={duration:250});var n=document.createElement("div");t.element=n;var o=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(Popup.__proto__||Object.getPrototypeOf(Popup)).call(this,t));o.container=n,o.container.className="ol-popup",o.closer=document.createElement("a"),o.closer.className="ol-popup-closer",o.closer.href="#",o.container.appendChild(o.closer);var r=o;return o.closer.addEventListener("click",(function(e){r.container.style.display="none",r.closer.blur(),e.preventDefault()}),!1),o.content=document.createElement("div"),o.content.className="ol-popup-content",o.container.appendChild(o.content),Popup.enableTouchScroll_(o.content),o}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(Popup,e),t(Popup,[{key:"show",value:function show(e,t){return t instanceof HTMLElement?(this.content.innerHTML="",this.content.appendChild(t)):this.content.innerHTML=t,this.container.style.display="block",this.content.scrollTop=0,this.setPosition(e),this}},{key:"hide",value:function hide(){return this.container.style.display="none",this}},{key:"isOpened",value:function isOpened(){return"block"==this.container.style.display}}],[{key:"isTouchDevice_",value:function isTouchDevice_(){try{return document.createEvent("TouchEvent"),!0}catch(e){return!1}}},{key:"enableTouchScroll_",value:function enableTouchScroll_(e){if(Popup.isTouchDevice_()){var t=0;e.addEventListener("touchstart",(function(e){t=this.scrollTop+e.touches[0].pageY}),!1),e.addEventListener("touchmove",(function(e){this.scrollTop=t-e.touches[0].pageY}),!1)}}}]),Popup}(e);return window.ol&&window.ol.Overlay&&(window.ol.Overlay.Popup=n),n}(n(2814))}}]);
//# sourceMappingURL=npm.ol-popup-366483d2185547f2c8cc.js.map
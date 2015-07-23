'use strict';

/*
// for drawer init
var elem=document.getElementById("paperDrawerPanel");
var event = new CustomEvent("paper-responsive-change", {detail:elem});
elem.dispatchEvent(event);

// adjusting content_inner_size
adjustContentInnerSize(0);
window.onresize=adjustContentInnerSize;
function adjustContentInnerSize(offset) {
    if(typeof offset=="undefined") offset=0;
    //document.getElementById("drawerpanel_main").style.setProperty("height", parseInt(window.innerHeight)-104 + "px"); 
    document.getElementById("drawerpanel_main").style.setProperty("height", parseInt(window.innerHeight)-80+offset + "px");
    document.getElementById("drawerpanel_drawer").style.setProperty("height", parseInt(window.innerHeight)-80+offset + "px");
}
*/
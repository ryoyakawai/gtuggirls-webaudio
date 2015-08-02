'use strict';
window.addEventListener('WebComponentsReady', function(event) {
    var insert=document.querySelector("#ja").import.querySelector("template");
    document.querySelector("#steps").appendChild(
        document.importNode(insert.content, true)
    );
});

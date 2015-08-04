'use strict';
// special thanks to https://github.com/citation-style-language/locales/blob/master/locales.json
var language_name={
    "ja-jp" : [
        "日本語",
        "Japanese"
    ],
    "en-us" : [
        "English",
        "English"
    ],
    "es-es" : [
        "Español (España)",
        "Spanish (Spain)"
    ],
    "de-de": [
        "Deutsch (Deutschland)",
        "German (Germany)"
    ],
    "zh-cn": [
        "中文(中国大陆)",
        "Chinese (PRC)"
    ],
    "zh-tw": [
        "中文(台灣)",
        "Chinese (Taiwan)"
    ]

};
if(window.location.pathname.match(/index\.html$/)==null) window.location.pathname+="index.html";
if(window.location.hostname!="localhost" && window.location.protocol=="http:") window.location.protocol="https:";
console.log(window.location.protocol);
var dialog = document.getElementById("modal");
var availableLang=[];
for(var key in language_name) {
    if(document.querySelector("link#"+key)!==null) {
        var button=document.createElement("paper-button");
        button.tabindex=0;
        button.className="blue ripple";
        button.style.setProperty("padding", "10px");
        button.innerHTML=language_name[key][0];
        button.lang=key;
        var ripple=document.createElement("paper-ripple");
        var material=document.createElement("paper-material");
        button.appendChild(ripple);
        button.appendChild(material);

        button.addEventListener("click", function(event){
            var lang=event.target.parentNode.lang ? event.target.parentNode.lang: event.target.parentNode.parentNode.lang;
            window.location="./index.html?"+lang+window.location.hash;
        });
        dialog.querySelector(".selectlang").appendChild(button);
        availableLang.push(key);
    }
}
var defLanguage="en-us", language="";
if(typeof window.location.search!="undefined") {
   language=window.location.search.replace(/\?/, "").substr(0, 5);
}
language=language.toLowerCase().replace(/[^a-z\-]/g, "");
if(language.toLowerCase().match(/[a-z\-]/)==null) {
    language=false;
}
window.addEventListener('WebComponentsReady', function(event) {
    if(availableLang.length>1) {
        var timerId=setInterval(function(){
            var elems=document.querySelector("#steps").getElementsByTagName("codelab-pack");
            if(typeof elems!="undefined") {
                elems[0].dispLanguageSelector();
                clearInterval(timerId);
            }
        }, 40);
    }

    if(language===false && availableLang.length==1) {
        window.location+="?"+availableLang[0]+window.location.hash;
    }
    
    if(language===false ||
       document.querySelector("link#"+language)===null || typeof language_name[language]=="undefined") {
        var dialog = document.getElementById("modal");
        if (dialog) dialog.open();
        language=defLanguage;
    }

    if(document.querySelector("link#"+language)===null) return;
    var insert=document.querySelector("#"+language).import.querySelector("template");
    document.querySelector("container#steps").appendChild(
        document.importNode(insert.content, true)
    );
});
var webaudiodemo=function() {
    this.audioCtx=new AudioContext();
    this.isPlaying={};
    this.osc=null;
    this.vco=null;
    this.lfo=null;
    this.depth=null;
    this.buffer=null;
    this.src=null;
    this.gainValue=0.8;
    this.timerId=null;
    this.analyser=null;
    this.canvasCtxStep7=null;
    this.canvasCtxStep8=null;
    this.analyserType7=0;
    this.analyserType8=0;
    this.astream=null;
    this.micsrc=null;
    this.convolver=null;
    this.revlevel=null;
};

webaudiodemo.prototype={
    playStep3: function() {
        var label;
        if(typeof this.isPlaying["step3"]=="undefined") {
            this.isPlaying["step3"]=false;
        }
        if(this.isPlaying["step3"]==false) {
            this.osc=this.audioCtx.createOscillator();
            this.gain=this.audioCtx.createGain();
            this.gain.gain.value=this.gainValue;
            this.osc.connect(this.gain);
            this.gain.connect(this.audioCtx.destination);
            this.osc.start(0);
            this.isPlaying["step3"]=true;
            label="Stop";
        } else {
            this.osc.stop(0);
            this.isPlaying["step3"]=false;
            label="Start";
        }
        return label;
    },
    playStep4: function() {
        var label;
        if(typeof this.isPlaying["step4"]=="undefined") {
            this.isPlaying["step4"]=false;
        }
        if(this.isPlaying["step4"]==false) {
            this.vco=this.audioCtx.createOscillator();
            this.lfo=this.audioCtx.createOscillator();
            this.gain=this.audioCtx.createGain();
            this.gain.gain.value=this.gainValue;
            this.depth=this.audioCtx.createGain();
            this.depth.gain.value=0.5;
            this.vco.connect(this.gain);
            this.gain.connect(this.audioCtx.destination);
            this.lfo.connect(this.depth);
            this.depth.connect(this.vco.frequency);

            // set initial parameter
            this._updateStep4Param();
            
            this.vco.start(0);
            this.lfo.start(0);
            this.isPlaying["step4"]=true;
            label="Stop";
        } else {
            this.vco.stop(0);
            this.lfo.stop(0);
            this.isPlaying["step4"]=false;
            label="Set";
        }
        return label;
    },
    randomStep4: function() {
        document.querySelector("span#step4vcofreq").innerHTML=parseInt(1000*(350+100*Math.random()))/1000;
        document.querySelector("span#step4lfofreq").innerHTML=parseInt(1000*(30*Math.random()))/1000;
        document.querySelector("span#step4depth").innerHTML=parseInt(1000*(5*Math.random()))/1000;
        this._updateStep4Param();
    },
    _updateStep4Param: function() {
        if(this.vco !=null) this.vco.frequency.value = parseFloat(document.querySelector("span#step4vcofreq").innerHTML);
        if(this.lfo !=null) this.lfo.frequency.value = parseFloat(document.querySelector("span#step4depth").innerHTML);
        if(this.depth !=null) this.depth.gain.value = parseFloat(document.querySelector("span#step4lfofreq").innerHTML);
    },
    playStep5: function() {
        var label;
        var url="./contents/snare.wav";
        var loadSample=new Promise(function(resolve, reject){
            var req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.responseType = "arraybuffer";
            req.onload = function() {
                if(req.response) {
                    this.audioCtx.decodeAudioData(req.response,function(b){
                        resolve(b);
                    },function(){});
                }
            }.bind(this);
            req.send();
        }.bind(this));
        loadSample.then(function(buffer){
            this.src = this.audioCtx.createBufferSource();
            this.src.buffer = buffer;
            this.src.connect(this.audioCtx.destination);
            this.src.start(0);
        }.bind(this));
    },
    playStep6: function(label, bypass) {
        switch(label) {
          case "Start":
            var url="./contents/loop.wav";
            var loadSample=new Promise(function(resolve, reject){
                var req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.responseType = "arraybuffer";
                req.onload = function() {
                    if(req.response) {
                        this.audioCtx.decodeAudioData(req.response,function(b){
                            resolve(b);
                        },function(){});
                    }
                }.bind(this);
                req.send();
            }.bind(this));
            loadSample.then(function(buffer){
                this.src = this.audioCtx.createBufferSource();
                this.src.buffer = buffer;

                this.input = this.audioCtx.createGain(); // #1 gain node を作成
                this.delay = this.audioCtx.createDelay(); // #2 delay node を作成
                this.wetgain = this.audioCtx.createGain(); // #3 gain node を作成
                this.drygain = this.audioCtx.createGain(); // #4 gain node を作成
                this.feedback = this.audioCtx.createGain(); // #5 gain node を作成
                
                this.src.connect(this.input);
                this.input.connect(this.delay);
                this.input.connect(this.drygain);
                this.delay.connect(this.wetgain);
                this.delay.connect(this.feedback);
                this.feedback.connect(this.delay);
                this.wetgain.connect(this.audioCtx.destination);
                this.drygain.connect(this.audioCtx.destination);

                this.delay.delayTime.value=0.25;
                this.feedback.gain.value=0.4;
                this.updateMixplayStep6(bypass);
                
                this.src.start(0);
            }.bind(this));
            label="Stop";
            break;
          case "Stop":
            this.src.stop(0);
            label="Start";
            break;
        }
        return label;
    },
    updateMixplayStep6: function(checked) {
        this.mix=0.4;
        if(checked==true) {
            this.mix=0;
        }        
        this._computeApplyMix();
    },
    _computeApplyMix: function() {
        this.wetgain.gain.value = this.mix;
        this.drygain.gain.value = 1 - this.mix;
    },
    playStep7: function(label, canvas, mode) {
        switch(label) {
          case "Start":
            this.analyser=this.audioCtx.createAnalyser();
            this.analyser.fftSize = 1024;
            this.canvasCtxStep7=canvas.getContext("2d");
            var url="./contents/loop.wav";
            var loadSample=new Promise(function(resolve, reject){
                var req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.responseType = "arraybuffer";
                req.onload = function() {
                    if(req.response) {
                        this.audioCtx.decodeAudioData(req.response,function(b){
                            resolve(b);
                        },function(){});
                    }
                }.bind(this);
                req.send();
            }.bind(this));
            loadSample.then(function(buffer){
                this.src = this.audioCtx.createBufferSource();
                this.src.buffer = buffer;
                this.src.loop = true;
                this.src.connect(this.audioCtx.destination);
                this.src.connect(this.analyser);
                this.src.start(0);
                requestAnimationFrame(this._playStep7Draw.bind(this));
            }.bind(this));
            label="Stop";
            break;
          case "Stop":
            this.src.stop(0);
            label="Start";
            break;
        }
        return label;
    },
    _playStep7Draw: function() {
        var mode=this.analyserType7;
        this.canvasCtxStep7.fillStyle = "rgba(34, 34, 34, 1.0)";
        this.canvasCtxStep7.fillRect(0, 0, 512, 256);
        this.canvasCtxStep7.strokeStyle="rgba(255, 255, 255, 1)";
        var data = new Uint8Array(512);
        if(mode == 0) this.analyser.getByteFrequencyData(data); //Spectrum Data
        else this.analyser.getByteTimeDomainData(data); //Waveform Data
        if(mode!=0) this.canvasCtxStep7.beginPath();
        for(var i = 0; i < 256; ++i) {
            if(mode==0) {
                this.canvasCtxStep7.fillStyle = "rgba(204, 204, 204, 0.8)";
                this.canvasCtxStep7.fillRect(i*2, 256 - data[i], 1, data[i]);
            } else {
                this.canvasCtxStep7.lineTo(i*2, 256 - data[i]);
            }
        }
        if(mode!=0) {
            this.canvasCtxStep7.stroke();
        }
        requestAnimationFrame(this._playStep7Draw.bind(this));
    },
    _toggleStep7GraphType: function() {
        this.analyserType7==0 ? this.analyserType7=1 : this.analyserType7=0;
    },
    playStep8: function(label, canvas, mode) {
        switch(label) {
          case "Start Mic":
            this.analyser=this.audioCtx.createAnalyser();
            this.analyser.fftSize = 1024;
            this.canvasCtxStep8=canvas.getContext("2d");

            var getUserMedia = navigator.getUserMedia ? 'getUserMedia' :
                navigator.webkitGetUserMedia ? 'webkitGetUserMedia' :
                navigator.mozGetUserMedia ? 'mozGetUserMedia' :
                navigator.msGetUserMedia ? 'msGetUserMedia' :
                undefined;
            var conditions={audio:true, video:false};
            navigator[getUserMedia](
                conditions,
                function(stream) {
                    this.astream=stream;
                    this.micsrc=this.audioCtx.createMediaStreamSource(stream);
                    this.micsrc.connect(this.audioCtx.destination);
                    this.micsrc.connect(this.analyser);
                }.bind(this),
                function(e) { console.error(e); }
            );
            requestAnimationFrame(this._playStep8Draw.bind(this));
            label="Stop Mic";
            break;
          case "Stop Mic":
            this.astream.stop(0);
            label="Start Mic";
            break;
        }
        return label;
    },
    _playStep8Draw: function() {
        var mode=this.analyserType8;
        this.canvasCtxStep8.fillStyle = "rgba(34, 34, 34, 1.0)";
        this.canvasCtxStep8.fillRect(0, 0, 512, 256);
        this.canvasCtxStep8.strokeStyle="rgba(255, 255, 255, 1)";
        var data = new Uint8Array(512);
        if(mode == 0) this.analyser.getByteFrequencyData(data); //Spectrum Data
        else this.analyser.getByteTimeDomainData(data); //Waveform Data
        if(mode!=0) this.canvasCtxStep8.beginPath();
        for(var i = 0; i < 256; ++i) {
            if(mode==0) {
                this.canvasCtxStep8.fillStyle = "rgba(204, 204, 204, 0.8)";
                this.canvasCtxStep8.fillRect(i*2, 256 - data[i], 1, data[i]);
            } else {
                this.canvasCtxStep8.lineTo(i*2, 256 - data[i]);
            }
        }
        if(mode!=0) {
            this.canvasCtxStep8.stroke();
        }
        requestAnimationFrame(this._playStep8Draw.bind(this));
    },
    _toggleStep8GraphType: function() {
        this.analyserType8==0 ? this.analyserType8=1 : this.analyserType8=0;
    },
    playStep9: function(label, progressElem, buttonElem) {
        var progress=[];
        switch(label) {
          case "Start":
            
            progressElem.className=progressElem.className.replace(/ hidden/, "");
            buttonElem.className+=" hidden";

            var buffers=[];
            var urls = ["./contents/loop.wav", "./contents/ir/s1_r1_bd.wav"];
            function loadSample(ctx, idx, progressElem, buttonElem) {
                var self=this;
                var req = new XMLHttpRequest();
                req.open("GET", urls[idx], true);
                req.responseType = "arraybuffer";
                req.onload = function() {
                    if(req.response) {
                        ctx.decodeAudioData(req.response,function(b){
                            buffers[idx]=b;
                            var count=0;
                            for(var i=0; i<buffers.length; i++) {
                                if(typeof buffers[i]!="undefined") count++;
                            }
                            if(count==urls.length) {
                                startPlay.bind(self)(buffers);
                            }
                        },function(){});
                    }
                };
                req.onprogress=function(event){
                    progress[idx] = event.loaded / event.total;
                    progressElem.value=100*sum(progress)/2;
                    if(progressElem.value==100) {
                        progressElem.className+=" hidden";
                        buttonElem.className=buttonElem.className.replace(/ hidden/, "");
                    }
                };
                req.send();
                var sum  = function(arr) {
                    return arr.reduce(function(prev, current, i, arr) {
                        return prev+current;
                    });
                };
            }
            // fetch files by xhr 
            for(var i=0; i<urls.length; i++) {
                loadSample.bind(this)(this.audioCtx, i, progressElem, buttonElem);
            }

            function startPlay(buffers) {
                this.convolver = this.audioCtx.createConvolver();
                this.revlevel = this.audioCtx.createGain();
                this.revlevel.gain.value=0.5;
                this.convolver.connect(this.revlevel);
                this.revlevel.connect(this.audioCtx.destination);
                
                this.src = this.audioCtx.createBufferSource();
                this.src.buffer = buffers[0];
                this.convolver.buffer = buffers[1];
                this.src.loop = true;
                var gain=this.audioCtx.createGain();
                gain.gain.value=0.3;

                this.src.connect(gain);
                gain.connect(this.audioCtx.destination);

                this.src.connect(this.convolver);

                this.src.start(0);
            };
            label="Stop";
            break;
          case "Stop":
            this.src.stop(0);
            label="Start";
            break;
        }
        return label;
    },
    _updateStep9Revlevel: function(val) {
        this.revlevel.gain.value=parseInt(val)*0.01;
    },

};
var ad=new webaudiodemo();

window.addEventListener('WebComponentsReady', function(event) {

    document.querySelector("button#step3").addEventListener("click", function(event){
        event.target.innerHTML=ad.playStep3();
    });
    document.querySelector("button#step4").addEventListener("click", function(event){
        event.target.innerHTML=ad.playStep4();
    });
    document.querySelector("button#step4-set").addEventListener("click", function(event){
        ad.randomStep4();
    });
    document.querySelector("button#step5").addEventListener("click", function(event){
        ad.playStep5();
    });
    document.querySelector("button#step6").addEventListener("click", function(event){
        var bypass=document.querySelector("input#step6bypass").checked;
        event.target.innerHTML=ad.playStep6(event.target.innerHTML, bypass);
    });
    document.querySelector("input#step6bypass").addEventListener("change", function(event){
        ad.updateMixplayStep6(event.target.checked);
    });
    document.querySelector("button#step7").addEventListener("click", function(event){
        event.target.innerHTML=ad.playStep7(event.target.innerHTML, document.querySelector("canvas#step7canvas"));
    });
    document.querySelector("canvas#step7canvas").addEventListener("click", function(event){
        ad._toggleStep7GraphType();
    });
    document.querySelector("button#step8").addEventListener("click", function(event){
        event.target.innerHTML=ad.playStep8(event.target.innerHTML, document.querySelector("canvas#step8canvas"));
    });
    document.querySelector("canvas#step8canvas").addEventListener("click", function(event){
        ad._toggleStep8GraphType();
    });
    document.querySelector("button#step9").addEventListener("click", function(event){
        event.target.innerHTML=ad.playStep9(event.target.innerHTML, document.querySelector("#step9progress"), event.target);
    });
    document.querySelector("input#step9revlevel").addEventListener("change", function(event){
        var val=event.target.value;
        event.target.nextSibling.innerHTML=val;
        ad._updateStep9Revlevel(val);
    });
});

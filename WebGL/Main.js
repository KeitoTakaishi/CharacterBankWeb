const assetsPath = './WebGL/'

let EVENTNAME_TOUCHSTART;
let EVENTNAME_TOUCHEND;
let EVENTNAME_TOUCHMOVE;
let isUsedTouch = false;
let mousePos = [0.5, 0.5];
const MAT = new matIV();
const QTN = new qtnIV();
const jsonLoader = new JsonLoader();


window.addEventListener('DOMContentLoaded', () => {
    let webgl = [new WebGLFrame(), new WebGLFrame(), new WebGLFrame()];
    
    let p = [];
    for(let i = 0; i < 3; i++){
        p[i] = webgl[i].init(document.getElementById( "webgl-canvas"+String(i) ) );
        p[i].then(() => {
            webgl[i].setup();  
         webgl[i].render(); 
        });
    }
    
    if ('ontouchend' in document) {
        EVENTNAME_TOUCHSTART = 'touchstart';
        EVENTNAME_TOUCHMOVE = 'touchmove';
        EVENTNAME_TOUCHEND = 'touchend';
        isUsedTouch = true;
    } else {
        EVENTNAME_TOUCHSTART = 'mousedown';
        EVENTNAME_TOUCHMOVE = 'mousemove';
        EVENTNAME_TOUCHEND = 'mouseup';
    }

    window.addEventListener(EVENTNAME_TOUCHMOVE, (e) =>{
        if(isUsedTouch){
            mousePos = [e.touches[0].clientX/window.innerWidth, e.touches[0].clientY/window.innerHeight];
        }else{
            mousePos = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
        }
        webgl.forEach(w => w.setMousePos(mousePos));
    });

}, false);
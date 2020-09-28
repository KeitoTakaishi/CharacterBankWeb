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
        offSet = [0.0 ,0.0];
        if(isUsedTouch){
            mousePos = [e.touches[0].clientX/window.innerWidth, e.touches[0].clientY/window.innerHeight];
        }else{
            mousePos = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
        }
    });
    
    let webgl = [new WebGLFrame(), new WebGLFrame(), new WebGLFrame()];
    
    let p = [];
    p[0] = webgl[0].init(document.getElementById( "webgl-canvas" ) );
    p[0].then(() => {
        webgl[0].setup();  
        webgl[0].render(); 
    });

    p[1] = webgl[1].init(document.getElementById( "webgl-canvas2" ) );
    p[1].then(() => {
        webgl[1].setup();  
        webgl[1].render(); 
    });
    p[2] = webgl[2].init(document.getElementById( "webgl-canvas3" ) );
    p[2].then(() => {
        webgl[2].setup();  
        webgl[2].render(); 
    });
}, false);
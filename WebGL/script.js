
let EVENTNAME_TOUCHSTART;
let EVENTNAME_TOUCHEND;
let EVENTNAME_TOUCHMOVE;
let isUsedTouch = false;
let mousePos = [];
const MAT = new matIV();
const QTN = new qtnIV();
let geomJsonData;
let VATJsonData;
let position, vertexIndex, vertexID = [];

let _ = [];
window.addEventListener('DOMContentLoaded', () => {
    //console.log('onLoadEvent');
    if ('ontouchend' in document) {
        //console.log('Event Type : Touch');
        EVENTNAME_TOUCHSTART = 'touchstart';
        EVENTNAME_TOUCHMOVE = 'touchmove';
        EVENTNAME_TOUCHEND = 'touchend';
        isUsedTouch = true;
    } else {
        //console.log('Event Type : Mouse');
        EVENTNAME_TOUCHSTART = 'mousedown';
        EVENTNAME_TOUCHMOVE = 'mousemove';
        EVENTNAME_TOUCHEND = 'mouseup';
    }

    
    window.addEventListener(EVENTNAME_TOUCHMOVE, (e) =>{
        //console.log('TouchEvent');
        offSet = [0.0 ,0.0];
        if(isUsedTouch){
            var ti = new Date().getTime() / 1000.0;
            mousePos = [e.touches[0].clientY/window.innerWidth, e.touches[0].clientY/window.innerHeight];
            ti = new Date().getTime()/1000.0 - ti;
            console.log(ti*1000.0 );
            //mousePos = [e.targetTouches[0].clientX/500.0, e.targetTouches[0].clientY/500.0];
          
        }else{
            mousePos = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
            //mousePos = [e.clientX / window.innerWidth, e.clientY / window.innerHeight];
            //mousePos = [0.5, 0.75];
        }
        
        //console.log(mousePos);
    });


    const geomJsonDataPath = './WebGL/Data.json';
    //const geomJsonDataPath = 'https://github.com/KeitoTakaishi/CharacterBankWeb/WebGL/Data.json';
    
    let promises = [];
    promises[0] = fetch(geomJsonDataPath)
        .then(response => response.json())
        .then(data => {
        geomJsonData = data;
    });

    const VATEndJsonDataPath = './WebGL/VATEnd.json'
    //const VATEndJsonDataPath = 'https://github.com/KeitoTakaishi/CharacterBankWeb/WebGL/VATEnd.json'
    promises[1] = fetch(VATEndJsonDataPath)
        .then(response => response.json())
        .then(data =>{
            VATJsonData = data;
    });

    


    let webgl = new WebGLFrame();
    //webgl.init('webgl-canvas');
    webgl.init(document.getElementById( "webgl-canvas" ) );

    promises[2] = webgl.load();
    Promise.all(promises)
    .then(() => {
        webgl.setup();  
        webgl.render(); 
    });
    /*
    webgl.load()      
    .then(() => {
        webgl.setup();  
        webgl.render(); 
    });
    */


}, false);




class WebGLFrame {
    /**
     * @constructor
     */
    constructor(){
        // initialize property
        this.canvas    = null;  
        this.gl        = null;  
        this.running   = false; 
        this.beginTime = 0;     
        this.nowTime   = 0;     
        this.render = this.render.bind(this);


        this.camera    = new InteractionCamera();
        this.mMatrix   = MAT.identity(MAT.create());
        this.vMatrix   = MAT.identity(MAT.create());
        this.pMatrix   = MAT.identity(MAT.create());
        this.vpMatrix  = MAT.identity(MAT.create());
        this.mvpMatrix = MAT.identity(MAT.create());
        this.invViewMatrix = MAT.identity(MAT.create());
        this.invProjMatrix = MAT.identity(MAT.create());

    }

    init(canvas){
        if(canvas instanceof HTMLCanvasElement === true){
            //console.log("canvas");
            this.canvas = canvas;

        }else if(Object.prototype.toString.call(canvas) === '[object String]'){
            let c = document.querySelector(`#${canvas}`);
            if(c instanceof HTMLCanvasElement === true){
                this.canvas = c;
            }
        }
        if(this.canvas == null){
            throw new Error('invalid argument');
        }
        this.gl = this.canvas.getContext('webgl');
        if(this.gl == null){
            throw new Error('webgl not supported');
        }

        /*
	    const ext = this.gl.getExtension('OES_texture_float');
        if(ext == null){
            alert('float texture not supported');
            return;
        }else{
            console.log("enable Extention Float Texture");
        }
        */

        const ext = this.getWebGLExtensions();
        this.stats = new Stats();
        const container = document.getElementById('container');
        container.appendChild(this.stats.domElement);
    }

    load(){
        this.program     = null; 
        this.attLocation = null; 
        this.attStride   = null; 
        this.uniLocation = null; 
        this.uniType     = null; 


        return new Promise((resolve) => {
            this.loadShader([
                './WebGL/vs1.vert', 
                './WebGL/fs1.frag', 
            ])
            .then((shaders) => {
                let gl = this.gl;
                let vs = this.createShader(shaders[0], gl.VERTEX_SHADER);
                let fs = this.createShader(shaders[1], gl.FRAGMENT_SHADER);
                this.program = this.createProgram(vs, fs);
                this.attLocation = [
                    gl.getAttribLocation(this.program, 'position'),
                    gl.getAttribLocation(this.program, 'vertexID'),

                ];
                this.attStride = [
                    3, 1
                ];
                this.uniLocation = [
                    gl.getUniformLocation(this.program, 'model'),
                    gl.getUniformLocation(this.program, 'view'),
                    gl.getUniformLocation(this.program, 'proj'),
                    gl.getUniformLocation(this.program, 'invView'),
                    gl.getUniformLocation(this.program, 'invProj'),
                    gl.getUniformLocation(this.program, 'mousePos'),
                    gl.getUniformLocation(this.program, 'time'),
                    gl.getUniformLocation(this.program, 'vertexNum'),
                    gl.getUniformLocation(this.program, 'VATTex0'),

                ];
                this.uniType = [
                    'uniformMatrix4fv',
                    'uniformMatrix4fv',
                    'uniformMatrix4fv',
                    'uniformMatrix4fv',
                    'uniformMatrix4fv',
                    'uniform2fv',
                    'uniform1f',
                    'uniform1f',
                    'uniform1i',
                ];
                resolve();
            });
        });
    }

    

    //--------------------------------------------------------------------------------------------------------------------------
    setup(){
        let gl = this.gl;
        //this.camera.update();
        //this.canvas.addEventListener('mousedown', this.camera.startEvent);
        //this.canvas.addEventListener('mousemove', this.camera.moveEvent);
        //this.canvas.addEventListener('mouseup', this.camera.endEvent);
        //this.canvas.addEventListener('wheel', this.camera.wheelEvent);

        //this.isMouseClicked = 0;
        //this.mousePos = [this.canvas.width/2.0, this.canvas.height/2.0];
        //this.mousePos = [];


        //Event
        /*
        this.canvas.addEventListener(EVENTNAME_TOUCHSTART, () =>{
            this.isMouseClicked = 1;
        });
        
        this.canvas.addEventListener(EVENTNAME_TOUCHEND, () =>{
            this.isMouseClicked = 0;
        });

        this.canvas.addEventListener(EVENTNAME_TOUCHMOVE, (e) =>{
            if(isUsedTouch){
                //when table
                //this.mousePos = [e.changedTouches[0].pageX/window.innerWidth, e.changedTouches[0].pageY/window.innerHeight];
                //this.mousePos = [e.changedTouches[0].pageX/this.canvas.width, e.changedTouches[0].pageY/this.canvas.height];
            }else{
                //when Mouse
                //this.mousePos = [e.clientX/window.innerWidth, e.clientY/window.innerHeight];
                this.mousePos = [e.clientX/this.canvas.width, e.clientY/this.canvas.height];
            }
        });
        */



        //--------------------------------------------------------------------
        //Geometry
        const position = geomJsonData[`Position`];
        const indices = geomJsonData[`Index`];
        const verteID = geomJsonData[`ID`]
        
        
        this.position = position;
        this.indices = indices;
        this.verteID = verteID;
        this.vertexNum = this.position.length / 3;

        this.geomVbo = [this.createVbo(this.position), this.createVbo(this.verteID)];
        this.geomIbo = this.createIbo(this.indices);

        
        //VAT
        this.VATPosition = VATJsonData['Position'];
        this.VATTex = this.createRenderTexture(this.VATPosition);
        //--------------------------------------------------------------------
        //setup rendering
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);

        this.running = true;
        this.beginTime = Date.now();

    }
    //--------------------------------------------------------------------------------------------------------------------------
    render(){
        //mousePos = [0.5 * Math.sin(this.nowTime) + 0.5, 0.5 * Math.cos(this.nowTime) + 0.5];
       
        this.stats.update();
        //--------------------------------------------------------------------
        //setup
        let gl = this.gl;
        if(this.running === true){
            requestAnimationFrame(this.render);
        }
        this.nowTime = (Date.now() - this.beginTime) / 1000;
        
        //Canvas Size
        //this.canvas.width = 500;
        //this.canvas.height = 500;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight/2.0;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //--------------------------------------------------------------------
        //rendering
        gl.useProgram(this.program);
        this.setAttribute(this.geomVbo, this.attLocation, this.attStride, this.geomIbo);
        //this.setAttribute(this.geomVbo, this.attLocation, this.attStride);
       
        let cameraPosition    = [0.0, 0.0, 10.0];             
        let centerPoint       = [0.0, 0.0, 0.0];             
        let cameraUpDirection = [0.0, 1.0, 0.0];             
        let fovy   = 60 * this.camera.scale;                 
        let aspect = this.canvas.width / this.canvas.height; 
        let near   = 0.1;                                    
        let far    = 30.0;                                   
        this.vMatrix  = MAT.lookAt(cameraPosition, centerPoint, cameraUpDirection);
        this.pMatrix  = MAT.perspective(fovy, aspect, near, far);
        this.vpMatrix = MAT.multiply(this.pMatrix, this.vMatrix);
       
        //Todo
        //this.camera.update();
        let quaternionMatrix = MAT.identity(MAT.create());
        quaternionMatrix = QTN.toMatIV(this.camera.qtn, quaternionMatrix);
        this.vpMatrix = MAT.multiply(this.vpMatrix, quaternionMatrix);
        
        this.mMatrix = MAT.identity(this.mMatrix);
        this.mvpMatrix = MAT.multiply(this.vpMatrix, this.mMatrix);

        MAT.inverse(this.vMatrix, this.invViewMatrix);
        MAT.inverse(this.pMatrix, this.invProjMatrix);

        //Uniform
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.VATTex);
        

        
        this.setUniform([
            this.mMatrix,
            this.vMatrix,
            this.pMatrix,
            this.invViewMatrix,
            this.invProjMatrix,
            [mousePos[0], mousePos[1]],
            this.nowTime,
            this.vertexNum,
            0
        ], 
        this.uniLocation, this.uniType);
        
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    loadShader(pathArray){
        if(Array.isArray(pathArray) !== true){
            throw new Error('invalid argument');
        }
        let promises = pathArray.map((path) => {
            return fetch(path).then((response) => {return response.text();})
        });
        return Promise.all(promises);
    }

    createShader(source, type){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    createProgram(vs, fs){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }
    createVbo(data){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    createIbo(data){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    createIboInt(data){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        if(ext == null || ext.elementIndexUint == null){
            throw new Error('element index Uint not supported');
        }
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

  
    createTextureFromFile(source){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        return new Promise((resolve) => {
            let gl = this.gl;
            let img = new Image();
            img.addEventListener('load', () => {
                let tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.bindTexture(gl.TEXTURE_2D, null);
                resolve(tex);
            }, false);
            img.src = source;
        });
    }

    //source is list data
    createRenderTexture(source){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
      
        let gl = this.gl;
        let fTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTex);
        const level = 0;
        const internalFormat = gl.RGB;
        const width = this.vertexNum;
        const  height = 1;
        const border = 0;
        const format = gl.RGB;
        const type = gl.FLOAT;
        let data = new Float32Array(source);

        const alignment = 1;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                        format, type, data);
        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        return fTex;

    }

    createFramebuffer(width, height){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }

   
    createFramebufferFloat(ext, width, height){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
            throw new Error('float texture not supported');
        }
        let flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, texture: fTexture};
    }

 
    setAttribute(vbo, attL, attS, ibo){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        vbo.forEach((v, index) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, v);
            gl.enableVertexAttribArray(attL[index]);
            gl.vertexAttribPointer(attL[index], attS[index], gl.FLOAT, false, 0, 0);
        });
        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

  
    setUniform(value, uniL, uniT){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        value.forEach((v, index) => {
            let type = uniT[index];
            if(type.includes('Matrix') === true){
                gl[type](uniL[index], false, v);
            }else{
                gl[type](uniL[index], v);
            }
        });
    }

   
    getWebGLExtensions(){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        let gl = this.gl;
        return {
            elementIndexUint: gl.getExtension('OES_element_index_uint'),
            textureFloat:     gl.getExtension('OES_texture_float'),
            textureHalfFloat: gl.getExtension('OES_texture_half_float'),
            OES_standard_derivatives: gl.getExtension('OES_standard_derivatives'),
        };
    }
}


//----------------------------------------------------------------------------------------------------------
class InteractionCamera {
    /**
     * @constructor
     */
    constructor(){
        this.qtn               = QTN.identity(QTN.create());
        this.dragging          = false;
        this.prevMouse         = [0, 0];
        this.rotationScale     = Math.min(window.innerWidth, window.innerHeight);
        this.rotation          = 0.0;
        this.rotateAxis        = [0.0, 0.0, 0.0];
        this.rotatePower       = 2.0;
        this.rotateAttenuation = 0.9;
        this.scale             = 1.0;
        this.scalePower        = 0.0;
        this.scaleAttenuation  = 0.8;
        this.scaleMin          = 0.25;
        this.scaleMax          = 2.0;
        this.startEvent        = this.startEvent.bind(this);
        this.moveEvent         = this.moveEvent.bind(this);
        this.endEvent          = this.endEvent.bind(this);
        this.wheelEvent        = this.wheelEvent.bind(this);
    }
    /**
     * mouse down event
     * @param {Event} eve - event object
     */
    startEvent(eve){
        this.dragging = true;
        this.prevMouse = [eve.clientX, eve.clientY];
    }
    /**
     * mouse move event
     * @param {Event} eve - event object
     */
    moveEvent(eve){
        if(this.dragging !== true){return;}
        let x = this.prevMouse[0] - eve.clientX;
        let y = this.prevMouse[1] - eve.clientY;
        this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
        this.rotateAxis[0] = y;
        this.rotateAxis[1] = x;
        this.prevMouse = [eve.clientX, eve.clientY];
    }
    /**
     * mouse up event
     */
    endEvent(){
        this.dragging = false;
    }
    /**
     * wheel event
     * @param {Event} eve - event object
     */
    wheelEvent(eve){
        let w = eve.wheelDelta;
        let s = this.scaleMin * 0.1;
        if(w > 0){
            this.scalePower = -s;
        }else if(w < 0){
            this.scalePower = s;
        }
    }
    /**
     * quaternion update
     */
    update(){
        this.scalePower *= this.scaleAttenuation;
        this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
        if(this.rotation === 0.0){return;}
        this.rotation *= this.rotateAttenuation;
        let q = QTN.identity(QTN.create());
        QTN.rotate(this.rotation, this.rotateAxis, q);
        QTN.multiply(this.qtn, q, this.qtn);
    }
}
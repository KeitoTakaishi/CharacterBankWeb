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

        const ext = this.getWebGLExtensions();
        const container = document.getElementById('container');

        this.promises = [];
        this.promises[0] = this.loadShaders();
        this.promises[1] = jsonLoader.loadA ();
        return Promise.all(this.promises);
    }


    loadShaders(){
        this.program     = null; 
        this.attLocation = null; 
        this.attStride   = null; 
        this.uniLocation = null; 
        this.uniType     = null; 


        return new Promise((resolve) => {
            this.loadShaderFiles([
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
                    gl.getUniformLocation(this.program, 'VATTex1'),
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
        //--------------------------------------------------------------------
        //Geometry
        //console.log(this.geomJsonData);
        const position = jsonLoader.geomJsonData[`Position`];
        const indices = jsonLoader.geomJsonData[`Index`];
        const verteID = jsonLoader.geomJsonData[`ID`]
        
        this.position = position;
        this.indices = indices;
        this.verteID = verteID;
        this.vertexNum = this.position.length / 3;

        this.geomVbo = [this.createVbo(this.position), this.createVbo(this.verteID)];
        this.geomIbo = this.createIbo(this.indices);

        //VAT
       this.VATPosition = new Array(
        jsonLoader.VATJsonData[0]['Position'], 
        jsonLoader.VATJsonData[1]['Position'],
       );
       this.VATTex =  new Array(this.createRenderTexture(this.VATPosition[0]), this.createRenderTexture(this.VATPosition[1]));
        //--------------------------------------------------------------------
        //setup rendering
        gl.clearColor(0.2, 0.2, 0.2, 0.0);//for transparent
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);

        this.running = true;
        this.beginTime = Date.now();
    }
    //--------------------------------------------------------------------------------------------------------------------------
    render(){
        //--------------------------------------------------------------------
        //setup
        let gl = this.gl;
        if(this.running === true){
            requestAnimationFrame(this.render);
        }
        this.nowTime = (Date.now() - this.beginTime) / 1000;
        
        //Canvas Size
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //--------------------------------------------------------------------
        //rendering
        gl.useProgram(this.program);
        this.setAttribute(this.geomVbo, this.attLocation, this.attStride, this.geomIbo);
       
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
        gl.bindTexture(gl.TEXTURE_2D, this.VATTex[0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.VATTex[1]);
        

        this.setUniform([
            this.mMatrix,
            this.vMatrix,
            this.pMatrix,
            this.invViewMatrix,
            this.invProjMatrix,
            [mousePos[0], mousePos[1]],
            this.nowTime,
            this.vertexNum,
            0,
            1,
        ], 
        this.uniLocation, this.uniType);

        //gl.enable(gl.CULL_FACE);
        //gl.cullFace(gl.BACK);
        
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
    
    }

    loadShaderFiles (pathArray){
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
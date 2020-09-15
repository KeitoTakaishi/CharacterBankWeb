#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform vec2 mousePos;
uniform float isMouseClicked;
uniform sampler2D VATTex0;
uniform float vertexNum;

varying vec4 vPos;
varying vec3 vCol;
varying float vVertexId;

void main(){
    vec3 dx = dFdx(vPos.xyz);
    vec3 dy = dFdy(vPos.xyz);
    vec3 n = normalize(cross(normalize(dx), normalize(dy)));

    vec3 light = normalize( vec3(0.5, 1.0, 0.0));
    float diff = clamp(dot(n, light), 0.1, 1.0);
    gl_FragColor = vec4(vec3(1.0) * diff, 1.0);
}


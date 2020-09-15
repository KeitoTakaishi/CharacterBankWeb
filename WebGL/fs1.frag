precision mediump float;

uniform vec2 mousePos;
uniform float isMouseClicked;

varying vec3 vCol;
void main(){
    //vec3 interractionCol = vec3(mousePos.x * isMouseClicked, mousePos.y * isMouseClicked, .0);
    //vec3 interractionCol = vec3(mousePos.x, mousePos.y, .0);
    vec3 interractionCol = vec3(1.0, 1.0, 1.0);

    gl_FragColor = vec4(vCol,  1.0 );
}


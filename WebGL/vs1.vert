precision mediump float;

#define PI 3.14159265
attribute vec3 position;
attribute float vertexID;

//uniform mat4 mvp;
uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 invView;
uniform mat4 invProj;

uniform vec2 mousePos;
uniform float isMouseClicked;
uniform float time;
uniform float vertexNum;

varying vec3 vCol;


mat4 RotZMatrix(float psi) {
	mat4 m = mat4(
		cos(psi),   sin(psi),   0.0,    0.0,
		-sin(psi),  cos(psi),   0.0,    0.0,
		0.0,        0.0,        1.0,    0.0,
		0.0,        0.0,        0.0,    1.0
		);
	return m;
}


mat4 RotXMatrix(float phi) {
	mat4 m = mat4(
		1.0,        0.0,        0.0,        0.0,
		0.0,        cos(phi),   sin(phi),   0.0,
		0.0,        -sin(phi),  cos(phi),   0.0,
		0.0,        0.0,        0.0,        1.0
		);
	return m;
}

mat4 RotYMatrix(float theta) {
	mat4 m = mat4(
		cos(theta),     0.0,    -sin(theta),     0.0,
		0.0,            1.0,    0.0,            0.0,
		sin(theta),    0.0,    cos(theta),     0.0,
		0.0,            0.0,    0.0,            1.0
		);
	return m;
}

void main(){
    
    //mouse interaction matrix
    vec2 mosueRotPower = vec2(200.0, 200.0);
    vec2 diff = mousePos - vec2(0.5, 0.5);
    diff *= mosueRotPower;
    mat4 mouseRotMat = RotXMatrix(diff.y * PI / 180.0) * RotYMatrix(diff.x * PI / 180.0);   

    //float t = time * 50.0* PI / 180.0;
    //mat4 _model = RotXMatrix(0.0 * PI / 180.0);
    //_model = mouseRotMat * _model;
    vec4 p = proj * view * mouseRotMat * vec4(position, 1.0);
    //p = invView * invProj * p;


	float diffuse = max(dot(normalize(p.xyz), vec3(0.25, 0.5, 0.0)), 0.0);
	diffuse = diffuse * 0.5 + 0.5;
    //vCol = vec3(diffuse * normalize(p.xyz));
    vCol = vec3(vertexID/vertexNum);
    gl_Position =  p;

    //gl_PointSize = 3.0;
}





/*

float4x4 RotYMatrix(float theta) {
	float4x4 m = float4x4(
		cos(theta), 0.0, sin(theta), 0.0,
		0.0, 1.0, 0.0, 0.0,
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
		);
	return m;
}
*/
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

uniform sampler2D VATTex0;
uniform sampler2D VATTex1;


varying vec4 vPos;
varying vec3 vCol;
varying float vVertexId;


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



mat4 TranslateMatrix(vec3 t) {
	mat4 m = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		t.x, t.y, t.z, 1.0
		);
	return m;
}


float easeInQuad(float t)
{
	return t * t;
}

float easeOutQuad(float t)
{
	return -1.0 * t * (t - 2.0);
}

float easeInOutQuad(float t)
{
	if((t *= 2.0) < 1.0)
	{
		return 0.5 * t * t;
	} else
	{
		return -0.5 * ((t - 1.0) * (t - 3.0) - 1.0);
	}
}

float easeInCubic(float t)
{
	return t * t * t;
}

float easeOutCubic(float t)
{
	return (t = t - 1.0) * t * t + 1.0;
}

float easeInOutCubic(float t)
{
	if((t *= 2.0) < 1.0)
	{
		return 0.5 * t * t * t;
	} else
	{
		return 0.5 * ((t -= 2.0) * t * t + 2.0);
	}
}


void main(){
    vec2 mosueRotPower = vec2(200.0, 200.0);
    vec2 diff = mousePos - vec2(0.5, 0.5);
    diff *= mosueRotPower;
    mat4 mouseRotMat = RotXMatrix(diff.y * PI / 180.0) * RotYMatrix(diff.x * PI / 180.0);   

	//----------------------
	//VAT
	float delta = 0.5 / vertexNum; 
    vec2 uv = vec2(1.0/vertexNum * vertexID + delta, 0.0);
    

	float k = 0.5*(1.0+sin(time*0.2));//0.0 ~ 1.0
	vec3 vatPos = vec3(0.0, 0.0, 0.0);
	vec3 dir = vec3(0.0, 0.0, 0.0);
	mat4 translateMat = TranslateMatrix(vec3(0.0, 0.0, 0.0));
	if(k < 0.5){
		vatPos = texture2D(VATTex0, uv).rgb;
		dir = (mouseRotMat * vec4(vatPos, 1.0)).xyz - (mouseRotMat * vec4(position, 1.0)).xyz;
		translateMat = TranslateMatrix(dir * k * 2.0);
	}else{
		vatPos = texture2D(VATTex0, uv).rgb;
		vec3 vatPos2 = texture2D(VATTex1, uv).rgb;

		dir = (mouseRotMat * vec4(vatPos, 1.0)).xyz - (mouseRotMat * vec4(position, 1.0)).xyz;
		dir += ((mouseRotMat * vec4(vatPos2, 1.0)).xyz - (mouseRotMat * vec4(vatPos, 1.0)).xyz) * (k*2.0 - 1.0);
		translateMat = TranslateMatrix(dir);
	}
	

    mat4 _model = translateMat * mouseRotMat ;

    vec4 p = proj * view * _model * vec4(position, 1.0);
    vPos = _model * vec4(position, 1.0);


	float diffuse = max(dot(normalize(p.xyz), vec3(0., 0.5, 0.0)), 0.0);
	diffuse = diffuse * 0.5 + 0.5;
	vCol = vec3(diffuse);
	vVertexId = float(vertexID);
    gl_Position =  p;

}

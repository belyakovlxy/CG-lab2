
console.log("script's working")

let gl;

let vsSource =
    [
        'precision mediump float;',
        'attribute vec3 vertPositions;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        '',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        '',
        'void main()',
        '{',
        '   fragColor = vertColor;',
        '   fragPosition = vertPositions;',
        '   gl_Position = mProj * mView * mWorld * vec4(vertPositions, 1.0);',
        '}',
    ].join('\n');

let fsSource =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '   gl_FragColor = vec4(fragColor, 1.0);',
        '}',
    ].join('\n');

    const fsSourceLines = [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'void main()', 
        '{',
        '   int x = int(fragPosition.x * 10.0);',
        '   float y = mod(float(x), 2.0);', 
        '   if ((y == 0.0) && (x < 0) || (y != 0.0) && (x >= 0) || fragPosition.x <= 0.0 && fragPosition.x >= -0.1)',
        '   {',
        '       gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
        '   }',
        '   else',
        '   {',
        '       gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);',
        '   }',
        '}'
    ].join('\n');


function initWebGl(canvas)
{
    gl = canvas.getContext("webgl");

    if (!gl)
    {
        console.log("WebGL not supported")
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl)
    {
        alert("Your browser does not support WebGL");
    }

    gl.clearColor(1, 0.85, 0.85, 1);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function loadShader(gl, type, source)
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error! Shader compile status ", gl.getShaderInfoLog(shader));
        return;
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource)
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        console.error("Error! Link program", gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.validateProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS))
    {
        console.error("Error! validate program", gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}

function initBuffer(gl, buffer, arrType, dataType)
{
    let BufferObject = gl.createBuffer();
    gl.bindBuffer(arrType, BufferObject);
    gl.bufferData(arrType, new dataType(buffer), gl.STATIC_DRAW);
}

function enableVertexAtrib(shaderProgram, attributeName, size, stride, offset)
{
    let attribLocation = gl.getAttribLocation(shaderProgram, attributeName);
    gl.vertexAttribPointer(
        attribLocation,
        size,
        gl.FLOAT,
        false,
        stride * Float32Array.BYTES_PER_ELEMENT,
        offset * Float32Array.BYTES_PER_ELEMENT
    );

    return attribLocation;
}

//
// Pentagon
//

let canvas = document.getElementById("pentagon");
canvas.height = 600;
canvas.width = 600;

initWebGl(canvas);
let shaderProgram = initShaderProgram(gl, vsSource, fsSource);
initBuffer(gl, pentagonVertices, gl.ARRAY_BUFFER, Float32Array);

let positionAttribLocation = enableVertexAtrib(
    shaderProgram,
    "vertPositions",
    3, 6, 0);
gl.enableVertexAttribArray(positionAttribLocation);

let colorAttribLocation = enableVertexAtrib(
    shaderProgram,
    "vertColor",
    3, 6, 3);
gl.enableVertexAttribArray(colorAttribLocation);

gl.useProgram(shaderProgram);


let matWorldLocation = gl.getUniformLocation(shaderProgram, "mWorld");
let matViewLocation = gl.getUniformLocation(shaderProgram, "mView");
let matProjLocation = gl.getUniformLocation(shaderProgram, "mProj");

let worldMatrix = new Float32Array(16);
let viewMatrix = new Float32Array(16);
let projMatrix = new Float32Array(16);

glMatrix.mat4.identity(worldMatrix);
glMatrix.mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
glMatrix.mat4.perspective(projMatrix, angle(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matWorldLocation, false, worldMatrix);
gl.uniformMatrix4fv(matViewLocation, false, viewMatrix);
gl.uniformMatrix4fv(matProjLocation, false, projMatrix);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);

//
// cube
//

canvas = document.getElementById("cube");
canvas.height = 600;
canvas.width = 600;

initWebGl(canvas);
let shaderProgramCube = initShaderProgram(gl, vsSource, fsSource);
initBuffer(gl, cubeVertices, gl.ARRAY_BUFFER, Float32Array);
initBuffer(gl, cubeIndices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);

let positionAttribLocationCube = enableVertexAtrib(
    shaderProgramCube,
    "vertPositions",
    3, 6, 0);
gl.enableVertexAttribArray(positionAttribLocationCube);

let colorAttribLocationCube = enableVertexAtrib(
    shaderProgramCube,
    "vertColor",
    3, 6, 3);
gl.enableVertexAttribArray(colorAttribLocationCube);

gl.useProgram(shaderProgramCube);


let matWorldLocationCube = gl.getUniformLocation(shaderProgramCube, "mWorld");
let matViewLocationCube = gl.getUniformLocation(shaderProgramCube, "mView");
let matProjLocationCube = gl.getUniformLocation(shaderProgramCube, "mProj");

let worldMatrixCube = new Float32Array(16);
let viewMatrixCube = new Float32Array(16);
let projMatrixCube = new Float32Array(16);

glMatrix.mat4.identity(worldMatrixCube);
glMatrix.mat4.rotate(worldMatrixCube, worldMatrixCube, angle(45), [1, 1, 0]);
glMatrix.mat4.lookAt(viewMatrixCube, [0, 0, -7], [0, 0, 0], [0, 1, 0]);
glMatrix.mat4.perspective(projMatrixCube, angle(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matWorldLocationCube, false, worldMatrixCube);
gl.uniformMatrix4fv(matViewLocationCube, false, viewMatrixCube);
gl.uniformMatrix4fv(matProjLocationCube, false, projMatrixCube);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);


//
// Striped square
//

canvas = document.getElementById("square");
canvas.height = 600;
canvas.width = 600;

initWebGl(canvas);
let shaderProgramSquare = initShaderProgram(gl, vsSource, fsSourceLines);
initBuffer(gl, squareVertices, gl.ARRAY_BUFFER, Float32Array);

let positionAttribLocationSquare = enableVertexAtrib(
    shaderProgramSquare,
    "vertPositions",
    3, 6, 0);
gl.enableVertexAttribArray(positionAttribLocationSquare);

let colorAttribLocationSquare = enableVertexAtrib(
    shaderProgramSquare,
    "vertColor",
    3, 6, 3);
gl.enableVertexAttribArray(colorAttribLocationSquare);

gl.useProgram(shaderProgramSquare);


let matWorldLocationSquare = gl.getUniformLocation(shaderProgramSquare, "mWorld");
let matViewLocationSquare = gl.getUniformLocation(shaderProgramSquare, "mView");
let matProjLocationSquare = gl.getUniformLocation(shaderProgramSquare, "mProj");

let worldMatrixSquare = new Float32Array(16);
let viewMatrixSquare = new Float32Array(16);
let projMatrixSquare = new Float32Array(16);

glMatrix.mat4.identity(worldMatrixSquare);
glMatrix.mat4.lookAt(viewMatrixSquare, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
glMatrix.mat4.perspective(projMatrixSquare, angle(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matWorldLocationSquare, false, worldMatrixSquare);
gl.uniformMatrix4fv(matViewLocationSquare, false, viewMatrixSquare);
gl.uniformMatrix4fv(matProjLocationSquare, false, projMatrixSquare);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 40);
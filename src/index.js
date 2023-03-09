console.log("script's working")

let gl;

let vsSource =
    [
        'precision mediump float;',
        'attribute vec2 vertPositions;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '   fragColor = vertColor;',
        '   gl_Position = vec4(vertPositions, 0, 1.0);',
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

const angle = (degree) =>
{
    return degree * (Math.PI / 180);
}

const deg = 72;

let pentagonVertices =
    [ // X       y
        0.0,    0.0,    1.0, 0.0, 0.0,
        0.0,    0.5,   0.0, 0.0, 1.0,
        Math.cos(angle(90 + deg)) * 0.5,    Math.sin(angle(90 + deg)) * 0.5,   0.0, 0.0, 1.0,
        Math.cos(angle(90 + 2 * deg)) * 0.5,    Math.sin(angle(90 + 2 * deg)) * 0.5,   0.0, 0.0, 1.0,
        Math.cos(angle(90 + 3 * deg)) * 0.5,    Math.sin(angle(90 + 3 * deg)) * 0.5,   0.0, 0.0, 1.0,
        Math.cos(angle(90 + 4 * deg)) * 0.5,    Math.sin(angle(90 + 4 * deg)) * 0.5,   0.0, 0.0, 1.0,
        Math.cos(angle(90 + 5 * deg)) * 0.5,    Math.sin(angle(90 + 5 * deg)) * 0.5,   0.0, 0.0, 1.0,

    ];

let squareVertices =
    [
        0.5,    0.5,    1.0, 0.0, 0.0,
        0.5,   -0.5,   0.0, 1.0, 0.0,
        -0.5,    -0.5,   0.0, 0.0, 1.0,
        -0.5,    0.5,   0.0, 1.0, 1.0
    ];

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

function initBuffer(buffer)
{
    let triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
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
initBuffer(pentagonVertices);

let positionAttribLocation = enableVertexAtrib(
    shaderProgram,
    "vertPositions",
    2, 5, 0);
gl.enableVertexAttribArray(positionAttribLocation);

let colorAttribLocation = enableVertexAtrib(
    shaderProgram,
    "vertColor",
    3, 5, 2);
gl.enableVertexAttribArray(colorAttribLocation);

gl.useProgram(shaderProgram);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);
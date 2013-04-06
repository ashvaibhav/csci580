//var imageData = '';
var vertices = new Array();
//var imageDataFinal = '';
var c = "";
var reader = new FileReader();
var showWireframe = fa0lse;
var vector = {x:0, y:0, z:0}
function render(){
	document.getElementById('status2').innerHTML="";
	document.getElementById('status2').innerHTML="Kindly wait for rendering!!!";
	var imageData = Create2DArray(parseInt(document.getElementById("canvas1").getAttribute("height")));
	clearCanvas();

	renderData(imageData);
}
/*
	Code to incorporate animation
*/
var animGlobal = {};
animGlobal.La = {pos:{x:0, y:0, z:0},color:{r:3,g:10,b:15}};
animGlobal.LaInc = 1;
animGlobal.Light = '';
var animCounter = 35;
var animCounterInc = 10;
var animInterval = '';
var textureData = '';
var isAnimationDone = false;
function animate(){
	
	var val = document.getElementById("anim").value;
	switch(val){
		case "STOP":
			window.clearInterval(animInterval);
			document.getElementById("anim").value = "ANIMATE";
			if(animObj) animObj.isAnimationOn = false;
			isAnimationDone = true;
			break;
		case "ANIMATE":
			isAnimationDone = false;
			document.getElementById("anim").value = "STOP";			
			animInterval = window.setInterval(function(){ 
				var animObj = {};
			    //code goes here that will be run every 5 seconds.    
			    var animationChoice = document.getElementsByName('animation');
			    for(var i in animationChoice){
			    	if(animationChoice[i].checked){
						animationChoice = animationChoice[i].value
						break;
					}
			    }

			    var imageData = Create2DArray(parseInt(document.getElementById("canvas1").getAttribute("height")));
			    switch(animationChoice){
			    	case 'La':
				    	if(animGlobal.La.color.r>6)
				    		animGlobal.LaInc = -1;
				    	else if(animGlobal.La.color.r<0)
				    		animGlobal.LaInc = 1;
				    	else
				    		animGlobal.LaInc = 1;

				    	animGlobal.La.color.r = animGlobal.La.color.r+animGlobal.LaInc;
				    	animGlobal.La.color.g = animGlobal.La.color.r+animGlobal.LaInc*2;
				    	animGlobal.La.color.b = animGlobal.La.color.r+animGlobal.LaInc*3;
				    //setting animation parameters
				    	animObj.d = 2;
				    	animObj.La = animGlobal.La;
					    //renderData(imageData, {d:2,  La:animGlobal.La});	//FOV:animCounter,					    
					//clearCanvas('canvas2');
					break;
					case 'FOV':
					//setting animation parameters
						animObj.d = 2;
						animObj.FOV = animCounter;
					    //renderData(imageData, {d:2, FOV:animCounter});	
					    animCounter +=animCounterInc;					    
					break;
					case 'proceduralTexture':
						var operator = '';
						var rand = animCounter%3;//Math.random();
						operator = rand<1?"+":rand<2?"*":rand<3?"-":"%";
						animObj.proceduralTexture = {
							operator : operator
						};
					break;
				}
				animObj.isAnimationOn = true;
				renderData(imageData, animObj);
				animCounter +=animCounterInc;
					    if(animCounter>179)
					    	animCounterInc = -10
					    if(animCounter<10)
					    	animCounterInc= +10
				isAnimationDone = true;
				}, 5000);
				animInterval();
			break;
	}
			
}

function clearCanvas(){
	var ctx = document.getElementById("canvas1").getContext("2d")
	ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, 1, 1);
    ctx.clearRect(0, 0, 500, 500);
}

/*
	driver function from where everything starts executing
*/
function main(file){
	var element = document.getElementById("canvas1");
	data = document.getElementById("data");
	c = element.getContext("2d");
	//read the width and height of the canvas
	var width = parseInt(element.getAttribute("width"));
	var height = parseInt(element.getAttribute("height"));
	//create a new pixel array
	var imageData = Create2DArray(height);
	//imageData = c.createImageData(width, height);

	//init();
	readData(file, imageData);
	/* ideally next showData will get executed */
}
function translate(tx,ty,tz){	
	return [[1,0,0,tx],[0,1,0,ty],[0,0,1,tz],[0,0,0,1]];
}
function rotateZ(degree){
	var rad = radians(degree)
	var cos = Math.cos(rad)
	var sin = Math.sin(rad)
	return [
			[cos, 	(-1)*sin, 	0, 		0],
			[sin, 	cos, 		0, 		0],
			[0,		0,			1,		0],
			[0,		0,			0,		1]
		]
}
function rotateX(degree){
	var rad = radians(degree)
	var cos = Math.cos(rad)
	var sin = Math.sin(rad)
	return [
			[1,		0,			0,		0],
			[0,		cos, 	(-1)*sin,	0],
			[0,		sin, 	cos, 		0],			
			[0,		0,			0,		1]
		]
}
function rotateY(degree){
	var rad = radians(degree)
	var cos = Math.cos(rad)
	var sin = Math.sin(rad)
	return [
			[cos, 	0,			sin,	0],
			[0,		1,			0, 		0],
			[(-1)*sin, 	0,		cos,	0],
			[0,		0,			0,		1]
		]
}
function scale(sx,sy,sz){
	var matrix = new Array();
	//matrix.push();

	matrix = [[sx,0,0,0],[0,sy,0,0],[0,0,sz,0],[0,0,0,1]]
	return matrix
}

function getXFormsIp(){

	var matrix = new Array();
	var mat = new Array();
	//translate
	matrix.push(translate(0,0,0))	

	//scale
	//mat.push(translate(100,1,1))	
	//mat.push(scale(10,1,1))
	//mat.push(translate(100,1,1))
	for(var index in mat){
		matrix.push(mat[index]);
	}

	do{
		var matA = matrix.pop();
		var matB = matrix.pop();
		if(matA  && matB)
			matrix.push(matrixMultiply(matA, matB))
		else if(matA)
			matrix.push(matA)
		else
			break;
	}while(matB)
	//the function returns one matrix after popping out all of them and multiplying each with all.
	if(matrix.length<1)
		matrix.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]])
	return matrix.pop();
}

function matrixMultiply(matB, matA, row, col){
	if(!row) row = 4;
	if(!col) col = 4;
	var matC = new Array();
	var arr = new Array();
	var sum = 0;
	//for every row,
		//for every column
			//multiply all row elements with all column elements
	for(var i =0;i<row;i++){
		arr = new Array();
		for(var j=0;j<col;j++){
			sum = 0;
			for(var k = 0;k<col;k++){
				sum += matA[i][k] * matB[k][j]
			}
			arr.push(sum);
		}
		matC.push(arr);
	}
	return matC;
}
function multMatrixVector(vector, matrix, row, col){
	if(!row)row = 4;
	if(!col)col = row;
	var sum = 0;
	var result = new Array();
	for(var i=0;i<row;i++){
		sum = 0;
		for(var j=0;j<col;j++){
			sum += matrix[i][j]*vector[j]
		}
		result.push(sum);
	}
	return result;
}
function Create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}
/*
	Function to read data from object '.asc' file
*/
function readData(evt, imageData){
	
	var fileName = evt.target.files[0]
	//var input = readFile(reader, evt.target.files[0]);//dataTransfer.files[0]);
	//alert(fileName)
	// If we use onloadend, we need to check the readyState.
    reader.onloadend = function onloadend(evt) {
    	return runCodeWithInput(evt, imageData);
    };
    reader.onloadstart=function(evt){
    }
    reader.onload=function(evt){
    }
    reader.readAsText(fileName)

	//return input;
}

function runCodeWithInput(evt, imageData){
	//alert('input file has been loaded')
	if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	    var input = evt.target.result;
	    
	    showData(input.split("\r"), imageData);
	}
}
/*
	trims data read from input file removing all white spaces
*/
function bSplit(val){
	var len = val.length;
	var arr = [];
	var start = 0;
	var i = '';
	for(i=0;i<len;i++){
		if(val[i]==' ' || val[i]=='\t' || val[i]=='\r'){
			if(start==i)
				start++;
			else{
				arr.push(val.substring(start,i));
				start = i+1;
			}
		}
	}
	arr.push(val.substring(start,i));
	//console.log(this.toString());
	if(len>1)
		return arr;
	return val;	
}
function showData(input, imageData){
	var inputItem = '';
	//var vertices = [];
	for(var inputIndex in input){
		inputItem = bSplit(input[inputIndex])
		if(inputItem.length<=2){
			if(inputItem[0]=='\nend')
				break;
			continue;
		}
		vertices.push(getVertex(inputItem));
	}
	if(!imageData)
		throw new AssertionFailed("imageData does not exist");
	renderData(imageData);
}
/*
	Function where Light, Camera, etc objects are formed
*/
function renderData(imageData, anim){	
	var data = getUserInputData();
	//identified global variables
	var Xs = 256;					//Xres
	var Ys = 256;					//Yres
	var Zmax = 333333333;
	var Cam = {X:{}, Y:{}, Z:{}}	//camera
	var worldMatrix = new Array();
	//end of global variables
	//calculated values from global variables
	
	//end of calculated values
	data.Light = [
					{pos:{x:-0.7071, y:0.7071, z:0},color:{r:0.5,g:0.5,b:0.9}},
					{pos:{x:0, y:-0.7071, z:-0.7071},color:{r:0.9,g:0.2,b:0.3}},//{0, -0.7071, -0.7071}, {0.9, 0.2, 0.3}
					{pos:{x:0.7071, y:0.0, z:-0.7071},color:{r:0.2,g:0.7,b:0.3}},//{0.7071, 0.0, -0.7071}, {0.2, 0.7, 0.3}	
				];	//{ {-0.7071, 0.7071, 0}, {0.5, 0.5, 0.9} };
	data.Ks = {r:0.3,g:0.3,b:0.3};
	data.Ka = {r:0.1,g:0.1,b:0.1};
	data.Kd = {r:0.7,g:0.7,b:0.7};
	data.s = 32;//specular coefficient
	data.La = {pos:{x:0, y:0, z:0},color:{r:0.3,g:0.3,b:0.3}}
	data.Zmax = Zmax;
	//data.shaderType = 'FLAT';//GOURAUD';//'FLAT'

	calculateWorldMatrix(worldMatrix, data)

	var FOV = data.FOV	//focal point
	var C = data.C;		//camera location
	var L = data.L;		//lookat
	var UP = data.UP;	//up_
	if(anim){
		FOV = data.FOV = anim.FOV?anim.FOV:data.FOV;
		//data.La.color.r = anim.FOV;
		//data.Light = anim.Light?anim.Light:data.Light;
		data.La = anim.La?anim.La:data.La;
		data.proceduralTexture = anim.proceduralTexture;
	}
	var d = 1/(tan(FOV/2));

	calculateCamera(Cam, C, L, UP)
	var Xsp = calculateXsp(Xs, Ys, Zmax, d);
	var Xpi = calculateXpi(d);
	var Xiw = calculateXiw(Cam, C)
	var Xwm = calculateXwm(worldMatrix) 


	var globalMatrix = new Array();
	globalMatrix.push(Xsp);
	globalMatrix.push(Xpi);

	var Xi = matrixMultiply(Xwm, Xiw);
	globalMatrix.push(Xi);
	// globalMatrix.push(Xiw)
	// globalMatrix.push(Xwm)

	//removing Scaling and translation from Xi
	
	var Xsm = calculateXsm(globalMatrix);

	Xi = normalizeXi(Xi);

	var newVertices = applyXForms(vertices, Xsm, Xi, data)

	showFinalImage(newVertices, imageData, data)
}
function normalizeXi(init){
	//cloning
	var Xi = [];
	for(var i=0;i<4;i++){
		Xi[i] = [];
		for(var j=0;j<4;j++){
			Xi[i][j] = init[i][j];
		}
	}
	//removing translation
	if(Xi[3][3]!=1){
		for(var i=0;i<3;i++){
			for(var j=0;j<3;j++){
				Xi[i][j] /= Xi[3][3];
			}
		}
	}
	for(var i=0;i<4;i++){
		Xi[i][3] = 0;
		Xi[3][i] = 0;
	}
	Xi[3][3] = 1;
	var K = '';
	
	//removing scaling
	for(var i=0;i<3;i++){		
		K = Math.sqrt(
				Math.pow(Xi[i][0],2)+
				Math.pow(Xi[i][1],2)+
				Math.pow(Xi[i][2],2)
			);
		if(K==0)console.log("AssertionFailed Error: 1/K == 1/0");
		K = K==0?1:(1/K);
		Xi[i][0] *= K;
		Xi[i][1] *= K;
		Xi[i][2] *= K;
	}
	return Xi;
}

function getUserInputData(){
	var data = {}
	var rotDir = ''
	data.defaultCamera = document.getElementById("camera")
	data.defaultCamera = data.defaultCamera?data.defaultCamera.checked:'';
	data.isTextureMapping = document.getElementById("texture")?document.getElementById("texture").checked:'';
	var rotRadio = document.getElementsByName("rotate")
	for(var i in rotRadio){
		if(rotRadio[i].checked)
			rotDir = rotRadio[i].value
	}	
	var rotDeg = document.getElementById("rotDeg");
	var tx = document.getElementById("tx")?document.getElementById("tx").value:0;
	var ty = document.getElementById("ty")?document.getElementById("ty").value:0;
	var tz = document.getElementById("tz")?document.getElementById("tz").value:0;
	var sx = document.getElementById("sx")?document.getElementById("sx").value:1;
	var sy = document.getElementById("sy")?document.getElementById("sy").value:1;
	var sz = document.getElementById("sz")?document.getElementById("sz").value:1;

	var shader = document.getElementsByName("shader")
	for(var i in shader){
		if(shader[i].checked)
			data.shaderType = shader[i].value
	}

	if(rotDir && rotDeg){
		data.rotDir = rotDir;
		data.rotDeg = rotDeg.value
	}
	data.tx = tx?tx:0;
	data.ty = ty?ty:0;
	data.tz = tz?tz:0;
	data.sx = sx?sx:1;
	data.sy = sy?sy:1;
	data.sz = sz?sz:1;
	data.wf = document.getElementById("wf")?document.getElementById("wf").checked:'';
	return data
}
function applyXForms(objectVertices, Xsm, Xi, data){
	//multiply all normals with Xi
	//calculate color for all vertices for the new normals

	var newVertices = new Array();
	var vertex = '';
	var newVertex = {};
	for(var index in objectVertices){
		vertex = multMatrixVector(
				//[[objectVertices[index].x,0,0,0],[0,objectVertices[index].y,0,0],[0,0,objectVertices[index].z,0],[1,1,1,1]], 
				[objectVertices[index].x, objectVertices[index].y, objectVertices[index].z, 1],
				Xsm
			)
		//Vertices from object space to camera space
		var newVertex = {};
		copyVertex(newVertex, objectVertices[index])
		newVertex.x = vertex[0]/vertex[3]
		newVertex.y = vertex[1]/vertex[3]
		newVertex.z = vertex[2]/vertex[3]

		vertex = multMatrixVector(
				[objectVertices[index].nx, objectVertices[index].ny, objectVertices[index].nz, 1],
				Xi	
			)
		//Normals from object space to camera space
		newVertex.nx = vertex[0]/vertex[3]
		newVertex.ny = vertex[1]/vertex[3]
		newVertex.nz = vertex[2]/vertex[3]

		var norm = Math.sqrt(Math.pow(newVertex.nx,2)+Math.pow(newVertex.ny,2)+Math.pow(newVertex.nz,2))
		newVertex.nx /= norm;
		newVertex.ny /= norm;
		newVertex.nz /= norm;

		//warping u,v to U,V
		newVertex.z_ = newVertex.z/(data.Zmax - newVertex.z);
		newVertex.U = newVertex.u/(newVertex.z_ + 1);
		newVertex.V = newVertex.v/(newVertex.z_ + 1)

		var N = {x:newVertex.nx, y:newVertex.ny, z:newVertex.nz}
		//var R = calculateReflection(N, data.Light)
		var Color = calculateColor(newVertex, N,data)
		newVertex.r = Color.r;
		newVertex.g = Color.g;
		newVertex.b = Color.b;
		// console.log(index +" "+newVertex.r +" "+newVertex.g+" "+newVertex.b)

		newVertices.push(newVertex)
	}
	return newVertices;
}
function calculateXwm(worldMatrix){
	var Xwm = computeMatrixStack(worldMatrix)
	return Xwm;
}
function calculateXsm(gMatrix){
	var Xsm = computeMatrixStack(gMatrix)
	return Xsm;
}
function calculateXiw(Cam, C){
	var Xiw = [
				[Cam.X.x, Cam.X.y, Cam.X.z, (-1)*dotProd(Cam.X,C)],
				[Cam.Y.x, Cam.Y.y, Cam.Y.z, (-1)*dotProd(Cam.Y,C)],
				[Cam.Z.x, Cam.Z.y, Cam.Z.z, (-1)*dotProd(Cam.Z,C)],
				[0,0,0,1]
			]
	return Xiw;
}
function calculateXpi(d){
	var Xpi = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,1/d,1]]
	return Xpi;
}
function calculateXsp(Xs, Ys, Zmax, d){
	var Xsp = [[Xs/2, 0, 0, Xs/2],[0,-Ys/2,0,Ys/2],[0,0,Zmax/d,0],[0,0,0,1]]
	return Xsp;
}
function calculateWorldMatrix(worldMatrix, data){
	var FOV = 	data.FOV?data.FOV: 			35;
	var C = 	data.C?data.C: 				{x:-10, y:5, z:-10};
	var L = 	data.L?data.L: 				{x:0, y:0, z:0};
	var UP = 	data.UP?data.UP: 			{x:0, y:1, z:0};
	
	showWireframe = data.wf
	if(!data.defaultCamera){
		//Rotating about x, y, z
		FOV=63.7;//53.7
		C = {x:-3, y:-25, z:-4};//{x:13.2, y:-8.7, z:-14.8}
		L = {x:7.8, y:0.7,z:6.5};//{x:0.8, y:0.7, z:4.5}
		UP = {x:-0.2, y:1.0, z:0}
	}

		worldMatrix.push(translate(data.tx,data.ty,data.tz))
		worldMatrix.push(scale(data.sx,data.sy,data.sz))
		switch(data.rotDir){
			case 'x':
				if(data.rotDeg)
					worldMatrix.push(rotateX(data.rotDeg))
				break;
			case 'y':
				if(data.rotDeg)
					worldMatrix.push(rotateY(data.rotDeg))
				break;
			case 'z':
				if(data.rotDeg)
					worldMatrix.push(rotateZ(data.rotDeg))
				break;
			default:
		}

		worldMatrix.push(
				[
					[3.25,	0.0,	0.0,	0.0],
					[0.0,	3.25,	0.0,	-3.25],
					[0.0,	0.0,	3.25,	3.5],
					[0.0,	0.0,	0.0,	1.0]
				]
			);
		worldMatrix.push(
				[
					[0.866,	0.0,	-0.5,	0.0],
					[0.0,	1.0,	0.0,	0.0],
					[0.5,	0.0,	0.866,	0.0],
					[0.0,	0.0,	0.0,	1.0]
				]
			);
		worldMatrix.push(
				[
					[1.0,	0.0,	0.0,	0.0],
					[0.0,	0.7071,	0.7071,	0.0],
					[0.0,	-0.7071,	0.7071,	0.0],
					[0.0,	0.0,	0.0,	1.0]
				]
			);
		data.FOV = FOV;
		data.C = C;
		data.L = L;
		data.UP = UP;

}
function displayMatrix(matrix, matrixName, row, col){
	if(!row)row = 4;
	if(!col)col = 4;
	var rowContent = '';
	console.log("Matrix being displayed is: "+matrixName)
	for(var i=0;i<row;i++){
		rowContent = '';
		for(var j=0;j<col;j++){
			rowContent +=matrix[i][j]+"\t"
		}
		console.log(rowContent)
	}
	console.log("END of Matrix: "+matrixName)
}
function radians(degrees){
	var pi = 3.14159
	return degrees*pi/180
}
function tan(theta){
	return Math.tan(radians(theta));
}
function calculateCamera(Cam, C, L, UP){
	var cl = Math.sqrt(Math.pow(L.x-C.x,2) + Math.pow(L.y-C.y,2) + Math.pow(L.z-C.z,2))
	Cam.Z = multVectorScalar(vectorSub(L,C), 1/cl)
	var up_ = vectorSub(UP, (multVectorScalar(Cam.Z,(dotProd(UP,Cam.Z)))))
	Cam.Y = multVectorScalar(up_, 1/(Math.sqrt(Math.pow(up_.x,2) + Math.pow(up_.y,2) + Math.pow(up_.z,2))))
	Cam.X = crossProd(Cam.Y, Cam.Z)
	console.log('calculating camera: cl>'+cl +" sqrt(16)>"+Math.sqrt(16))
}
function vectorSub(vector1, vector2){
	var newVector = {}
	newVector.x = vector1.x-vector2.x;
	newVector.y = vector1.y-vector2.y;
	newVector.z = vector1.z-vector2.z;
	return newVector;
}
function multVectorScalar(vector, scalar){
	var newVector = {}
	//VA: to change it to every generic property
	for(var prop in vector){
		if(vector.hasOwnProperty(prop))
			newVector[prop] = vector[prop]*scalar;
		/*newVector.x = vector.x*scalar;
		newVector.y = vector.y*scalar;
		newVector.z = vector.z*scalar;*/
	}
	return newVector;
}
function crossProd(vector1, vector2){
	var newVector = {};
	newVector.x = vector1.y*vector2.z - vector1.z*vector2.y
	newVector.y = vector1.z*vector2.x - vector1.x*vector2.z
	newVector.z = vector1.x*vector2.y - vector1.y*vector2.x
	return newVector
}
function dotProd(vector1, vector2){
	
	var dotProd = 1;
	dotProd = vector1.x*vector2.x + vector1.y*vector2.y + vector1.z*vector2.z;
	return dotProd;
}
function showFinalImage(vertices, imageData, data){
	var status =  document.getElementById('status');
	/* Code for antialiasing */
	var jitBox = {
		jitterX:0,
		jitterY:0,
		jitContent:
					[
						{	x:-0.52,	y:0.38,		i:0.128},
						{	x:0.41, 	y:0.56,		i:0.119},
						{	x:0.27, 	y:0.08,		i:0.294},
						{	x:-0.17, 	y:-0.29,	i:0.249},
						{	x:0.58, 	y:-0.55,	i:0.104},
						{	x:-0.31, 	y:-0.71,	i:0.106}
					]
	};
	var imageDataContent= new Array();
	var jitterX = '';
	var jitterY = '';
	for(var jitIndex = 0;jitIndex<jitBox.jitContent.length;jitIndex++){
		imageDataContent[jitIndex] = Create2DArray(parseInt(document.getElementById("canvas1").getAttribute("height")));
		jitterX = jitBox.jitContent[jitIndex].x;
		jitterY = jitBox.jitContent[jitIndex].y;
		intensity = jitBox.jitContent[jitIndex].i;
		data.intensity = intensity;
		document.getElementById('status2').innerHTML="Computing triangles!!!";
		for(var index in vertices){
			if(index%3==2){
				
				sortedVertices = [vertices[index-2], vertices[index-1], vertices[index-0]];//sortVertices(vertices[index-2], vertices[index-1], vertices[index-0])
				
				var newVertexA = {};
				var newVertexB = {};
				var newVertexC = {};

				copyVertex(newVertexA, sortedVertices[0]);
				copyVertex(newVertexB, sortedVertices[1]);
				copyVertex(newVertexC, sortedVertices[2]);
				newVertexA.x += jitterX;
				newVertexB.x += jitterX;
				newVertexC.x += jitterX;
				newVertexA.y += jitterY;
				newVertexB.y += jitterY;
				newVertexC.y += jitterY;
				
				drawTriangle(imageDataContent[jitIndex], newVertexA, newVertexB, newVertexC, data);
				if(showWireframe){
					document.getElementById('status2').innerHTML="Computing wireframe!!!";		
					var color = [255,255,0]
					drawLine(imageData, sortedVertices[2], sortedVertices[1], color)
					drawLine(imageData, sortedVertices[1], sortedVertices[0], color)
					drawLine(imageData, sortedVertices[0], sortedVertices[2], color)
				}			
			}
		}
			//showPixel(imageData, vertices[index]);
		status.innerHTML = index +" vertices rendered";
	}
	antiAlias(imageData, imageDataContent, jitBox);
	/* End of code for antialiasing */
	console.log('completed drawing triangle')	

	var element = document.getElementById("canvas1");
	var width = parseInt(element.getAttribute("width"));
	var height = parseInt(element.getAttribute("height"));
	imageDataFinal = c.createImageData(width, height);
	document.getElementById('status2').innerHTML="UPDATING CANVAS!!!";
	showPixelFinal(imageDataFinal, imageData, width, height);
	console.log("completed pixel rgb calculation")
	c.putImageData(imageDataFinal,0,0)
	document.getElementById('status2').innerHTML="RENDERING COMPLETE!!!";
}

function antiAlias(imageData, imageDataContent, jitBox){
	var len = jitBox?jitBox.jitContent.length:0; if(len!=imageDataContent.length) console.log("AssertionFailed antiAlias: imageDataContent size != jitter size");
	
	for(var jitIndex=0;jitIndex<len;jitIndex++){
		for(var i=0;i<imageDataContent[jitIndex].length;i++){			
			for(var j=0;j<imageDataContent[jitIndex][i].length;j++){
				if(imageData[i][j]){
					imageData[i][j].r += imageDataContent[jitIndex][i][j]?imageDataContent[jitIndex][i][j].r:0;
					imageData[i][j].g += imageDataContent[jitIndex][i][j]?imageDataContent[jitIndex][i][j].g:0;
					imageData[i][j].b += imageDataContent[jitIndex][i][j]?imageDataContent[jitIndex][i][j].b:0;
				}
				else{
					if(imageData[i].length>0){
						imageData[i][j] = imageDataContent[jitIndex][i][j];
					}
					else{
						imageData[i] = new Array();
						imageData[i][j] = imageDataContent[jitIndex][i][j];
					}
				}
			}
		}
	}
}

/*
	Sorting of the vertices is needed so function is not called
*/
function sortVertices(verticeA, verticeB, verticeC){
	var arr = [];
	var v1 = {};
	var v2 = {};
	var v3 = {};
	copyVertex(v1,verticeA)
	copyVertex(v2,verticeB)
	copyVertex(v3,verticeC)
	/*
		1. Identify least x vertex and that is v1. if x is same then highest y.
		2. Identify least y vertex in other 2. If same y then if more y than origin then max x else if less y than origin than least x. that is v2.
		3. biggest x and y is v3.
	*/
	if(v1.x<v2.x){
		if(v1.x<v3.x){//v1.x is smallest
			if(v2.y<v3.y)
				arr = [v1,v2,v3];
			else if(v3.y<v2.y)
				arr = [v1, v3, v2];
			else{ //v2.y==v3.y
				if(v2.y>v1.y){//origin is lesser
					if(v2.x>v3.x)
						arr=[v1,v2,v3]
					else
						arr=[v1,v3,v2]
				}
				else{//origin is more
					if(v2.x<v3.x)
						arr=[v1,v2,v3]
					else
						arr=[v1,v3,v2]
				}
			}
			return arr;
		}
		else if(v3.x<v1.x){//v3.x is smallest
			if(v2.y<v1.y)
				arr = [v3,v2,v1];
			else if(v1.y<v2.y)
				arr = [v3, v1, v2];
			else{ //v2.y==v1.y
				if(v2.y>v3.y){//origin is lesser
					if(v2.x>v1.x)
						arr=[v3,v2,v1]
					else
						arr=[v3,v1,v2]
				}
				else{//origin is more
					if(v2.x<v1.x)
						arr=[v3,v2,v1]
					else
						arr=[v3,v1,v2]
				}
			}
			return arr;
		}
		else{
			if(v1.y>v3.y)
				arr=[v1,v3,v2]
			else
				arr=[v3,v1,v2]
			return arr
		}
	}
	else{
		if(v2.x<v3.x){//v2.x is smallest
			if(v1.y<v3.y)
				arr = [v2,v1,v3];
			else if(v3.y<v1.y)
				arr = [v2, v3, v1];
			else if(v1.x>v3.x)
				arr=[v2,v1,v3]
			else
				arr=[v2,v3,v1]
			return arr;
		}
		else if(v3.x<v2.x){//v3.x is smallest
			if(v1.y<v2.y)
				arr = [v3,v1,v2];
			else if(v2.y<v1.y)
				arr = [v3, v2, v1];
			else if(v1.x>v2.x)
				arr=[v3,v1,v2]
			else
				arr=[v3,v2,v1]
			return arr;
		}
		else{
			if(v2.y>v3.y)
				arr=[v2,v3,v1]
			else
				arr=[v3,v2,v1]
			return arr
		}
	}

	console.log('ERROR:still running')
	return arr
}
/*
	Javascript does not provide function to duplicate an object. Hence this code.
*/
function copyVertex(dest, orig){
	dest.x = orig.x;
	dest.y = orig.y;
	dest.z = orig.z;
	dest.r = orig.r;
	dest.g = orig.g;
	dest.b = orig.b;
	dest.u = orig.u;
	dest.v = orig.v;
	dest.w = orig.w;
	dest.a = orig.a;
	dest.nx = orig.nx;
	dest.ny = orig.ny;
	dest.nz = orig.nz;
	dest.U = orig.U;
	dest.V = orig.V;
}
/*
	The method which does final rasterization and stores output in imageData.
	Light, Camera, etc are all stored in data object. To know more check getUserInputData()
*/
function drawTriangle(imageData, verticeA, verticeB, verticeC, data){
	//LEE Algorithm
	var m1 = ((verticeB.y-verticeA.y)/(verticeB.x-verticeA.x))
	var m2 = ((verticeC.y-verticeB.y)/(verticeC.x-verticeB.x))
	var m3 = ((verticeA.y-verticeC.y)/(verticeA.x-verticeC.x))

	var c1 = (m1==1/0||m1==-1/0)?verticeA.x:verticeA.y - verticeA.x*m1
	var c2 = (m2==1/0||m2==-1/0)?verticeB.x:verticeB.y - verticeB.x*m2
	var c3 = (m3==1/0||m3==-1/0)?verticeC.x:verticeC.y - verticeC.x*m3

	//calculating plane coeffcients A, B, C, D.
	var Edge1 = {}
	var Edge2 = {}
	var Plane = {}

	var color = [255,255,255]
	Edge1.nx = verticeB.x - verticeA.x;
	Edge1.ny = verticeB.y - verticeA.y;
	Edge1.nz = verticeB.z - verticeA.z;

	Edge2.nx = verticeC.x - verticeA.x;
	Edge2.ny = verticeC.y - verticeA.y;
	Edge2.nz = verticeC.z - verticeA.z;

	Plane.nx = (verticeB.y-verticeA.y)*(verticeC.z-verticeA.z) - (verticeC.y-verticeA.y)*(verticeB.z-verticeA.z)
	Plane.ny = (verticeB.z-verticeA.z)*(verticeC.x-verticeA.x) - (verticeC.z-verticeA.z)*(verticeB.x-verticeA.x)
	Plane.nz = (verticeB.x-verticeA.x)*(verticeC.y-verticeA.y) - (verticeC.x-verticeA.x)*(verticeB.y-verticeA.y)
	Plane.D = (-1)*(Plane.nx*verticeA.x + Plane.ny*verticeA.y + Plane.nz*verticeA.z)
	//console.log("m1:"+m1+"\tm2:"+m2+"\tm3:"+m3+"\tc1:"+c1+"\tc2:"+c2+"\tc3:"+c3)	
	data.Plane = Plane;
	//calculating bounding box
	var minX = verticeA.x<verticeB.x?(verticeA.x<verticeC.x?verticeA.x:verticeC.x):(verticeB.x<verticeC.x?verticeB.x:verticeC.x)
	var minY = verticeA.y<verticeB.y?(verticeA.y<verticeC.y?verticeA.y:verticeC.y):(verticeB.y<verticeC.y?verticeB.y:verticeC.y)
	var maxX = verticeA.x>verticeB.x?(verticeA.x>verticeC.x?verticeA.x:verticeC.x):(verticeB.x>verticeC.x?verticeB.x:verticeC.x)
	var maxY = verticeA.y>verticeB.y?(verticeA.y>verticeC.y?verticeA.y:verticeC.y):(verticeB.y>verticeC.y?verticeB.y:verticeC.y)
	minX = minX<0?0:minX
	minY = minY<0?0:minY

	minX = minX - minX%1;
	minY = minY - minY%1;

	maxX = maxX - maxX%1;
	maxY = maxY - maxY%1;
	maxX = maxX>256?256:maxX;
	maxY = maxY>256?256:maxY;

	var newVertex = '';

	if(data.shaderType=='FLAT')
				newVertex = calculateVertice(0,0,0,verticeA, verticeB, verticeC, data)

	//identifying conditions
	var cond1 = false
	var cond2 = false
	var cond3 = false
	for(var i = minX;i<=maxX;i++){
		for(var j=minY;j<=maxY;j++){
				{
					
					if(m1==1/0||(m1==-1/0)){
						if(verticeC.x>c1)
							cond1 = i>=c1
						else
							cond1 = i<=c1
					}
					else if(verticeC.y-m1*verticeC.x-c1>0)
						cond1 = j - m1*i - c1>=0
					else
						cond1 = j - m1*i -c1 <=0
				}

				{
					if(m2==1/0||(m2==-1/0)){
						if(verticeA.x>c2)
							cond2 = i>=c2
						else
							cond2 = i<=c2
					}
					else if(verticeA.y-m2*verticeA.x-c2>0)
						cond2 = j - m2*i - c2>=0
					else
						cond2 = j - m2*i -c2 <=0
				}

				{
					if(m3==1/0||(m3==-1/0)){
						if(verticeB.x>c3)
							cond3 = i>=c3
						else
							cond3 = i<=c3
					}
					else if(verticeB.y-m3*verticeB.x-c3>0)
						cond3 = j - m3*i - c3>=0
					else
						cond3 = j - m3*i -c3 <=0
				}

				if(cond1&&cond2&&cond3){
					var z = (-1)*(Plane.D+Plane.nx*i + Plane.ny*j)/Plane.nz
					if(data.shaderType!='FLAT'){
							newVertex = calculateVertice(i,j,z,verticeA, verticeB, verticeC, data)
					}
					else{
						newVertex.x = i;
						newVertex.y = j;
						newVertex.z = z;
					}
					
					showPixel(imageData, newVertex, false, data);
				}
		}
	}
	//for every pixel in bounding box, if y-mx-c<0 for all mi and ci then show pixel
}
function calculateVertice(i,j,z,verticeA,verticeB,verticeC,data){
	var vertex = {
					x: i,
					y: j,
					z: z,
					r: 255,
					g: 255,
					b: 255,
					nx: 0,
					ny: 0,
					nz: 0,
					u: verticeA.u,
					v: verticeA.v,
					a: 255

				}
	switch(data.shaderType){
		case "FLAT":
				//average nx,ny,nz for abc
				//calculate r
				//calculate color
				//set color values and normal values to the vertex
				//return
				//calculate max to b maximum magnitude
				//var max = data.Plane.nx>data.Plane.ny?(data.Plane.nx>data.Plane.nz?data.Plane.nx:data.Plane.nz):(data.Plane.y>data.Plane.nz?data.Plane.ny:data.Plane.nz) //.r>C.g ? (C.r> C.b?C.r:C.b) : (C.g>C.b?C.g:C.b);

				vertex.nx = 
								//((data.Plane.nx/max)+1)/2;
								 eval(verticeA.nx+"+"+verticeB.nx+"+"+verticeC.nx)/3
				vertex.ny = 
								//((data.Plane.ny/max)+1)/2;
								 eval(verticeA.ny+"+"+verticeB.ny+"+"+verticeC.ny)/3
				vertex.nz = 
								//((data.Plane.nz/max)+1)/2;
								 eval(verticeA.nz+"+"+verticeB.nz+"+"+verticeC.nz)/3
				var N = {x:vertex.nx, y:vertex.ny, z:vertex.nz}
				//var R = calculateReflection(N, data.Light)
				var Color = calculateColor(vertex, N,data)
				vertex.r = Color.r
				vertex.g = Color.g
				vertex.b = Color.b
			break;
		case "GOURAUD":
					var lambda = baryExtra(verticeA, verticeB, verticeC, vertex, data.shaderType, false);
					var alpha = lambda.alpha;
					var beta = lambda.beta;
					var gamma = lambda.gamma;
					if(alpha>=0 && beta>=0 && gamma>=0 && alpha<=1 && beta <=1 && gamma <=1)
					{						
						//interpolating U,V,Z
						vertex.U = alpha*verticeA.U + beta*verticeB.U + gamma*verticeC.U;
						vertex.V = alpha*verticeA.V + beta*verticeB.V + gamma*verticeC.V;
						vertex.z = alpha*verticeA.z + beta*verticeB.z + gamma*verticeC.z;						

						//unwarping U,V
						var z_ = vertex.z/(data.Zmax-vertex.z);
						vertex.u = vertex.U*(z_+1);
						vertex.v = vertex.V*(z_+1);

					if(data.isTextureMapping){//if you checked the texturize button
							if(textureData && !data.isAnimationOn){//if textureData was loaded externally && animation is off
								var item = computeTexture(vertex.u,vertex.v);
								if(!item)
									console.log("AssertionFailed no texture computed")
								var C = item.Color;
								//console.log("C color:r:"+C.r+" g:"+C.g+" b:"+C.b);
								var colorA = colorSummission(verticeA, C,C,C);
								var colorB = colorSummission(verticeB, C,C,C);
								var colorC = colorSummission(verticeC, C,C,C);
								var color = {};
								color.r = (alpha*colorA.r + beta*colorB.r + gamma*colorC.r)*255;
								color.g = (alpha*colorA.g + beta*colorB.g + gamma*colorC.g)*255;
								color.b = (alpha*colorA.b + beta*colorB.b + gamma*colorC.b)*255;

								console.log("Vertice color:r:"+color.r+" g:"+color.g+" b:"+color.b);
								vertex.r = (color.r);
								vertex.g = (color.g);
								vertex.b = (color.b);
							}
							else{//performing procedural texture
								var color = proceduralTexture(vertex.u, vertex.v, data);
								vertex.r = color.Color.r;
								vertex.g = color.Color.g;
								vertex.b = color.Color.b;
							}
						}
						else{
							//color needs to be calculated... HW4 mechanism of color computation
							vertex.r = (alpha*verticeA.r + beta*verticeB.r + gamma*verticeC.r)*255;
							vertex.g = (alpha*verticeA.g + beta*verticeB.g + gamma*verticeC.g)*255;
							vertex.b = (alpha*verticeA.b + beta*verticeB.b + gamma*verticeC.b)*255;
							//console.log("Control comes here with values being r:"+vertex.r+" g:"+vertex.g+" b:"+vertex.b)
						}						
					}
			break;
		case "PHONG":
				var lambda = baryExtra(verticeA, verticeB, verticeC, vertex, data.shaderType);
					var alpha = lambda.alpha;
					var beta = lambda.beta;
					var gamma = lambda.gamma;
					if(alpha>=0 && beta>=0 && gamma>=0 && alpha<=1 && beta <=1 && gamma <=1)
					{
						//interpolating U,V,Z

						vertex.U = alpha*verticeA.U + beta*verticeB.U + gamma*verticeC.U;
						vertex.V = alpha*verticeA.V + beta*verticeB.V + gamma*verticeC.V;
						vertex.z = alpha*verticeA.z + beta*verticeB.z + gamma*verticeC.z;						

						//unwarping U,V
						var z_ = vertex.z/(data.Zmax-vertex.z);
						vertex.u = vertex.U*(z_+1);
						vertex.v = vertex.V*(z_+1);

						vertex.nx = alpha*verticeA.nx + beta*verticeB.nx + gamma*verticeC.nx;
						vertex.ny = alpha*verticeA.ny + beta*verticeB.ny + gamma*verticeC.ny;
						vertex.nz = alpha*verticeA.nz + beta*verticeB.nz + gamma*verticeC.nz;
						if(data.isTextureMapping){//if you checked the texturize button
							if(textureData && !data.isAnimationOn){//if textureData was loaded externally && animation is off
							
								//u, v should be between 0 and 1
								vertex.u = vertex.u<0?0:vertex.u;
								vertex.u = vertex.u>1?1:vertex.u;
								vertex.v = vertex.v<0?0:vertex.v;
								vertex.v = vertex.v>1?1:vertex.v;
								var item = computeTexture(vertex.u,vertex.v);
								var N = {x:vertex.nx, y:vertex.ny, z:vertex.nz}
								//console.log("Color KA:r:"+item.Color.r+" g:"+item.Color.g+" b:"+item.Color.b);
								var C = item.Color;
								// var max = C.r>C.g ? (C.r> C.b?C.r:C.b) : (C.g>C.b?C.g:C.b);
								// C.r /= max;
								// C.g /= max;
								// C.b /= max;
								var color = calculateColor(vertex, N,data,C, C);			
								//console.log("Vertice color:r:"+color.r+" g:"+color.g+" b:"+color.b);
								vertex.r = color.r*255;
								vertex.g = color.g*255;
								vertex.b = color.b*255;
							}
							else{//performing procedural texture
								var color = proceduralTexture(vertex.u, vertex.v, data);
								vertex.r = color.Color.r;
								vertex.g = color.Color.g;
								vertex.b = color.Color.b;
							}
						}
						else{
							//color needs to be calculated... HW4 mechanism of color computation							
							var norm = Math.sqrt(Math.pow(vertex.nx,2)+Math.pow(vertex.ny,2)+Math.pow(vertex.nz,2));
							var N = {x:vertex.nx/norm, y:vertex.ny/norm, z:vertex.nz/norm}
							var Color = calculateColor(vertex, N,data)
							vertex.r = Color.r*255;
							vertex.g = Color.g*255;
							vertex.b = Color.b*255;
						}
					}
			break;
	}
	return vertex
}
function baryExtra(v1,v2,v3,pixel, type){
	var x = pixel.x;
	var y = pixel.y;
	var x1 = v1.x;
	var x2 = v2.x;
	var x3 = v3.x;
	var y1=  v1.y;
	var y2 = v2.y;
	var y3 = v3.y;
	return barryLerp(x1,y1,x2,y2,x3,y3,x,y);
}
function barryLerp(x1,y1,x2,y2,x3,y3,x,y){
	var alpha = ((y2-y3)*(x-x3)+(x3-x2)*(y-y3))/((y2-y3)*(x1-x3)+(x3-x2)*(y1-y3));
	var beta =  ((y3-y1)*(x-x3)+(x1-x3)*(y-y3))/((y2-y3)*(x1-x3)+(x3-x2)*(y1-y3));
	var gamma = 1-alpha-beta;
	return {
		'alpha':alpha,
		'beta':beta,
		'gamma':gamma
	}
}
function lerpG(v1, v2, v3, pixel){
	var x1 = lerp(v1,v2,pixel);	
	var x2 = lerp(v1,v3,pixel);	
	var p = lerp(x1,x2,pixel);

	//'GOURAUD'
	x1.r = x1.f * v2.r + (1-x1.f)*v1.r;
	x1.g = x1.f * v2.g + (1-x1.f)*v1.g;
	x1.b = x1.f * v2.b + (1-x1.f)*v1.b;

	x2.r = x2.f * v3.r + (1-x2.f)*v1.r;
	x2.g = x2.f * v3.g + (1-x2.f)*v1.g;
	x2.b = x2.f * v3.b + (1-x2.f)*v1.b;

	if(p.x!=pixel.x || p.y!=pixel.y)
		console.log('AssertionFailed Error: some calculation mistake in lerpG');
	pixel.r = p.f * x1.r + (1-p.f)*x2.r;
	pixel.g = p.f * x1.g + (1-p.f)*x2.g;
	pixel.b = p.f * x1.b + (1-p.f)*x2.b;
}

function lerp(v1, v2, p){
	var x = p.x;
	var y = p.y;
	var f = 1;
	var flag = 0;
	if(v1.x==p.x && p.y==v2.y){
		flag = 0.1;
	}
	else if(v1.y==p.y && v2.x==p.x){
		flag = -0.1;
	}
	x += flag;
	if(((v1.x > x) && (x > v2.x))||((v1.x<x)&&(x<v2.x))){
		var m = ((v1.y-v2.y)/(v1.x-v2.x));
		if(v1.x==v2.x){
			alert('test1');
		}
		var c = (v1.y - m*v1.x);
		y = m* (x-flag) + c;
		if(v2.y==v1.y){
			f = (x-v1.x)/(v2.x-v1.x);
		}
		else
			f = (y-v1.y)/(v2.y-v1.y);
	}
	else if(((v1.y > y)&& (y > v2.y))||((v1.y<y)&&(y<v2.y))){		
		var m = ((v1.y-v2.y)/(v1.x-v2.x));
		if(v1.x==v2.x){
			x = v1.x;
			f = (y-v1.y)/(v2.y-v1.y);
		}
		else{
			var c = (v1.y - m*v1.x);
			if(m==0){
				x = v1.y;
			}
			else
				x = (y-c)/m;	
			if(v2.x==v1.x){
				f = (y-v1.y)/(v2.y-v1.y);
			}
			else
				f = (x-v1.x)/(v2.x-v1.x);
		}
	}
	else{
		//the vertices themselves

		console.log("AssertionFailed ERROR: in lerp calculation a strange case occurred");
	}
	x -= flag;
	return {'f':f, 'x':x, 'y':y};
}
function lerpF(verticeA, verticeB, pixel, opt){
	var denom = Math.sqrt(Math.pow(verticeA.y-verticeB.y,2)+Math.pow(verticeA.x-verticeB.x,2));
	var num   = Math.sqrt(Math.pow(pixel.y-verticeA.y,2)+Math.pow(pixel.x-verticeA.x,2));
	var f = denom!=0?num/denom:0;
	if(denom==0){console.log("Assertion Fail ERROR: in lerpF denom==0.")}
	var vertex = {};
	vertex.r = verticeA.r*(1-f) + verticeB.r*f;
	vertex.g = verticeA.g*(1-f) + verticeB.g*f;
	vertex.b = verticeA.b*(1-f) + verticeB.b*f;
	var mn = verticeA.y - verticeB.y
	var md = verticeA.x - verticeB.x
	if(md==0){
		if(opt=='x'){
			vertex.x = verticeA.x;
			vertex.y = pixel.y;
			return vertex;
		}
		else{
			vertex.y = f*(verticeA.y-verticeB.y)+verticeB.y;
			vertex.x = pixel.x;
			return vertex;
		}
	}
	if(mn==0){
		if(opt=='y'){
			vertex.y = verticeA.y;
			vertex.x = pixel.x;
			return vertex;
		}
		else{
			vertex.x = f*(verticeA.x - verticeB.x)+verticeB.x;
			vertex.y = pixel.y;
			return vertex;
		}
	}
	var m = mn/md;
	switch(opt){
		case 'x':
			vertex.y = pixel.y;
			vertex.x = (pixel.y - verticeA.y + m*verticeA.x)/m;//calculate x;
			break;
		case 'y':
			vertex.x = pixel.x;
			vertex.y = m*(pixel.x - verticeA.x) + verticeA.y;//calculate y;
			break;
	}
	return vertex;
}
function calculateColor(vertex, N,data, Ka, Kd){
	Ks = data.Ks
	Kd = Kd?Kd:data.Kd
	Ka = Ka?Ka:data.Ka
	var s = data.s
	var E = {x:0, y:0, z:-1};
	var L = data.Light
	var specular = {r:0,g:0,b:0};
	var diffuse = {r:0,g:0,b:0};
	var ambient = {r:0,g:0,b:0};
	var temp = '';
	var nDotL = '';
	var rDotE = '';
	var nDotE = '';
	var R = [];//calculateReflection(N,data.Light);
	//make sure L is normalized :NOTE
	var N1 = '';
	for(var index in L){
		nDotL = dotProd(N,multVectorScalar(L[index].pos,-1));
		nDotE = dotProd(N,multVectorScalar(E,-1));
		N1 = N;
		//rDotE = dotProd(R[index],multVectorScalar(E,-1));
		if(nDotL<0 && nDotE<0){
			// nDotL *= -1;
			// rDotE *= -1;

			N1 = multVectorScalar(N, -1);		
			nDotL = dotProd(N1,multVectorScalar(L[index].pos,-1));
			//R[index] = calculateReflection(N1,data.Light)[index];
			//rDotE = dotProd(R[index],multVectorScalar(E,-1));
		}
		else if(nDotL*nDotE<0){
			continue;
		}
		R[index] = /*vectorSub(multVectorScalar(N1, 2*nDotL), data.Light[index].pos);*/calculateReflection(N1,[data.Light[index]])[0];
		rDotE = dotProd(R[index],multVectorScalar(E,1));
		rDotE = rDotE<0?0 : rDotE>1?1:rDotE;
		temp =  multVectorScalar(L[index].color, Math.pow(rDotE,s));
		specular.r += temp.r;
		specular.g += temp.g;
		specular.b += temp.b;
		temp =  multVectorScalar(L[index].color, nDotL);
		diffuse.r += temp.r;
		diffuse.g += temp.g;
		diffuse.b += temp.b;		
	}

	temp = data.La.color
	ambient.r += temp.r;
	ambient.g += temp.g;
	ambient.b += temp.b;

	vertex.specular = specular;
	vertex.diffuse = diffuse;
	vertex.ambient = ambient;

	return colorSummission({specular:specular, diffuse:diffuse, ambient:ambient}, Ka, Kd, Ks);
}
function colorSummission(vertex, Ka, Kd, Ks){
	var C = {
		r : Ks.r*vertex.specular.r + Kd.r*vertex.diffuse.r+Ka.r*vertex.ambient.r,
		g : Ks.g*vertex.specular.g + Kd.g*vertex.diffuse.g+Ka.g*vertex.ambient.g ,
		b : Ks.b*vertex.specular.b + Kd.b*vertex.diffuse.b+Ka.b*vertex.ambient.b 
	}
	//console.log("colorSummission r:"+C.r+" g:"+C.g+" b:"+C.b)
	C.r = C.r<0?-1*C.r:C.r
	C.g = C.g<0?-1*C.g:C.g;
	C.b = C.b<0?(-1*C.b):C.b;
	return C;
}
function calculateReflection(N,Lights){
	//2N(N.L)-L
	var nl = '';
	var L = '';	
	var R = new Array();
	for(var index in Lights){
		L =  Lights[index].pos;//multVectorScalar(Lights[index].pos,-1);
		nl = dotProd(N,L)
		nl = multVectorScalar(N,2*nl)
		R.push(vectorSub(nl,L))
	}
	return R
}
function round(num){
	return num-num%1;
}
/*
	Function used to draw wireframe by drawing line between two vertices with mentioned color. Can be ignored in beginning.
*/
function drawLine(imageData, startVertexOrig, endVertexOrig, color){
	var startVertex = {};
	var endVertex = {};
	copyVertex(startVertex,startVertexOrig)
	copyVertex(endVertex,endVertexOrig)
	if(startVertex.x>endVertex.x){
		var temp = startVertex;
		startVertex = endVertex;
		endVertex = temp;
	}
	var x0=startVertex.x;
	var y0=startVertex.y;
	var x1=endVertex.x;
	var y1=endVertex.y;
	var yInc=1;
	
	
	var dx = x1-x0;
	var dy = y1-y0;
	var d = 2*dy-dx;
	var delE=2*dy;
	var delNE=2*(dy-dx)
	var m = dy/dx;
	var flag=false;

	if(m>=0&&m<1){}
	else if(m>=1){
		//console.log('dx,dy swapped')
		flag=true;
		dx=dx+dy;dy=dx-dy;dx=dx-dy;
		//x0=x0+y0;y0=x0-y0;x0=x0-y0;
		//x1=x1+y1;y1=x1-y1;x1=x1-y1;
	}
	else if(m<0&&m>-1){
		yInc=-1
		dy=-dy;
	}
	else if(m<=-1){
		yInc=-1
		//console.log('dx,dy swapped here')
		flag=true
		dy=-dy
		dx=dx+dy;dy=dx-dy;dx=dx-dy;

	}

	d = (2*dy-dx)
	delE=2*dy
	delNE=2*(dy-dx)
	m=dy/dx;
	
	var newVertex = startVertex
	newVertex.x=round(x0)
	newVertex.y=round(y0)
	newVertex.z = round(startVertex.z<endVertex.z?startVertex.z:endVertex.z)//(startVertex.z + endVertex.z)/2
	newVertex.nx = startVertex.nx
	newVertex.ny = startVertex.ny
	newVertex.nz = startVertex.nz
	newVertex.r = color[0];
	newVertex.g = color[1];
	newVertex.b = color[2];

	showPixel(imageData,newVertex)
	if(!flag){//m<1 && m>-1){
		while(newVertex.x<=x1){
			if(d<=0){
				d+=delE
				newVertex.x=newVertex.x+1
			}
			else{
				d+=delNE
				newVertex.x=newVertex.x+1
				newVertex.y=(newVertex.y+yInc)
			}
			if(m>0)
				showPixel(imageData,newVertex)
			else
				showPixel(imageData,newVertex,false)
		}
	}
	else{
		if(y1>y0){
			while(newVertex.y<=y1){
				if(d<=0){
					d+=delE
					newVertex.y=newVertex.y+yInc
				}
				else{
					d+=delNE
					newVertex.y=newVertex.y+yInc
					newVertex.x=newVertex.x+1
				}
				showPixel(imageData,newVertex,false)
			}
		}
		else{
			while(newVertex.y>=y1){
				if(d<=0){
					d+=delE
					newVertex.y=newVertex.y+yInc
				}
				else{
					d+=delNE
					newVertex.y=newVertex.y+yInc
					newVertex.x=(newVertex.x+1)
				}
				showPixel(imageData,newVertex,false)
			}
		}
	}
}
function showPixel(imageData, input, show, data){
	var x = input.x;
	var y = input.y;
	var z = input.z;
	var r = data.intensity?data.intensity*input.r:input.r;
	var g = data.intensity?data.intensity*input.g:input.g;
	var b = data.intensity?data.intensity*input.b:input.b;
	var a = 255;//input.a;
	var marginLeft=0;
	var i =x;
	var j = y;
	var u =input.u;
	var v = input.v;
	var marginTop=0;
	input.r = r;
	input.g = g;
	input.b = b;
	if(x<0 || y<0 || x>256 || y>256)
		return;
	if(z==-1/0 || z==1/0)
		return;
	/*var index=(x+marginLeft+(y+marginTop)*imageData.width)*4;*/
	if(show)
		console.log(x+" "+y+" "+" "+r+" "+g+" "+b+" "+"<BR>");
	
	if(imageData[x]&&imageData[x][y]){
		if(imageData[x][y].z>=z){
			imageData[x][y] = input;			
		}
		else{
				// if((i==81&&j==231)||(i==84&&j==230)||(i==84&&j==229)||(i==84&&j==231)||(i==85&&j==227)||(i==85&&j==228)||(i==85&&j==229)||(i==85&&j==230)||(i==85&&j==231))
				// 		console.log(i+" "+j+" NOT printed")
		}
	}
	else{
		if(imageData[x]){
			imageData[x][y] = input;
			// if((i==81&&j==231)||(i==84&&j==230)||(i==84&&j==229)||(i==84&&j==231)||(i==85&&j==227)||(i==85&&j==228)||(i==85&&j==229)||(i==85&&j==230)||(i==85&&j==231))
			// 				console.log(i+" "+j+" Printed")
		}
		else{
			imageData[x] = new Array();
			imageData[x][y] = input;
		}
	}
}
/*
	Function to compute procedural texture on its own.
*/
function proceduralTexture(u, v, data){
	var opr = "+";//data.proceduralTexture.operator?data.proceduralTexture.operator:"+"
	var Color = {};
	var noiser = 0, noiseg = 0, noiseb = 0;
	if(data.isNoiseOn)
		noiser = noiseg = noiseb = noise(u,v,data);
	var u_ = parseInt(u*10);
	var v_ = parseInt(v*10);
	if(data.proceduralTexture){
		switch(data.proceduralTexture.operator){
			case "%":
				Color = {
					r: eval(2*u+opr+(1-u))+noiser,
					g: eval((1-u)+opr+2*v)+noiseg,
					b: eval(2*u+opr+2*v)+noiseb
				};
				break;
			case "-":
				Color = {
					r: (u_%2==0&&v_%2==0)==0?u:v,
					g: (u_%2!=0&&v_%2!=0)==0?u:v,
					b: 0.5,
				};
				Color.b = Color.r==Color.g?u:v;
				if(Color.r==Color.g){
					Color.b=Color.g = Color.r=0.9;
				}
				break;
			case "*":
				Color = {
					r: (u_%2==0&&v_%2==0)==0?u:v,
					g: 0,
					b: 0,
				};
				break;
			case "+":
					Color = {
						// r: (u+v)/2,//eval(Math.sin(u*u*3.14))+noiser,
						// g: (u>0.1&&u<0.9)&&(v>0.1&&v<0.9)?(u+v)/2:0,//Math.sin(v*v*3.14),//0,//eval(v)+noiseg,
						// b: (u>0.4&&u<0.8)&&(v>0.4&&v<0.8)?(u+v)/2:0//(Math.cos(u*3.14)+Math.cos(v*3.14))/2,//eval((2-u-v)/2)+noiseb
						r: Math.sin(u>v?u:v),
						g: Math.sin(u<v?u:v),//(u_%2!=0&&v_%2!=0)==0?u:v,
						b: 0,
					};
				break;
		}
	}
	else{
			Color = {
					// r: (u+v)/2,//eval(Math.sin(u*u*3.14))+noiser,
					// g: (u>0.1&&u<0.9)&&(v>0.1&&v<0.9)?(u+v)/2:0,//Math.sin(v*v*3.14),//0,//eval(v)+noiseg,
					// b: (u>0.4&&u<0.8)&&(v>0.4&&v<0.8)?(u+v)/2:0//(Math.cos(u*3.14)+Math.cos(v*3.14))/2,//eval((2-u-v)/2)+noiseb
					r: (u_%2==0&&v_%2==0)==0?u:v,
					g: (u_%2!=0&&v_%2!=0)==0?u:v,
					b: 0.5,
				};
				Color.b = Color.r==Color.g?u:v;
				if(Color.r==Color.g){
					Color.b=Color.g = Color.r=0.9;
			}
		// Color.b = Color.r==Color.g?u:v;
		// if(Color.r==Color.g){
		// 	Color.b=Color.g = Color.r=0.9;
		// }
	}
	Color.r += noiser;
	Color.g += noiseg;
	Color.b += noiseb;
	console.log("u_:"+u_+" g:"+Color.g+" b:"+Color.b);
	Color.r = (Color.r<0?((Color.r+1)/2):(Color.r>1?1:Color.r))*255;
	Color.g = (Color.g<0?0:(Color.g>1?1:Color.g))*255;
	Color.b = (Color.b<0?0:(Color.b>1?1:Color.b))*255;
	return {Color:Color};
}
function colorCheck(Color){
	//for every property
	//if property < 0.. do this.
	//if property > 1.. do this

}
/*
	Attempt to add perlin noise but it needs to be fixed.
*/
function noise(u,v,data){
	var a = 1;
	var b = 2;
	return noise1D(a,b,u)+noise1D(a,b,v);
}
function noise1D(a,b,x){
	var ft = x * 3.1415927;
	var f = Math.cos(ft);
	if(f<0.5) f = Math.cos(ft)/2;
	return  (a*(1-f) + b*f -1);
}
function rand1D(x){
		x = (x<<13) ^ x;
	  return ( 1.0 - ( (x * (x * x * 15731 + 789221) + 1376312589) /*& 7fffffff*/) / 1073741824.0);
	//return Math.sin(x)
}
/*
	End of Perlin Noise attempt
*/
/*
	Function which computes texture based on input file referred.
*/
function computeTexture(u, v){
	//if texture map is loaded then use it else return as it is.
	if(!textureData){//and texturing is to be done.
		console.log("ALERT: CODE TO BE MODIFIED:Performing Procedural Texture")
		return;// {Color:{r:0,g:0,b:0}};// proceduralTexture(u, v);
	}
	//1. warp u,v of vertices 			/
	//2. interpolate u,v,z of pixel 	/
	//3. unwarp u,v of pixel using new z 	/
	//4. scale u,v 						/
	//5. identify color 				/
	//6. use the color for shading 		

	//texture lookup
	//scale u,v to texture image size (Xsize, Ysize);
	//interpolating u,v part 1 i.e. scaling
	//interpolate u,v,z
	//unwarp using new interpolated vz
	//using unwarp u,v width,height

	//color = ka, kd

	var U = u*(textureData.width-1);
	var V = v*(textureData.height-1);
	var s = U%1;
	var t = V%1;
	var Color = {};
	var a = U-U%1;
	var b = V-V%1;
	var j = (U!==U%1)?eval(U-U%1+1):U<1?1:U;
	var i = (V!==V%1)?eval(V-V%1+1):V<1?1:V;
	//var width = eval(U-U%1);
	/*
		0.123
		0.998
		1.001
		1.999
		97.999
	*/
	i = i>=textureData.height?eval(textureData.height):i;
	j = j>=textureData.width?eval(textureData.width):j;
	//switching height and width
	// height = height+width;
	// width = height-width;
	// height = height-width;
	//interpolating part 2 i.e. interpolating colors
	if(j==0||i==0){
		console.log("->s:"+s+" t:"+t+"U:"+U+" V:"+V+" i:"+i+" j:"+j+" V%1:"+eval(V%1)+" V!=V%1:"+eval(V!=V%1));
		// console.log(textureData.matrix[height][width]);
		// console.log(textureData.matrix[height-1][width]);
		// console.log(textureData.matrix[height][width-1]);
		// console.log(textureData.matrix[height-1][width-1]);
	}
	//Testing code in false... should not be required.
	if(false){
		console.log("a:"+a+" b:"+b);
		if(a>=textureData.height-1) a = textureData.height-2;
		if(b>=textureData.width-1) b = textureData.width-2;
		var cond2 = b<textureData.width-1;
		var cond1 = a<textureData.height-1;
		var cond3 = (b<textureData.width-1||a<textureData.height-1);
		Color.r = (cond3?s*t*textureData.matrix[a+1][b+1].r:0) + (cond1?(1-s)*t*textureData.matrix[a+1][b].r:0) + (cond2?s*(1-t)*textureData.matrix[a][b+1].r:0) + (true?(1-s)*(1-t)*textureData.matrix[a][b].r:0);
		Color.g = (cond3?s*t*textureData.matrix[a+1][b+1].g:0) + (cond1?(1-s)*t*textureData.matrix[a+1][b].g:0) + (cond2?s*(1-t)*textureData.matrix[a][b+1].g:0) + (true?(1-s)*(1-t)*textureData.matrix[a][b].g:0);
		Color.b = (cond3?s*t*textureData.matrix[a+1][b+1].b:0) + (cond1?(1-s)*t*textureData.matrix[a+1][b].b:0) + (cond2?s*(1-t)*textureData.matrix[a][b+1].b:0) + (true?(1-s)*(1-t)*textureData.matrix[a][b].b:0);		
	}
	else{
		Color.r = s*t*textureData.matrix[i][j].r + (i>0?(1-s)*t*textureData.matrix[i][j-1].r:0) + (j>0?s*(1-t)*textureData.matrix[i-1][j].r:0) + (i>0&&j>0?(1-s)*(1-t)*textureData.matrix[i-1][j-1].r:0);
		Color.g = s*t*textureData.matrix[i][j].g + (i>0?(1-s)*t*textureData.matrix[i][j-1].g:0) + (j>0?s*(1-t)*textureData.matrix[i-1][j].g:0) + (i>0&&j>0?(1-s)*(1-t)*textureData.matrix[i-1][j-1].g:0);
		Color.b = s*t*textureData.matrix[i][j].b + (i>0?(1-s)*t*textureData.matrix[i][j-1].b:0) + (j>0?s*(1-t)*textureData.matrix[i-1][j].b:0) + (i>0&&j>0?(1-s)*(1-t)*textureData.matrix[i-1][j-1].b:0);
		if(Color.r==NaN || Color.g==NaN || Color.b==NaN)
			console.log("AssertionFailed ERROR!!! s:"+s+" t:"+t+"U:"+U+" V:"+V+" i:"+i+" j:"+j+" r:"+Color.r+" g:"+Color.g+" b:"+Color.b);
	}
	return {Color:Color};
	//interpolate image pixel colors to texture coord
		//interpolate color at scaled u,v location (flat coords) in texture image.
			//reconstruct texture image color at sample point
}
function readTextureFile(){
	console.log("readTextureFile")
	//var file = fopen("proc-tex.ppm");
	//var file_length = flength(file);
	//var content = fread(file, file_length);
	//alert(content);	
}
function loadTextureFile(){
	loadFile();
}
function bodyAppend(a,b){
	console.log(b);
}
function loadFile() {
        var input, file, fr;

        if (typeof window.FileReader !== 'function') {
            bodyAppend("p", "The file API isn't supported on this browser yet.");
            return;
        }

        input = document.getElementById('tfile');
        if (!input) {
            bodyAppend("p", "Um, couldn't find the fileinput element.");
        }
        else if (!input.files) {
            bodyAppend("p", "This browser doesn't seem to support the `files` property of file inputs.");
        }
        else if (!input.files[0]) {
            bodyAppend("p", "Please select a file before clicking 'Load'");
        }
        else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedBinary;
            fr.readAsBinaryString(file);
        }

        function receivedText() {
            showResult(fr, "Text");

            fr = new FileReader();
            fr.onload = receivedBinary;
            fr.readAsBinaryString(file);
        }

        function receivedBinary() {
            updateTextureData(fr, "Binary");
        }
}

    function updateTextureData(fr, label) {
        var markup, result, n, aByte, byteStr;

        markup = [];
        result = fr.result;
        var InfoLength = 0;
        var info = [];
        var count=0;
        var completeInfo = [];
        for(var n=0;count!=4;n++){
        	aByte = result.charAt(n);
        	if(aByte=='\n'){
        		count++;
        		completeInfo.push(info.join(""));
        		info=[];        		
        	}
        	else{
            	info.push(aByte);
        	}
        	InfoLength++;
        	//console.log(aByte);
        }
        //console.log("*****************");
        for (n = InfoLength; n < result.length; ++n) {        	
            aByte = result.charCodeAt(n);
            byteStr = aByte.toString(16);
            
            if (byteStr.length < 2) {
                byteStr = "0" + byteStr;
            }
            markup.push(eval(parseInt(byteStr,16)/255));
        }        
        textureData = {};
        //bodyAppend("p", label + " (" + result.length + "):");
        textureData.width = parseInt(completeInfo[1],10);
        textureData.height = parseInt(completeInfo[2],10);
        textureData.range = parseInt(completeInfo[3],10);
        textureData.matrix = change1Dto2D(markup);
        //console.log("textureData.width = "+textureData.width+" textureData.height = "+textureData.height);
    }
   function change1Dto2D(markup){
   	var matrix = new Array();
   	var i=-1, j=textureData.width;
   		for(var index in markup){
   			if(j==textureData.width){
   				i++;
   				matrix[i]=new Array();
   				j = 0;
   			}
   			if(index%3==0){
   				matrix[i][j] = {
   					r:markup[index], 
   					g:markup[eval(index+"+"+1)], 
   					b:markup[eval(index+"+"+2)]
   				};
   				if(matrix[i][j].g==null||matrix[i][j].b==null){
   					console.log("Assertion ERROR i:"+i+" j:"+j+" index:"+index+" +1:"+eval(index+1));
   				}
   				j++;
   			}
   		}
   		if(i>textureData.height||j>textureData.width){
   			console.log("AssertionFailed Error: Texture map has more values then indicated on top of document.")
   		}
   		return matrix;
   }


function runCodeWithTxtInput(evt, imageData){
	//alert('input file has been loaded')
	if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	    var input = evt.target.result;
	    console.log(input);
	    //showData(input.split("\r"), imageData);
	}
}
function include(pURL) {
    if (window.XMLHttpRequest) { // code for Mozilla, Safari, ** And Now IE 7 **, etc 
        xmlhttp=new XMLHttpRequest();
    } else if (window.ActiveXObject) { //IE 
        xmlhttp=new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof(xmlhttp)=='object') {
        xmlhttp.onreadystatechange=postFileReady;
        xmlhttp.open('GET', pURL, true);
        xmlhttp.onload = loadFileReady;
        xmlhttp.send(null);
    }
}
/*
	Function to simplify the stack of Xsp, Xpi, Xiw, Xwm by multiplying them in order
*/
function computeMatrixStack(matrix){
	do{
		var matA = matrix.pop();
		var matB = matrix.pop();
		if(matA  && matB)
			matrix.push(matrixMultiply(matA, matB))
		else if(matA)
			matrix.push(matA)
		else
			break;
	}while(matB)
	//the function returns one matrix after popping out all of them and multiplying each with all.
	if(matrix.length<1)
		matrix.push([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]])
	return matrix.pop();
}
/*
	Function ultimately puts the pixel in imageData space. Equivalent to setPixel or the basic last level function.
*/
function showPixelFinal(imageDataFinal, imageData, MAX_X, MAX_Y){
	var index = '';
	var marginLeft=0;
	var marginTop=0;
	for(var i=0;i<MAX_X;i++){
		for(var j= 0;j<MAX_Y;j++){
			if(imageData[i][j]){				
				index=(i+marginLeft+(j+marginTop)*MAX_X)*4;
				//console.log(imageData[i][j].x+" "+imageData[i][j].y+" "+index+" "+imageData[i][j].r+" "+imageData[i][j].g+" "+imageData[i][j].b+" "+"<BR>");
				imageDataFinal.data[index+0] = imageData[i][j].r;
				imageDataFinal.data[index+1] = imageData[i][j].g;
				imageDataFinal.data[index+2] = imageData[i][j].b;
				imageDataFinal.data[index+3] = imageData[i][j].a;
			}
		}
	}
}

function getVertex(inputItem){
		if(inputItem.length>1){
			return validateVertex({
				x: parseFloat(inputItem[0]),
				y: parseFloat(inputItem[1]),
				z: parseFloat(inputItem[2]),
				r: 255,//parseInt(inputItem[3]),
				g: 0,//parseInt(inputItem[4]),
				b: 0,//parseInt(inputItem[5]),
				nx: inputItem[3],
				ny: inputItem[4],
				nz: inputItem[5],
				u: parseFloat(inputItem[6]),
				v: parseFloat(inputItem[7]),
				a: 255
			});
		}
		else{
			//assertion: inputItem[index]==='triangle'
			throw new AssertionFailed("inputItem.length <= 1:"+inputItem.length);
		}
}
function validateVertex(vertex){
	var element = document.getElementById("canvas1");
	var screenHeight = parseInt(element.getAttribute("height"));
	var screenWidth = parseInt(element.getAttribute("width"));
	return vertex;
	/*
	//x,y,z >=0
	vertex.x = vertex.x<0?0:vertex.x;
	vertex.y = vertex.y<0?0:vertex.y;
	vertex.z = vertex.z<0?0:vertex.z;

	//x,y <= max range.
	vertex.x = vertex.x>screenWidth?screenWidth:vertex.x;
	vertex.y = vertex.y>screenHeight?screenHeight:vertex.y;
	*/
	//Testing
	if(false){
		vertex.x = vertex.x - vertex.x%1;
		vertex.y = vertex.y - vertex.y%1;
		vertex.z = vertex.z - vertex.z%1;
		return vertex;
	}
	
	//z should lie between lower and upper clipping section

	//color should lie between 0 and 255.

	/*
	var max = vertex.r>vertex.g?(vertex.r>vertex.b?vertex.r:vertex.b):(vertex.g>vertex.b?vertex.g:vertex.b)
	max = max==0?1:max;
	vertex.r = 255*vertex.r/max
	vertex.g = 255*vertex.g/max
	vertex.b = 255*vertex.b/max
	vertex.r = (vertex.r<0?0:vertex.r)/1;
	vertex.g = (vertex.g<0?0:vertex.g)/1;
	vertex.b = (vertex.b<0?0:vertex.b)/1;
	vertex.r -= vertex.r%1;
	vertex.g -= vertex.g%1;
	vertex.b -= vertex.b%1;
	*/


	
}
function AssertionFailed(message){
	this.message=message;
	this.name="AssertionFailed";
}
function showMousePosition(event){
	var canvas = document.getElementById('canvas1')
	var i = eval(event.x+"-"+canvas.offsetLeft)
	var j = eval(event.y+"-"+canvas.offsetTop)
	var index=(i+j*canvas.width)*4;
	//alert(imageDataFinal)
	alert("x:"+i+", y:"+j+", r:"+imageDataFinal.data[index]+", g:"+imageDataFinal.data[index+1]+", b:"+imageDataFinal.data[index+2])
}
function shade2(norm)
{
	if(!norm){
		//console.log('hahahaha shade2')
		return [255,255,255]
	}
  var light = [];
  var coef;
  var color = [];

  light[0] = 0.707;
  light[1] = 0.5;
  light[2] = 0.5;

  coef = light[0]*norm[0] + light[1]*norm[1] + light[2]*norm[2];
  if (coef < 0) 	coef *= -1;

  if (coef > 1.0)	coef = 1.0;
  color[0] = coef*0.95*255;
  color[1] = coef*0.65*255;
  color[2] = coef*0.88*255;
  //console.log(color[0]+" "+color[1]+" "+color[2])
  return color;
}
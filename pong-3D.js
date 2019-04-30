var stepX = 0.15;
var stepY = 0.25;

var postLeftBorder = -10;
var posRigthBorder = 10;
var paddleLong = 4;
var cpuLong = 4;
var ballSize = 1;

var paddlePoints = 0;
var cpuPoints = 0;
var start = false;


function init() {
   var scene = new THREE.Scene();
   var sceneWidth = window.innerWidth;
   var sceneHeight = window.innerHeight;

   var camera = new THREE.PerspectiveCamera(90, sceneWidth / sceneHeight, 0.01, 100);
   camera.position.set(0, -15, 15);
   camera.lookAt(scene.position);

   var renderer = new THREE.WebGLRenderer({
      antialias : true
   });

   renderer.shadowMap.enabled = true;
   renderer.setSize(sceneWidth, sceneHeight);
   document.body.appendChild(renderer.domElement);

   var light = getLight();
   var leftBorder = getBorder("left", 1, 20, 3, postLeftBorder, 0, 1.5);
   var rightBorder = getBorder("right", 1, 20, 3, posRigthBorder, 0, 1.5);
   var topBorder = getBorder("top", cpuLong, 1, 2, 0, 9.5, 1);
   var downBorder = getBorder("down", paddleLong, 1, 2, 0, -9.5, 1);
   var sphere = getSphere();
   var floor = getFloor();

   scene.add(light);
   scene.add(leftBorder);
   scene.add(rightBorder);
   scene.add(topBorder);
   scene.add(downBorder);
   scene.add(sphere);
   scene.add(floor);

   var borders = [ leftBorder, rightBorder, topBorder, downBorder ];

   animate(sphere, borders, renderer, scene, camera);

}

function move_paddle(paddle){
    window.onkeydown = (p) => {
        p.preventDefault();
        switch (p.key) {
            case 'ArrowLeft':
                 if (paddle.position.x >= -7 ){
                     paddle.position.x -= 0.35;
                 }
                 break;
             case 'ArrowRight':
                 if (paddle.position.x <= 7){
                     paddle.position.x += 0.35;
                 }
                 break;
             case ' ':
                start = true;
                break;
             default:
                 break;
         }
     };
 }

 function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
 }

 function move_CPU(cpu, ball){
    cpu.position.x = ball.position.x * 0.5;
    if (cpu.position.x >= 7){
        cpu.position.x = 7;
    }
    if (cpu.position.x <= -7){
        cpu.position.x = -7;
    }
 }

function animate(sphere, borders, renderer, scene, camera) {
   checkCollision(sphere, borders);
   checkGoal(sphere);

   if(start){
       sphere.position.x += stepX;
       sphere.position.y += stepY;
   }

   paddle = borders[3];
   move_paddle(paddle);

   cpu = borders[2];
   move_CPU(cpu, sphere);

   renderer.render(scene, camera);

   requestAnimationFrame(function() {
      animate(sphere, borders, renderer, scene, camera);
   });
}

function getLight() {
   var light = new THREE.DirectionalLight();
   light.position.set(5, 5, 5);
   light.castShadow = true;
   light.shadow.camera.near = -10;
   light.shadow.camera.far = 20;
   light.shadow.camera.left = -20;
   light.shadow.camera.right = 20;
   light.shadow.camera.top = 15;
   light.shadow.camera.bottom = -15;
   light.shadow.mapSize.width = 4096;
   light.shadow.mapSize.height = 4096;
   return light;
}

function getSphere() {
   var geometry = new THREE.SphereGeometry(ballSize, 20, 20);
   var material = new THREE.MeshNormalMaterial();
   var mesh = new THREE.Mesh(geometry, getMaterial('ball'));
   mesh.position.z = 1;
   mesh.castShadow = true;
   mesh.name = "sphere";

   return mesh;
}

function getFloor() {
   var geometry = new THREE.PlaneGeometry(20, 20);
   var mesh = new THREE.Mesh(geometry, getMaterial('floor'));
   mesh.receiveShadow = true;

   return mesh;
}

function getBorder(name, x, y, z, posX, posY, posZ) {
   var geometry = new THREE.BoxGeometry(x, y, z);

   if (name == "top" || name == "down"){
     var mesh = new THREE.Mesh(geometry, getMaterial('paddle'));
   } else {
     var mesh = new THREE.Mesh(geometry, getMaterial('border'));
   }

   mesh.receiveShadow = true;
   mesh.position.set(posX, posY, posZ);
   mesh.name = name;

   return mesh;
}

function getMaterial(type) {
   if (type == 'paddle'){
     var texture = new THREE.TextureLoader().load("textures/wood.png");
   } else if (type == 'floor') {
     var texture = new THREE.TextureLoader().load("textures/floor.jpg");
   } else if (type == 'ball') {
     var texture = new THREE.TextureLoader().load("textures/ball.jpg");
   } else if (type == 'border') {
     var texture = new THREE.TextureLoader().load("textures/brick.jpg");
   }

   var material = new THREE.MeshPhysicalMaterial({
      map : texture
   });
   material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;

   if (type == 'paddle'){
     material.map.repeat.set(3, 3);
   } else if (type == 'border') {
     material.map.repeat.set(1, 5);
   } else {
     material.map.repeat.set(1, 1);
   }

   material.side = THREE.DoubleSideb;

   return material;
}

function checkCollision(ball, borders) {
    var left_border = borders[0];
    var right_border = borders[1];
    var cpu = borders[2];
    var paddle = borders[3];


    if (ball.position.x >= (posRigthBorder - ballSize) || ball.position.x <= (postLeftBorder + ballSize)){
        stepX *= -1;
    }

    if ((ball.position.y + ballSize) <= cpu.position.y && (ball.position.y + ballSize) >= cpu.position.y){
        if (ball.position.x + ballSize >= (cpu.position.x - cpuLong/2)  &&  ball.position.x -  ballSize <= (cpu.position.x + cpuLong/2)) {
            stepY *= -1;
        }
    }

    if ((ball.position.y - ballSize) >= paddle.position.y && (ball.position.y - ballSize) <= paddle.position.y ){
        if (ball.position.x + ballSize >= (paddle.position.x - paddleLong/2) && ball.position.x - ballSize  <= (paddle.position.x + paddleLong/2)){
            stepY *= -1;
        }
    }
 }

 function checkGoal(ball){
     if (ball.position.y < -10){
         ball.position.x = 0;
         ball.position.y = 0;
         stepX = -stepX;
         stepY = -stepY;
         cpuPoints += 1;
     }

     if (ball.position.y > 10){
         ball.position.x = 0;
          ball.position.y = 0;
         stepX = -stepX;
         stepY = -stepY;
         paddlePoints += 1;
     }

     if (paddlePoints > 4 || cpuPoints > 4){
         cpuPoints = 0;
         paddlePoints = 0;
         start = false;
     }

     document.getElementById("scores").innerHTML = (cpuPoints + '-' + paddlePoints);

 }

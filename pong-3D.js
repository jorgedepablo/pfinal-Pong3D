var stepX = 0.15;
var stepY = 0.25;

function init() {
   var scene = new THREE.Scene();
   var sceneWidth = window.innerWidth;
   var sceneHeight = window.innerHeight;

   var camera = new THREE.PerspectiveCamera(90, sceneWidth / sceneHeight, 0.01, 100);
   camera.position.set(0, -10, 15);
   camera.lookAt(scene.position);

   var renderer = new THREE.WebGLRenderer({
      antialias : true
   });
   renderer.shadowMap.enabled = true;
   renderer.setSize(sceneWidth, sceneHeight);
   document.body.appendChild(renderer.domElement);

   var light = getLight();
   var leftBorder = getBorder("left", 1, 20, 3, -10, 0, 0);
   var rightBorder = getBorder("right", 1, 20, 3, 10, 0, 0);
   var topBorder = getBorder("top", 4, 1, 3, 0, 10, 0);
   var downBorder = getBorder("down", 4, 1, 3, 0, -9.5, 0);
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
                 paddle.position.x -= 0.80;
                 break;
             case 'ArrowRight':
                 paddle.position.x += 0.80;
                 break;
             default:
                 break;
         }
     };
 }

 function move_CPU(cpu, ball){
     cpu.position.x = ball.position.x;
 }

function animate(sphere, borders, renderer, scene, camera) {
   checkCollision(sphere, borders);

   sphere.position.x += stepX;
   sphere.position.y += stepY;

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
   light.position.set(4, 4, 4);
   light.castShadow = true;
   light.shadow.camera.near = 0;
   light.shadow.camera.far = 16;
   light.shadow.camera.left = -8;
   light.shadow.camera.right = 5;
   light.shadow.camera.top = 10;
   light.shadow.camera.bottom = -10;
   light.shadow.mapSize.width = 4096;
   light.shadow.mapSize.height = 4096;
   return light;
}

function getSphere() {
   var geometry = new THREE.SphereGeometry(1, 20, 20);
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
    left_border = borders[0];
    right_border = borders[1];
    cpu = borders[2];
    paddle = borders[3];

    if (ball.position.x >= (10 - 1) || ball.position.x <= (-10 + 1)){
        stepX *= -1;
    }

    if ((ball.position.y + 1) <= cpu.position.y && (ball.position.y + 1) >= cpu.position.y){
        console.log(ball.position.x, cpu.position.x);
        if (ball.position.x >= (cpu.position.x - 4/2)  &&  ball.position.x  <= (cpu.position.x + 4/2)) {
            stepY *= -1;
        }
    }

    if ((ball.position.y - 1) >= paddle.position.y && (ball.position.y - 1) <= paddle.position.y ){
        if (ball.position.x >= (paddle.position.x - 4/2) && ball.position.x <= (paddle.position.x + 4/2)){
            stepY *= -1;
        }
    }

 }

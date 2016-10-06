var videoFile="/assets/sample.mp4";
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);
//WebVR Boilerplate
var controls = new THREE.VRControls(camera);
controls.standing = true;
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);
var manager = new WebVRManager(renderer, effect);

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);

var btn = document.querySelector('button');
btn.disabled = true;

var audio = new Audio();
var video = document.createElement('video');
var canvas = document.createElement('canvas');
canvas.width = 1280;
canvas.height = 640;
var ctx = canvas.getContext('2d');
var togglePlay;
var ua = navigator.userAgent;
var mode = 'none';

if(/(iPhone|iPod)/.test(ua)) { // iPhoneでvideoをインライン再生
    //ctx.scale(0.5,0.5);
    var prms1 = new Promise(function(resolve, reject) {
        video.addEventListener('canplay',function(){
            resolve();
        });
        video.addEventListener('error',function(){
            reject();
            alert('failed loading video');
        });
    });
    var prms2 = new Promise(function(resolve, reject) {
        audio.addEventListener('canplay',function(){
            resolve();
        });
        audio.addEventListener('error',function(){
            reject();
            alert('failed loading audio');
        });
    });
    Promise.all([prms1,prms2]).then(function(){
        btn.disabled = false;
        mode = 'currentTime';
        makeSkybox();
    });
    video.src = videoFile;
    video.load();
    audio.src = videoFile;
    audio.load();

    togglePlay = function(){
      if(audio.paused){
        audio.play();
      } else {
        audio.pause();
      }
    };
} else { // Androidなどは素直にVideoタグで再生
    //video.style.display = 'block';
    video.src = videoFile;
    video.load();
    video.addEventListener('canplay',function(){
      btn.disabled = false;
      mode = 'defaultPlay';
      makeSkybox();
    },false);
    video.addEventListener('error',function(){
        alert('failed loading video');
    });

    togglePlay = function(){
      if(video.paused){
        video.play();
      } else {
        video.pause();
      }
    };
}
btn.addEventListener('click',togglePlay);

//生成したcanvasをtextureとしてTHREE.Textureオブジェクトを生成
var videoTexture = new THREE.Texture(canvas);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

//生成したtextureをmapに指定し、overdrawをtureにしてマテリアルを生成
var sky;
function makeSkybox(){
  var material = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true, side:THREE.DoubleSide});
  var geometry = new THREE.SphereGeometry( 500, 20, 20 );
  geometry.scale( - 1, 1, 1 );
  sky = new THREE.Mesh( geometry, material );
  scene.add( sky );
}

function render() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    //videoImageContext.drawImage(video, 0, 0);
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }

    if(mode == "currentTime")video.currentTime = audio.currentTime;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(render);
  controls.update();//step1 control

  // renderer.render(scene, camera);
  manager.render(scene, camera);//step3
}
render();

function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// load javascript after the page is fully loaded
window.addEventListener('load', function() {main();}, false);

var canvas = Object;
var ctx = Object;

function VideoCamera(video) {
  video.onloadedmetadata = function(e) {
    video.play();
  }
}

function ImageProcessing (video) {
  var delay = 1000; // ms
  timer = setInterval(
    function () {
      ctx.drawImage(video, 0, 0, 640, 480);
    }, delay);
  }

function setup() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext('2d');

  // chrome requires special configuration see http://www.html5rocks.com/en/tutorials/getusermedia/intro/
  navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia;
}

function main() {
  setup();
  if (navigator.getUserMedia) {
    // navigator.getUserMedia(constraints, successCallback, errorCallback);
    var constraints = {audio: false, video: true };
    navigator.getUserMedia(constraints,
      function(stream) {
        var video = document.querySelector('video');
        video.src = window.URL.createObjectURL(stream);
        VideoCamera(video);
        ImageProcessing(video);
      },
      function(err) {
        console.log("The following error occured: " + err.name);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}

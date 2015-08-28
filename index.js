// load javascript after the page is fully loaded
window.addEventListener('load', function() {main();}, false);

var display = Object;

function DisplayVideo(video) {
  video.onloadedmetadata = function(e) {
    video.play();
  }
}

function DisplayCanvas (video) {
  var delay = 0; // ms
  timer = setInterval(
    function () {
      // display is a canvas context
      display.drawImage(video, 0, 0, 640, 480);
      data = display.getImageData(0,0,640,480);
      idata = ImageProcessing(data);
      display.putImageData(idata,0,0);
      DisplayOverlay();
    }, delay);
  }

function DisplayOverlay () {
  display.circle([200,200], 30);
}
function ImageProcessing (idata) {

  //var idata = display.getImageData(0,0,width,height);
  var data = idata.data;
    // Loop through the pixels, turning them grayscale
    for(var i = 0; i < data.length; i+=4) {
        var r = data[i];
        var g = data[i+1];
        var b = data[i+2];
        var brightness = (3*r+4*g+b)>>>3;
        data[i] = brightness;
        data[i+1] = brightness;
        data[i+2] = brightness;
    }
    idata.data = data;
    return idata;
    // Draw the pixels onto the visible canvas
    //display.putImageData(idata,0,0);
}

function setup() {
  display = new Canvas(document.getElementById("canvas"));

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
        DisplayVideo(video);
        DisplayCanvas(video);
      },
      function(err) {
        console.log("The following error occured: " + err.name);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}

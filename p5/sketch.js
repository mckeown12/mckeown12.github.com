
let carrier; // this is the oscillator we will hear
let modulator; // this oscillator will modulate the frequency of the carrier
let analyzer; // we'll use this visualize the waveform

// the carrier frequency pre-modulation
let carrierBaseFreq = 220;

// min/max ranges for modulator
let modMaxFreq = 112;
let modMinFreq = 0;
let modMaxDepth = 150;
let modMinDepth = -150;

let modFreq = 1.0;
let modDepth = 100.0;

let cnv;


function initAudio(){
  console.log("here")
  carrier.start(); // start oscillating
  modulator.start();
  cnv.canvas.removeEventListener("click", initAudio);
}

function windowResized(){
  resizeCanvas(windowWidth*.8, windowWidth*.4);
}

function setup() {
  navigator.requestMIDIAccess({sysex:false}).then((access) => {
    for (let input of access.inputs.values()) {
      input.onmidimessage = ({ data, data: [status, channel, value] }) => {
        if(status != 176) return;

        console.log(data);
        if (channel == 14){
          value *= ((440*2)/127);
          carrierBaseFreq = value;
          carrier.freq(carrierBaseFreq)
        }
        else if (channel == 15){
          value *= 0.9;
          modFreq = value;
          modulator.freq(modFreq);
        }

      }
    }
  });


  let s=1;
  cnv = createCanvas(windowWidth*.8, windowWidth*.4);
  cnv.window
  noFill();

  carrier = new p5.Oscillator('sine');
  carrier.amp(0); // set amplitude
  carrier.freq(carrierBaseFreq); // set frequency

  // try changing the type to 'square', 'sine' or 'triangle'
  modulator = new p5.Oscillator('sine');

  // add the modulator's output to modulate the carrier's frequency
  modulator.disconnect();
  carrier.freq(modulator);

  // create an FFT to analyze the audio
  analyzer = new p5.FFT();

  cnv.canvas.addEventListener("click", initAudio);

  // fade carrier in/out on mouseover / touch start
  toggleAudio(cnv);
}



function draw() {
  background(30);

  // map mouseY to modulator freq between a maximum and minimum frequency
  // modFreq = map(mouseY, height, 0, modMinFreq, modMaxFreq);
  // modulator.freq(modFreq);

  // change the amplitude of the modulator
  // negative amp reverses the sawtooth waveform, and sounds percussive
  //
  // modDepth = map(mouseX, 0, width, modMinDepth, modMaxDepth);
  modulator.amp(modDepth);

  // analyze the waveform
  waveform = analyzer.waveform();

  // draw the shape of the waveform
  stroke(255);
  strokeWeight(10);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, -height / 2, height / 2);
    vertex(x, y + height / 2);
  }
  endShape();

  strokeWeight(1);
  // add a note about what's happening
  text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
  text(
    'Modulator Amplitude (Modulation Depth): ' + modDepth.toFixed(3),
    20,
    40
  );
  text(
    'Carrier Frequency (pre-modulation): ' + carrierBaseFreq + ' Hz',
    width / 2,
    20
  );
}

// helper function to toggle sound
function toggleAudio(cnv) {
  t = 0.1
  cnv.mouseOver(function() {
    carrier.amp(1.0, t);
  });

  cnv.touchStarted(function() {
    carrier.amp(1.0, t);
  });
  
  cnv.mouseOut(function() {
    carrier.amp(0.0, t);
  });

  // cnv.mouseWheel(function(event){
  //   carrierBaseFreq += event.deltaY;
  //   carrier.freq(carrierBaseFreq)
  //   event.preventDefault();
  // });
}

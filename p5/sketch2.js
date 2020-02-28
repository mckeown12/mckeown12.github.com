
let carrierWaves = [];
let modulatorWaves = [];

// midi channels on the midi controller.
let masterChannel = 2;
let carrierAmpChannels = [3, 5, 8, 12];
let carrierFreqChannels = [15, 17, 19, 21];
let modulatorAmpChannels = [4, 6, 9, 13];
let modulatorFreqChannels = [16, 18, 20, 22];


let analyzers = []; // we'll use this visualize the waveform
let cnv;

function initAudio() {
	console.log("here");
	for(let c of carrierWaves){
		c.start();
	}

	for(let [i,m] of modulatorWaves.entries()){
		m.start();
		m.disconnect();
		carrierWaves[i].freq(m);
	}

	cnv.canvas.removeEventListener("click", initAudio);
}

function windowResized() {
	resizeCanvas(windowWidth * .8, windowWidth * .4);
}

function setup() {
	// initialize carrier and modulator waves
	for(let i=0; i<4; i++){
		let m = new p5.Oscillator("sine");
		m.freq(0);
		m.amp(0);

		let c = new p5.Oscillator("sine");
		c.freq(0);
		c.amp(0);
		
		carrierWaves.push(c);
		modulatorWaves.push(m);
	}

	if(carrierWaves.length != carrierAmpChannels.length){
		console.log(`carrierWaves has length ${carrierWaves.length}, but carrierAmpChannels has length ${carrierAmpChannels.length}!`);
	}

	if(modulatorWaves.length != modulatorAmpChannels.length){
		console.log(`modulatorWaves has length ${modulatorWaves.length}, but modulatorAmpChannels has length ${modulatorAmpChannels.length}!`);
	}

	navigator.requestMIDIAccess({ sysex: false }).then((access) => {
		for (let input of access.inputs.values()) {
			input.onmidimessage = ({ data, data: [status, channel, value] }) => {
				// console.log(data);

				if(modulatorAmpChannels.includes(channel)){
					let index = modulatorAmpChannels.indexOf(channel);
					let wave = modulatorWaves[index];
					wave.amp(value);
				}

				else if(carrierAmpChannels.includes(channel)){
					let index = carrierAmpChannels.indexOf(channel);
					let wave = carrierWaves[index];
					wave.amp(value / 100);
				}
				
				else if(modulatorFreqChannels.includes(channel)){
					let index = modulatorFreqChannels.indexOf(channel);
					let wave = modulatorWaves[index];
					wave.freq(value);
				}
				
				else if(carrierFreqChannels.includes(channel)){
					let index = carrierFreqChannels.indexOf(channel);
					let wave = carrierWaves[index];
					wave.freq(value*8);
				}
			}
		}
	});

	cnv = createCanvas(windowWidth * .8, windowWidth * .4);
	analyzer = new p5.FFT();
	cnv.canvas.addEventListener("click", initAudio);
}



function draw() {
	background(30);

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
}
//
//  filter.js
//  ExplorableExplanations
//
//  Created by Bret Victor on 3/10/11.
//  (c) 2011 Bret Victor.  MIT open-source license.
//

function initFilterExample (tangle) {

	var container = $("filterExample");

	// this is ugly, because we have two separate sets of parameters, one for each plot,
	// but we're re-using the dynamic labels for both.  If we did the right thing and
	// had separate labels for each filter, it would be much cleaner.
	
	var script = {

		initialize: function (model) {
			model.fs = 44100;  model.index = 1;
			model.isAudioEnabled = false;  model.isAudioPlaying = false;
			model.fc1 = 2000;  model.q1 = 0.8;
			model.fc2 = 1200;  model.q2 = 3.5;
		},
		
		update: function (model) {
			var i = model.index;
			var fc = model['fc' + i];
			var q  = model['q' + i];
			
			// filter coefficients

			model.kf = 2 * Math.sin(Math.PI * fc / model.fs);
			model.kq = 1 / q;

			// transfer function coefficients

			model.b0 = model.kf * model.kf;
			model.a1 = -2 + model.kf * (model.kf + model.kq);
			model.a1neg = -model.a1;
			model.a2 = 1 - (model.kf * model.kq);

			// solve for poles in terms of z^-1
			
			var a1 = model.a1;
			var a2 = model.a2;
		
			var root1Real, root1Imag, root2Real, root2Imag;
			var real = -a1 / (2 * a2);
			var disc = a1*a1 - 4*a2;
		
			if (a2 == 0) {
				root1Real = root2Real = -1 / a1;
				root1Imag = root2Imag = 0;
			}
			else if (disc < 0) {
				root1Real = root2Real = real;
				root1Imag = Math.sqrt(-disc) / (2 * a2);
				root2Imag = -root1Imag;
			}
			else {
				root1Real = real + Math.sqrt(disc) / (2 * a2);
				root2Real = real - Math.sqrt(disc) / (2 * a2);
				root1Imag = root2Imag = 0;
			}
			
			// take recipricol to get z
			
			model.pole1Real =  root1Real / (root1Real * root1Real + root1Imag * root1Imag);
			model.pole1Imag = -root1Imag / (root1Real * root1Real + root1Imag * root1Imag);
			model.pole2Real =  root2Real / (root2Real * root2Real + root2Imag * root2Imag);
			model.pole2Imag = -root2Imag / (root2Real * root2Real + root2Imag * root2Imag);

			// stable
			
			model.pole1Inside = (model.pole1Real * model.pole1Real + model.pole1Imag * model.pole1Imag) < 1;
			model.pole2Inside = (model.pole2Real * model.pole2Real + model.pole2Imag * model.pole2Imag) < 1;
			model.unstable = !model.pole1Inside || !model.pole2Inside;

			// update indexed variables

			model['kf' + i] = model.kf;
			model['kq' + i] = model.kq;
			model['unstable' + i] = model.unstable;
		},
	};
	
    var worksheet = tangle.addWorksheet("filter", container, script);
    worksheet.setValue("index", 2);
    
    initAudioEnabledSwitch(worksheet);
}

function initAudioEnabledSwitch (worksheet) {
	var onUrl = "Media/FilterRockOn.png";
	var offUrl = "Media/FilterRockOff.png";
	
	(new Image()).src = onUrl;  // preload
	(new Image()).src = offUrl;

    function toggleAudioEnabled () {
    	var isAudioEnabled = !worksheet.getValue("isAudioEnabled");
    	worksheet.setValue("isAudioEnabled", isAudioEnabled);
    	$("filterAudioSwitch").setStyle("backgroundImage", "url(" + (isAudioEnabled ? onUrl : offUrl) + ")");
    }
    
	$("filterAudioSwitch").addEvent("mousedown", toggleAudioEnabled);
    $("filterAudioSwitch").addEvent("touchstart", toggleAudioEnabled);
}



//----------------------------------------------------------
//
//  Two-pole no-zero lowpass with (mostly) independent Fc and Q
//  controls.  Efficient implementation, but can be unstable at
//  higher frequencies.
// 
//  A simplified digital adaptation of the analog state variable
//  filter, described in Hal Chamberlin's "Musical Applications
//  of Microprocessors."
// 
//                         Kf^2 * z^-1
//    H(z) = --------------------------------------------
//           1 - (2 - Kf*(Kf+Kq))*z^-1 + (1 - Kf*Kq)*z^-2
// 
//    Kq = 1/Q   (Q > 0.5)
// 
//    Kf = 2 * sin(pi*Fc/Fs)  (Approximately.  It becomes exact
//                             as Q approaches infinity.)
// 
//    Kf is approximately 2*pi * Fc/Fs for smallish Fc.
//
//    Topology:                 [bp]               [lp]
//
//    in --->(+)--(kf)--->(+)----.---(kf)--(+)--->[z^-1]---> out
//            ^            ^     v          ^        |
//           (+)<--(-kq)---'--[z^-1]        '--------|
//            ^                                      |
//            '----(-1)------------------------------'

function chamberlinResponse (kf,kq,N,x) {
	if (!N) { N = 512; }
	
	var output = [];
	var lp = 0, bp = 0, input = 1;
	
	for (var i = 0; i < N; i++) {
		bp += kf * (input - lp - kq*bp);
		lp += kf * bp;
		output[i] = lp;
		input = x;
	}

	return output;
}

function chamberlinImpulseResponse (kf,kq,N) {
	return chamberlinResponse(kf,kq,N,0);
}

function chamberlinStepResponse (kf,kq,N) {
	return chamberlinResponse(kf,kq,N,1);
}


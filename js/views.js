//
//  views.js
//  ExplorableExplanations
//
//  Created by Bret Victor on 3/10/11.
//  (c) 2011 Bret Victor.  MIT open-source license.
//

(function () {


//----------------------------------------------------------
//
//  formatters
//

function formatValueWithPrecision (value,precision) {
	if (Math.abs(value) >= 100) { precision--; }
	if (Math.abs(value) >= 10) { precision--; }
	return "" + value.round(Math.max(precision,0));
}

Tangle.formatters.format_p3 = function (value) {
	return formatValueWithPrecision(value,3);
};

Tangle.formatters.format_neg_p3 = function (value) {
	return formatValueWithPrecision(-value,3);
};

Tangle.formatters.format_p2 = function (value) {
	return formatValueWithPrecision(value,2);
};

Tangle.formatters.format_e6 = function (value) {
	return "" + (value * 1e-6).round();
};

Tangle.formatters.format_abs_e6 = function (value) {
	return "" + (Math.abs(value) * 1e-6).round();
};

Tangle.formatters.format_freq = function (value) {
	if (value < 100) { return "" + value.round(1) + " Hz"; }
	if (value < 1000) { return "" + value.round(0) + " Hz"; }
	return "" + (value / 1000).round(2) + " KHz"; 
};

Tangle.formatters.format_dollars = function (value) {
	return "$" + value.round(0);
};

Tangle.formatters.format_free = function (value) {
	return value ? ("$" + value.round(0)) : "free";
};

Tangle.formatters.format_percent = function (value) {
	return "" + (100 * value).round(0) + "%";
};



//----------------------------------------------------------
//
//  v_if
//
//  hides the element if value is zero
//  add the invertIf class to hide if non-zero instead

Tangle.views.v_if = function (value, el) {
	if (el.hasClass("invertIf")) { value = !value; }
	el.setStyle("display", !value ? "none" : (el.get("tag") == "span") ? "inline" : "block");
};


//----------------------------------------------------------
//
//  v_ifElse
//
//  shows the element's first child if value is non-zero
//  shows the element's second child if value is zero

Tangle.views.v_ifElse = function (value, el) {
	if (el.hasClass("invertIf")) { value = !value; }
	var children = el.getChildren();
	Tangle.views.v_if( value, children[0]);
	Tangle.views.v_if(!value, children[1]);
};


//----------------------------------------------------------
//
//  v_plusMinus
//
//  shows the element's first child if value is positive or zero
//  shows the element's second child if value is negative

Tangle.views.v_plusMinus = function (value, el) {
	Tangle.views.v_ifElse((value >= 0), el);
};


//----------------------------------------------------------
//
//  v_switch
//
//  shows the element's nth child if value is n

Tangle.views.v_switch = function (value, el) {
	el.getChildren().each( function (child, index) {
		Tangle.views.v_if(index == value, child);
	});
};



//----------------------------------------------------------
//
//  v_freqPlot
//

Tangle.views.v_freqPlot = function (value, el, worksheet) {
	
	var canvasWidth = el.get("width");
	var canvasHeight = el.get("height");
	var ctx = el.getContext("2d");
	
	var fs = worksheet.getValue("fs");
	var kf = worksheet.getValue("kf");
	var kq = worksheet.getValue("kq");
	var unstable = worksheet.getValue("unstable");

	var N = 2048;
	var impulseResponse = chamberlinImpulseResponse(kf,kq,N);

	var fft = new RFFT(N, fs);
	fft.forward(impulseResponse);
	var values = fft.spectrum;

	var maxValue = 0;
	for (var i = 0; i < N; i++) { maxValue = Math.max(maxValue, values[i]); }
	maxValue = values[0];

	ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = unstable ? "#f00" : "#555";
    for (var x = 0; x < canvasWidth; x++) {
    	var base = 100;
    	
    	var i = N * arguments.callee.getNormalizedFrequencyForX(x, canvasWidth);  // log-scale x
    	var fracI = i - Math.floor(i);
    	var lowV = values[Math.floor(i)];
    	var highV = values[Math.ceil(i)];

    	var value = lowV + fracI * (highV - lowV);
    	var y = (value > 0) ? Math.max(0, canvasHeight/2 + 32*Math.log(value/maxValue)) : 0;  // log-scale y
	    ctx.fillRect(x, canvasHeight - y, 1, y);
    }
};

var kFreqPlotFrequencyLogScaleBase = 100;

Tangle.views.v_freqPlot.getNormalizedFrequencyForX = function (x, canvasWidth) {
	var base = kFreqPlotFrequencyLogScaleBase;
	return 0.5 * (Math.pow(base, x/canvasWidth - 1) - 1/base);
};

Tangle.views.v_freqPlot.getXForNormalizedFrequency = function (freq, canvasWidth) {
	var base = kFreqPlotFrequencyLogScaleBase;
	return ((Math.log((freq * 2) + 1/base) / Math.log(base)) + 1) * canvasWidth;
};



//----------------------------------------------------------
//
//  v_timePlot
//

var kTimePlotWidthBeforeStep = 16;

Tangle.views.v_timePlot = function (value, el, worksheet) {
	var canvasWidth = el.get("width");
	var canvasHeight = el.get("height");
	var ctx = el.getContext("2d");
	
	var fs = worksheet.getValue("fs");
	var kf = worksheet.getValue("kf");
	var kq = worksheet.getValue("kq");
	var unstable = worksheet.getValue("unstable");

	var N = 256;
	var values = chamberlinStepResponse(kf,kq,N);

	ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.strokeStyle = unstable ? "#f00" : "#00f";
	ctx.lineWidth = 2;
	ctx.beginPath();

	ctx.moveTo(0, canvasHeight-1);
	ctx.lineTo(kTimePlotWidthBeforeStep, canvasHeight-1);

    for (var x = kTimePlotWidthBeforeStep; x < canvasWidth; x++) {
    	var i = x - kTimePlotWidthBeforeStep;
    	var fracI = i - Math.floor(i);
    	var lowV = values[Math.floor(i)];
    	var highV = values[Math.ceil(i)];
    	var value = lowV + fracI * (highV - lowV);
    	var y = value * canvasHeight/2;
   		ctx.lineTo(x, canvasHeight - y);
    }
    
    ctx.stroke();
};


//----------------------------------------------------------
//
//  v_stepPlot
//

Tangle.views.v_stepPlot = function (value, el, worksheet) {
	var canvasWidth = el.get("width");
	var canvasHeight = el.get("height");
	var ctx = el.getContext("2d");

	ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.strokeStyle = "#00f";
	ctx.lineWidth = 2;
	ctx.beginPath();

	ctx.moveTo(0,canvasHeight-1);
	ctx.lineTo(kTimePlotWidthBeforeStep,canvasHeight-1);
	ctx.lineTo(kTimePlotWidthBeforeStep,canvasHeight/2);
	ctx.lineTo(canvasWidth,canvasHeight/2);
    ctx.stroke();
};


//----------------------------------------------------------
//
//  v_polePlot
//

Tangle.views.v_polePlot = function (value, el, worksheet) {
	var canvasWidth = el.get("width");
	var canvasHeight = el.get("height");
	var ctx = el.getContext("2d");
	var unitRadius = canvasWidth * 1/4;

	// draw arena

	ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	
	ctx.fillStyle = "#f4f4f4";
	ctx.beginPath();
	ctx.arc(canvasWidth/2, canvasHeight/2, unitRadius, 0, Math.PI * 2, false);
	ctx.fill();

	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(canvasWidth/2 - unitRadius, canvasHeight/2);
	ctx.lineTo(canvasWidth/2 + unitRadius, canvasHeight/2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(canvasWidth/2, canvasHeight/2 - unitRadius);
	ctx.lineTo(canvasWidth/2, canvasHeight/2 + unitRadius);
	ctx.stroke();

	// draw poles
	
	ctx.strokeStyle = worksheet.getValue("pole1Inside") ? "#00f" : "#f00";
	drawCrossAtPoint(canvasWidth/2 + unitRadius * worksheet.getValue("pole1Real"),
	                 canvasHeight/2 + unitRadius * worksheet.getValue("pole1Imag"));

	ctx.strokeStyle = worksheet.getValue("pole2Inside") ? "#00f" : "#f00";
	drawCrossAtPoint(canvasWidth/2 + unitRadius * worksheet.getValue("pole2Real"), 
	                 canvasHeight/2 + unitRadius * worksheet.getValue("pole2Imag"));
	
	function drawCrossAtPoint(x,y) {
		var crossRadius = 3;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x - crossRadius, y - crossRadius);
		ctx.lineTo(x + crossRadius, y + crossRadius);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x - crossRadius, y + crossRadius);
		ctx.lineTo(x + crossRadius, y - crossRadius);
		ctx.stroke();
	}
	
	
};


//----------------------------------------------------------
//
//  v_audioPlayer
//

Tangle.views.v_audioPlayer = function (value, el, worksheet) {
    if (!worksheet.getValue("isAudioEnabled")) { return; }

	if (!el.audioPlayer) {
    	el.audioPlayer = (new Swiff("Media/FilterAudioPlayer.swf", { container:el })).toElement();
    }
    if (!el.audioPlayer.setSoundParams) { return; }
    
    var isPlaying = worksheet.getValue("isAudioPlaying");
    var kf = worksheet.getValue("kf");
    var kq = worksheet.getValue("kq");
    el.audioPlayer.setSoundParams(isPlaying,kf,kq);
};
	
	
//----------------------------------------------------------

})();



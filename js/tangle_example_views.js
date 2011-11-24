// Play with Tangle views to make plots
// M.M 11/11

// Init Sin example tangle
function initSinExample () {

	var container = $("sinExample");
	
	var script = {

		initialize: function () {
			this.a0 = 0;	this.a1 = 1;
			this.a2 = 0;	this.x  = 0;
			this.y = 0;
		},
		
		update: function () {
		
			// calculate sin
			this.y = this.a0 + (this.a1*Math.sin(this.x)) + (this.a2 * Math.sin(2*this.x));
			v_sinPlot(this.a0,this.a1,this.a2, this.x);
			v_trigPlot(this.a0,this.a1,this.a2);
		},
	};
	
	return (tangle = new Tangle(container,script));
}


// Plot the function onto the canvas
function v_sinPlot (a0,a1,a2,x) {
		
		var elem = $("v_sinPlot_canvas");
		var canvasWidth = elem.width;
		var canvasHeight = elem.height;
		var ctx = elem.getContext("2d");
				
		ctx.fillStyle = "#fff";
	    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	
		ctx.lineWidth = 2;
		ctx.strokeRect(0,0,canvasWidth,canvasHeight);
	
		ctx.fillStyle = "#f00";
	    for (var x = 0; x < canvasWidth; x++) {
	   
	   		var phase = x*2*Math.PI/canvasWidth;
	   		
	      	var y = canvasHeight/4 *(a0 + (a1*Math.sin(phase)) + (a2*Math.sin(2*phase)));

			ctx.fillRect(x, canvasHeight/2 , 1, -y);
		}
		
		// Draw line indicating current position on map
		if(ctx.dashedLine){ ctx.dashedLine(x,0,x+1,canvasHeight,null);}
		else { alert("no dashed line");}
		 
}

// Project a trignometric distribution onto a plane

function v_trigPlot(a0,s1,s2,c1,c2){

	var elem = $("v_trigPlot_canvas");
	var canvasWidth = elem.width;
	var canvasHeight = elem.height;
	var ctx = elem.getContext("2d");
	
	// Make background
	ctx.fillStyle ="#fff";
	ctx.fillRect(0,0,canvasWidth,canvasHeight);
	ctx.lineWidth = 2;
	ctx.strokeRect(0,0,canvasWidth,canvasHeight);

	// Make simulation
	var numDots = 64;
	var numBins = 60;
	
	// Make tiny dots to represent photon impacts
	var myX, myY, selectedRad, selectedTheta, centerX, centerY;
	var tinyRad = 1; // Each photon impact is a 2pixel diameter circle
	
	// Make outer circle spread
	var largeRad = Math.sqrt(canvasHeight*canvasHeight + canvasHeight*canvasHeight);
	var reducedRad = largeRad - tinyRad;
	var largeX = Math.floor(canvasWidth/2);
	var largeY = Math.floor(canvasHeight/2);
	
	// arc covered by each bin in radians
	var sinValue,phase;
	var arcWidth = (360/numBins) * (Math.PI/180);
	
	var bin,state, ii;
	
	//Go round the bins in clockwise fashion
	for(bin = 0; bin < numBins; bin++){
	
		// Get the number of entries in this bin
		centralBinThetaValue = bin*arcWidth + arcWidth/2;
	
		for(state = 0; state <=1; state++){
		
		
			phase = (centralBinThetaValue + Math.PI*state) % (2*Math.PI);
			// Add the +1 so as to force the sin function between 2 and 0.
			sinValue = s1*Math.sin(phase) + s2*Math.sin(2*phase) + 2;
			entriesInThisBin = Math.floor(    sinValue  * numDots );
	
			ctx.fillStyle = (state==0 ?'#F00' : '00F');
			for(ii = 0; ii < entriesInThisBin; ii++){

				// Select random co-ordinates in this bin to draw a circle
				// Circular uniform generation taken from 
				// http://www.anderswallin.net/2009/05/uniform-random-points-in-a-circle-using-polar-coordinates/
				selectedRad = Math.sqrt(Math.random())*((reducedRad/2) + 1);
				selectedTheta = Math.random()*(arcWidth) + bin*arcWidth;
				centerX = selectedRad * Math.cos(selectedTheta) + largeX;
				centerY = selectedRad * Math.sin(selectedTheta) + largeY;
							
				// Draw a 2-pixel diameter red circle at randomly chosen co-ordinates in the current bin							
				ctx.beginPath();
				//ctx.fillStyle = (bin==0 ? '#f00': '#00f'); // behold the might power of the ternary!!! Eurgh.
				ctx.arc(centerX, centerY, tinyRad,
						0, 2*Math.PI, false);		
				ctx.fill();
				ctx.closePath();
			}	
		}
	}
}
	
	
	
	
	
	
	
	
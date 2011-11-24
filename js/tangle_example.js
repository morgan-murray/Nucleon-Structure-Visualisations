
// Define the experimental tangle
var globExpTangle;

function setUpTangle3(){
		

	var el = $('q2res');



	var kinematics = {
			initialize: function () {
				this.hbar = 6.62606957 * Math.pow(10,-34);
				this.M = 938 * Math.pow(10,6);
				this.c = 299 * Math.pow(10,6);
				this.q = 1;
				this.xB = 0.1;
				drawAccess(calculateAccess(this.M, this.xB, this.c, this.hbar, this.q));
				},
			update: function () {
				this.res = calculateAccess(this.M, this.xB, this.c, this.hbar, this.q);
				drawAccess(this.res);
				}
		};
	
	
		var tangle = new Tangle(el, kinematics);
		return tangle;

};

function calculateAccess(M, xB, c, hbar, q){

	return 2 * M * xB * c * hbar/q;

}

function drawNucleon(){

	var el = $("nucleonCanvas");
	ctx = el.getContext("2d");

	cvWidth = el.width;
	cvHeight = el.height;

	ctx.clearRect(0,0,cvWidth,cvHeight);
	
	ctx.fillStyle = "#FFF";
	ctx.fillRect(0,0,cvWidth,cvHeight);

//	ctx.strokeStyle = "#000";
//	
//	ctx.strokeRect(0,0,cvWidth,cvHeight);
	
	// Subtract 2 to give some padding so that the circle never goes out of canvas
	radius = Math.min(cvWidth-2, cvHeight-2)/2;
	ctx.beginPath();
	ctx.arc(cvWidth/2, cvHeight/2, radius, 
			0, 2* Math.PI, false);
			
	ctx.stroke();
	ctx.closePath();
	
}

function drawAccess(resolution){

	var el = $("nucleonCanvas");
	var ctx = el.getContext("2d");
	
	cvWidth = el.width
	cvHeight = el.height;
	
	drawNucleon();
	var nuc_x = cvWidth/2;
	var nuc_y = cvHeight/2;
	var nuc_rad = (cvHeight-2)/2;
	
	if(resolution > nuc_rad){ resolution = nuc_rad; }
	
	var new_radius = Math.ceil( 2*( resolution/(1e-15)) *cvHeight/2);
	var reduced_radius = nuc_rad - new_radius;
	
	var max_quarks = 1;
	
	var reduced_res = new_radius/nuc_rad;
	
	if(reduced_res < 0.5){ max_quarks = 3;}
	if(reduced_res < 0.1){ max_quarks = 12;}
	if(reduced_res < 0.03){ max_quarks = 24;}
	if(reduced_res < 0.01){ max_quarks = 51;}
	if(reduced_res < 0.006){ max_quarks = 102;}
	
	var pol_rad, pol_theta, centerX, centerY;
	
	for (var ii = 0; ii < max_quarks; ii++){
	
		
		// Generate a random point in the nucleon (Not uniform)
		pol_rad = Math.random()*(reduced_radius+1);
		pol_theta =Math.random()*(Math.PI*2 +1);
		
		centerX = pol_rad * Math.cos(pol_theta) + nuc_x;
		centerY = pol_rad * Math.sin(pol_theta) + nuc_y;
		
				
		ctx.beginPath();
	
		// Colour the quarks in
		if (max_quarks == 1){
			    ctx.fillStyle = '#555';
		}
		else{
		    remainder = (ii % 3);
	
		    if (remainder == 0) { ctx.fillStyle = "#F00"; }
		    else if (remainder == 1) { ctx.fillStyle = '#0F0'; }
			else { ctx.fillStyle = '#00F'; }
		}
		
		ctx.arc(centerX, centerY, new_radius,
		0, 2*Math.PI, false);
		
		ctx.fill();
		
		ctx.closePath();
	
	}
			
}

function updateWithExpKins(experiment){

	console.log(experiment);	
	if (experiment.toLowerCase() == 'hermes'){
	
		globExpTangle.setValues({xB: 0.12, q:2.4});
	}	
	else if(experiment.toLowerCase() == "clas"){
		globExpTangle.setValues({xB: 0.3, q: 1.3});
	}
	else if(experiment.toLowerCase() == "compass"){
		globExpTangle.setValues({xB: 0.05, q:4});
	}
	else{
		log("Experiment not found");
	}
}

// Found this snippet on the net, adds dashed-line functionality to canvas
window.addEvent('domready',function(){
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo){
  CP.dashedLine = function(x,y,x2,y2,dashArray){
    if (!dashArray) dashArray=[10,5];
    var dashCount = dashArray.length;
    this.moveTo(x, y);
    var dx = (x2-x), dy = (y2-y);
    var slope = dy/dx;
    var distRemaining = Math.sqrt( dx*dx + dy*dy );
    var dashIndex=0, draw=true;
    while (distRemaining>=0.1){
      var dashLength = dashArray[dashIndex++%dashCount];
      if (dashLength > distRemaining) dashLength = distRemaining;
      var xStep = Math.sqrt( dashLength*dashLength / (1 + slope*slope) );
      x += xStep
      y += slope*xStep;
      this[draw ? 'lineTo' : 'moveTo'](x,y);
      distRemaining -= dashLength;
      draw = !draw;
    }
  }
}
});

// Set up the tangle for the nucleon structure canvas
window.addEvent('domready', function(){ 

	// Experimental kinematics tangle, does all the work of drawing canvas and updating, etc.
	globExpTangle = setUpTangle3();
	
	// Add the ability to click on experiments and set their kinematics
	$('clas').addEvent('click', function(){updateWithExpKins('clas')});
	$('hermes').addEvent('click', function(){updateWithExpKins('hermes')});
	$('compass').addEvent('click', function(){updateWithExpKins('compass')});
	
	
});

window.addEvent('domready', function(){

	// Sinusoidal distribution tangle
	initSinExample();
});

// Project sin function onto plane
//window.addEvent('domready', function(){ v_trigPlot(); });

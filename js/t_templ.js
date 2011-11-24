alert("now");

function setUpTangle2(){

	var mdl = {
			initialize: function () {
				this.cookies = 4;
				this.caloriesPerCookie = 50;
				},
			update: function () {
				this.calories = this.cookies * this.caloriesPerCookie;
				}
		};
	
	var el = $('example');
	
	var tangle = new Tangle(el, mdl);


};

alert("later");
window.addEvent('domready', function(){ setUpTangle2() });

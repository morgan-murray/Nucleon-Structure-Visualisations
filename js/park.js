//
//  park.js
//  ExplorableExplanations
//
//  Created by Bret Victor on 3/17/11.
//  (c) 2011 Bret Victor.  MIT open-source license.
//


var initParkExample;


(function () {


initParkExample = function (tangle) {

	var container = $("parkExample");

	var script = {

		initialize: function (model) {
			model.parkCount = 278;
			model.oldAdmission = 12;
			model.registeredVehicleCount = 28e6;  // http://www.yesforstateparks.com/get-the-facts/fact-sheets/general-fact-sheet
			model.taxpayerCount = 13657632;  // http://trac.syr.edu/tracirs/findings/aboutTP/states/California/counties/06000/06000main.html
			model.oldVisitorCount = 75e6;  // http://parks.ca.gov/pages/712/files/budget%20fact%20sheet%20w-graphics%20-%2001-14-08.pdf
			model.oldBudget = 400e6; // this is not really correct, it ignores revenue, but I couldn't find any revenue data
			model.oldClosedParkCount = 150;

			model.percentOfAdmissionConvertedToRevenue = 0.1;  // total BS, couldn't find real data, just trying to make the numbers work
			model.percentInStateVistors = 85;
			model.percentVehicleOwners = 95;

			model.tax = 18;
			model.percentCompliance = 100;
			model.isTaxPerVehicle = true;
			model.newAdmission = 0;
			model.newAdmissionAppliesToEveryone = false;
		},
		
		update: function (model) {
			var taxCount = model.isTaxPerVehicle ? model.registeredVehicleCount : model.taxpayerCount;
			model.taxCollected = model.tax * model.percentCompliance/100 * taxCount;
			
			var fractionOfVisitorsEligibleForNewAdmission =	model.newAdmissionAppliesToEveryone ? 1 :
				(model.percentInStateVistors/100 * (model.isTaxPerVehicle ? (model.percentVehicleOwners/100) : 1));
			var averageAdmission = model.oldAdmission + fractionOfVisitorsEligibleForNewAdmission * (model.newAdmission - model.oldAdmission);

			// fake demand curve
			model.newVisitorCount = model.oldVisitorCount * Math.max(0.2, 1 + 0.5*Math.atan(1 - averageAdmission/model.oldAdmission));
			
			var oldRevenue = model.oldVisitorCount * model.oldAdmission * model.percentOfAdmissionConvertedToRevenue;
			var newRevenue = model.newVisitorCount * averageAdmission * model.percentOfAdmissionConvertedToRevenue;
			
			model.deltaRevenue = newRevenue - oldRevenue;
			model.deltaBudget = model.taxCollected + model.deltaRevenue;
			model.deltaVisitorCount = model.newVisitorCount - model.oldVisitorCount;
			model.relativeVisitorCount = Math.abs(model.deltaVisitorCount / model.oldVisitorCount);

			model.budget = model.oldBudget + model.deltaBudget;
			
			var maintainanceBudget = 600e6;
			var repairBudget = 750e6;
			var maxBudget = 1000e6;
			
			if (model.budget < maintainanceBudget) {
				model.scenarioIndex = 0;
				model.closedParkCount = model.oldClosedParkCount * (maintainanceBudget - model.budget) / (maintainanceBudget - model.oldBudget);
				model.closedParkCount = Math.round(model.closedParkCount);
			}
			else if (model.budget < repairBudget) {
				model.scenarioIndex = 1;
			}
			else if (model.budget < maxBudget) {
				model.scenarioIndex = 2;
				model.restorationTime = Math.round(10 - 9 * (model.budget - repairBudget) / (maxBudget - repairBudget));
			}
			else {
				model.scenarioIndex = 3;
				model.surplus = model.budget - maxBudget;
			}
		},
	};
	
    var worksheet = tangle.addWorksheet("park", container, script);
}


//----------------------------------------------------------

})();



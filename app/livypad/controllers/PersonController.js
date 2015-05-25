livypad.controller("PersonController", function($scope,supersonic){

//Initialize Parse with Javascript Key
	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
	supersonic.ui.views.current.params.onValue(function(values){
		$scope.myFamMember = values.id;
	});
	//classes
	
	var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
	var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
	var FamilyMember = Parse.Object.extend("FamilyMember");
	var Doctor = Parse.Object.extend("Doctor");


	//Refresh functionality

	$scope.refresh = function(){
		location.reload();
	}
		
	var currentUser = Parse.User.current();

	// load data for family member
	var queryFamMember = new Parse.Query(FamilyMember);

	queryFamMember.get($scope.myFamMember, {
	      success: function(famMember) {
	      	//alert("inside" + famMember.get("Name"));
	      	$scope.memberIcon = famMember.get("iconID");
	        loadFamilyMemberExistingAppointments(famMember);
	        loadFamilyMemberSuggestedAppointments(famMember);
	      },
	      error: function(object, error) {
	      	alert("ERROR");
	        // The object was not retrieved successfully.
	        // error is a Parse.Error with an error code and message.
	      }
	    });


	//Code for extracting scheduled and suggested appointments
	$scope.famMemberScheduledAppointmentList = [];
	$scope.famMemberSuggestedAppointmentList = [];


  	function loadFamilyMemberExistingAppointments(famMember){
  		var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");
		famMemberScheduledAppointmentRelation.query().find().then(function(scheduledAppointmentResults){
			scheduledAppointmentResults.forEach(function(famMemberScheduledAppointment){
				$scope.famMemberScheduledAppointmentList.push({ nameOfAppointment : famMemberScheduledAppointment.get("name"),
												   doctor : famMemberScheduledAppointment.get("doctor"),
												   location : famMemberScheduledAppointment.get("location"),
												   dateScheduled : famMemberScheduledAppointment.get("dateScheduled"),
												   recommendedNextDate : famMemberScheduledAppointment.get("recommendedNextDate"),
												   nameOfFamilyMember : famMember.get("name"),
												});
			});
		});

  	};

	function loadFamilyMemberSuggestedAppointments(famMember){
	  	var famMemberScheduledAppointmentRelation = famMember.relation("suggestedAppointments");
		famMemberScheduledAppointmentRelation.query().find().then(function(suggestedAppointmentResults){
			suggestedAppointmentResults.forEach(function(famMemberSuggestedAppointment){

				//loading data from suggested Appointment
				var lowerBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[0];
			  	var upperBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[1];
			  	var relevantGender = famMemberSuggestedAppointment.get("relevantGender");
			  	var nameOfSuggestedAppointment = famMemberSuggestedAppointment.get("name");
			  	var frequency = famMemberSuggestedAppointment.get("frequency");
			  	var specialAgeArray = famMemberSuggestedAppointment.get("specialAges");
			  	lowerBound = Math.max(0,lowerBound); //ruling out negative numbers
			  	//formatting strings
			  	var lowerBoundAgeString = formatMonthsToString (lowerBound);
		  		var upperBoundAgeString = formatMonthsToString (upperBound);
		
		  		var keyAgeString = "";
		  		for (i = 0; i <specialAgeArray.length; i++){
		  			var keyAge = specialAgeArray[i];
		  			if (i != 0){
		  				keyAgeString += ", ";
		  			}
		  			keyAgeString += formatMonthsToString(keyAge);
		  		};

		  		var frequencyString = "";
		  		if (frequency == 0){
		  			frequencyString = "consult your doctor"
		  		}else{
		  			frequencyString = "once every " + formatMonthsToString(frequency);
		  		};

				$scope.famMemberSuggestedAppointmentList.push({  appointmentID : famMemberSuggestedAppointment.id,
		  												famMember : famMember,
		  												famMemberId: famMember.id,
		  												famMemberName: famMember.get("Name"), 
													 	appointmentName: nameOfSuggestedAppointment,
													 	lowerBound : lowerBoundAgeString,
													 	upperBound : upperBoundAgeString,
														keyAges: keyAgeString,
														frequency: frequencyString,
													});
			});
		});
	};

	function formatMonthsToString(numMonths){
		var formattedString = "";

		if (numMonths < 12){
			formattedString = numMonths.toString() + " months";
		}
		else{
			if (numMonths > 1200){
				formattedString = "old age";
			}
			else{
				numYears = numMonths/12;
				numYearsRounded = Math.round( numYears * 10 ) / 10;
				formattedString = (numYearsRounded).toString() + " years";
			}
		}

		return formattedString;
	}
	///THIS NEEDS TO BE IN THE PERSON CONTROLLER AS WELL!!
	$scope.scheduleRecommendedAppointment = function(appointmentName,famMember,frequency){
		//alert("scheduled " + appointmentName + " appointment for " + famMember.get("Name"));
		var famMemberID = famMember.id;
		var myParams = {params: {newAppointmentName: appointmentName, famMemberToAddToForRecommended: famMemberID,recommendedFrequency:frequency}}; 
		var view = new supersonic.ui.View("livypad#addRecommendedEventToGCalandLivyPad");
		supersonic.ui.layers.push(view,myParams);
	}

	$scope.ignoreReccomendation = function(appointmentID, famMember){
		alert("ignored this appointment");
		famMember.addUnique("ignoredAppointments", appointmentID);
		famMember.save();
	}
	
});
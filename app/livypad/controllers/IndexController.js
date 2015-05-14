livypad.controller("IndexController", function($scope,supersonic){
	
	//Initialize Parse with Javascript Key
	
	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
	
	//classes
	
	var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
	var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
	var FamilyMember = Parse.Object.extend("FamilyMember");

	//Example Queries

	//var queryScheduledAppointments = new Parse.Query(ScheduledAppointment);
	//var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
	//var queryFamilyMember = new Parse.Query(FamilyMember);

	//Refresh functionality

	$scope.refresh = function(){
		location.reload();
	}

	// Preliminary Log in Functionality, mostly for testing

	//Parse.User.logOut();
	//force log in, for testing
	/*Parse.User.logIn("Sonia", "password", {
	  success: function(user) {
	  		alert("successfully logged in");
	  },
	  error: function(user, error) {
	    // The login failed. Check error to see why.
	  }
	});*/
	
	var currentUser = Parse.User.current();

	// Preliminary Add Family Member function

	function addFamilyRelation(name, datOfBirth, gender){
		var familyRelations = currentUser.relation("familyMember");
		var familyMember = new FamilyMember();

		familyMember.set("Name", name);
		familyMember.set("dateOfBirth", dateOfBirth);
		familyMember.set("gender", gender);
		familyMember.save();

	    familyRelations.add(familyMember);
	    currentUser.save();
	}

	
	// CODE FOR MANUALLY ADDING FAMILY MEMBERS + RELATIONS , TO DELETE LATER // 
		
		/*var query = new Parse.Query(FamilyMember);
		query.get("n43SZ2EUg1", {
		  success: function(familyMember) {
		   // alert(familyMember.id);
		   	familyRelations.add(familyMember);
		   	currentUser.save();
		  },
		  error: function(object, error) {
		  	alert("could not add family member");
		  }
		});*/

	// END CODE TO MANUALLY ADD FAM MEMBERS + RELATIONS ////////////////////////


	//Code for extracting scheduled and suggested appointments


	$scope.suggestedAppointmentList = [];
	$scope.allScheduledAppointmentList = [];
	$scope.listOfFamMemberExistingAppointments = [];

	loadFamilyData();
	function loadFamilyData(){	
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){
			    
			    //Resetting listOfFamMemberExistingAppointments since it's only for each member, not the whole fam
			    $scope.listOfFamMemberExistingAppointments = []; //resetting array to blank.

			    //preparing to exclude existing appointments, also filling in the scheduled appointment list at the same time.
			    loadFamilyMemberExistingAppointments(famMember); //NEED TO ensure this finishes populating before you call the next function! It won't break but it relies on this being filled to filter out appointments that don't exist yet.
				
			    //looking through all suggested appointments to find relevant ones
			    loadFamilyMemberSuggestedAppointments(famMember);

			});
  		});
  	};

  	function loadFamilyMemberExistingAppointments(famMember){
  		var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");
		famMemberScheduledAppointmentRelation.query().find().then(function(scheduledAppointmentResults){
			scheduledAppointmentResults.forEach(function(famMemberScheduledAppointment){
				listOfFamMemberExistingAppointments.push(famMemberScheduledAppointment.get("name"));
				//filling in the all scheduled appointment list while I'm at it, so I don't need to duplicate queries.
				$scope.allScheduledAppointmentList.push({ nameOfAppointment : famMemberScheduledAppointment.get("name"),
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
	  		//extracting out family member's info
			var today = new Date();
			var birthDate = famMember.get("dateOfBirth");
			var age = today.getFullYear() - birthDate.getFullYear();
		    var m = today.getMonth() - birthDate.getMonth();
		    //if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		    //    age--;
		    //}
		    var ageInMonths = (age * 12) + m;
		    var gender = famMember.get("gender");
		    var nameOfFamMember = famMember.get("Name");
		    var appointmentsToIgnore = famMember.get("ignoredAppointments");

		    var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
			querySuggestedAppointments.find().then(function(suggestedAppointmentResults){
				suggestedAppointmentResults.forEach(function(famMemberSuggestedAppointment){

					//getting data of this suggested appointment
				  	var lowerBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[0];
				  	var upperBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[1];
				  	var relevantGender = famMemberSuggestedAppointment.get("relevantGender");
				  	var nameOfSuggestedAppointment = famMemberSuggestedAppointment.get("name");
				  	var frequency = famMemberSuggestedAppointment.get("frequency");
				  	var specialAgeArray = famMemberSuggestedAppointment.get("specialAges");
					

					var padding = 2; //adding padding to the months
					lowerBound = Math.max(0,lowerBound); //ruling out negative numbers
					
					//test to see if appointment already exists, by name
					var existingAppointmentMarker = $scope.listOfFamMemberExistingAppointments.indexOf(nameOfSuggestedAppointment);
					//test to see if user chose to ignore appointment for this fam member
					var ignoredAppointmentMarker = appointmentsToIgnore.indexOf(famMemberSuggestedAppointment.id);
					//check to see if age is among special ages
					var specialAgeMarker = specialAgeArray.indexOf(ageInMonths);

					//test for relevant appointments
				  	if ( ((ageInMonths >= lowerBound - padding && ageInMonths <=upperBound + padding) || specialAgeMarker > -1)
				  		&& (gender==relevantGender || relevantGender == "all")
				  		&& existingAppointmentMarker == -1 
				  		&& ignoredAppointmentMarker == -1)
				  	{
				  		//Formatting Relevant Strings
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
				  		 
				  		 //Adding strings and information to scope
				  		$scope.suggestedAppointmentList.push({  appointmentID : famMemberSuggestedAppointment.id,
				  												famMember : famMember,
				  												famMemberName: famMember.get("Name"), 
															 	appointmentName: famMemberSuggestedAppointment.get("name"),
															 	lowerBound : lowerBoundAgeString,
															 	upperBound : upperBoundAgeString,
																keyAges: keyAgeString,
																frequency: frequencyString,
															});	
				  	};

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

	$scope.scheduleAppointment = function(appointmentName,famMember){
		alert("scheduled " + appointmentName + " appointment for " + famMember.get("Name"));
	}

	$scope.ignoreReccomendation = function(appointmentID, famMember){
		alert("ignored this appointment");
		famMember.addUnique("ignoredAppointments", appointmentID);
		famMember.save();
	}

});




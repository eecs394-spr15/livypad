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


	$scope.unscheduledAppointmentList = [];
	$scope.allScheduledAppointmentList = [];
	$scope.listOfFamMemberExistingAppointments = ["Hepatitis B"];

	loadFamilyData();
	function loadFamilyData(){	
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){
			    
			    //Resetting listOfFamMemberExistingAppointments since it's only for each member, not the whole fam
			    $scope.listOfFamMemberExistingAppointments = []; //resetting array to blank.

			    //preparing to exclude existing appointments, also filling in the scheduled appointment list at the same time.
			    loadFamilyMemberExistingAppointments(famMember);
				
			    //looking through all suggested appointments to find relevant ones
			    loadFamilyMemberSuggestedAppointments(famMember);

			});
  		});
  	};

  	function loadFamilyMemberExistingAppointments(famMember){
  		var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");
		famMemberScheduledAppointmentRelation.query().find().then(function(scheduledAppointmentResults){
			//alert(scheduledAppointmentResults.length);
			scheduledAppointmentResults.forEach(function(famMemberScheduledAppointment){
				listOfFamMemberExistingAppointments.push(famMemberScheduledAppointment.get("name"));
				//filling in the all scheduled appointment list while I'm at it, so I don't need to duplicate queries.
				allScheduledAppointmentList.push({ nameOfAppointment : famMemberScheduledAppointment.get("name"),
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

		    var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
			querySuggestedAppointments.find().then(function(suggestedAppointmentResults){
				suggestedAppointmentResults.forEach(function(famMemberSuggestedAppointment){

				  	var lowerBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[0];
				  	var upperBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[1];
				  	var relevantGender = famMemberSuggestedAppointment.get("relevantGender");
				  	var nameOfSuggestedAppointment = famMemberSuggestedAppointment.get("name");

				  	var specialAgeArray = famMemberSuggestedAppointment.get("specialAges");
					var specialAgeMarker = specialAgeArray.indexOf(ageInMonths);

					var padding = 2; //adding padding to the months
					lowerBound = lowerBound - padding;
					upperBound = upperBound + padding;
					//test to see if appointment already exists, by name
					var existingAppointmentMarker = $scope.listOfFamMemberExistingAppointments.indexOf(nameOfSuggestedAppointment);
					//alert($scope.listOfFamMemberExistingAppointments[0]);
					
					//test for relevant appointments
				  	if ( ((ageInMonths >= lowerBound && ageInMonths <=upperBound) || specialAgeMarker > -1)
				  		&& (gender==relevantGender || relevantGender == "all")
				  		&& existingAppointmentMarker == -1 )
				  	{
				  		$scope.unscheduledAppointmentList.push({ famMemberName: famMember.get("Name"), 
																 appointmentName: famMemberSuggestedAppointment.get("name"),
															});	
				  	};

				});
				//alert($scope.unscheduledAppointmentList.length);
			});
		
	};


});




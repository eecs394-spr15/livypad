livypad.controller("IndexController", function($scope,supersonic){
	
	/* can include javascript key? according to Prof */
	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
	//alert("hello");
	//classes
	
	var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
	var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
	var FamilyMember = Parse.Object.extend("FamilyMember");

	//force log in, for testing
	Parse.User.logIn("testuser", "password", {
		alert("entered function");
	  success: function(user) {
	  		alert("success log in");
	  		addFamilyRelation(user);
	  },
	  error: function(user, error) {
	    // The login failed. Check error to see why.
	  }
	});
	
	var currentUser = Parse.User.current();

	function addFamilyRelation(user){
		var familyRelations = user.relation("familyMember");
		var familyMember = new FamilyMember();

		var birthday = new Date(1995, 11, 17);
		familyMember.set("Name", "Bob");
		familyMember.set("dateOfBirth", birthday);
		familyMember.set("gender", "Male");
		familyMember.save();

	    familyRelations.add(familyMember);
	}


	//var queryScheduledAppointments = new Parse.Query(ScheduledAppointment);
	//var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
	//var queryFamilyMember = new Parse.Query(FamilyMember);

	$scope.unscheduledAppointmentList = [];
	$scope.allScheduledAppointmentList = [];

	function loadFamilyUnscheduledAppointments(){
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){
  				//extracting out family member's info
  				var today = new Date();
  				var birthDate = famMember.dateOfBirth;
  				var age = today.getFullYear() - birthDate.getFullYear();
			    var m = today.getMonth() - birthDate.getMonth();
			    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			        age--;
			    }
			    var ageInMonths = (age * 12) + today.getMonth();
			    var gender = famMember.get("gender");
			    var nameOfFamMember = famMember.get("Name");

			    //preparing to exclude existing appointments, also filling in the scheduled appointment list at the same time.
			    var listOfFamMemberExistingAppointments = [];
				
				var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");
				famMemberScheduledAppointmentRelation.query().find().then(function(scheduledAppointmentResults){
						scheduledAppointmentResults.forEach(function(famMemberscheduledAppointment){
							listOfFamMemberExistingAppointments.push(famMemberSuggestedAppointment.get("name"));
							
							//filling in the all scheduled appointment list while I'm at it, so I don't need to duplicate queries.
							allScheduledAppointmentList.push({ nameOfAppointment : famMemberSuggestedAppointment.get("name");
															   doctor : famMemberSuggestedAppointment.get("doctor");
															   location : famMemberSuggestedAppointment.get("location");
															   dateScheduled : famMemberSuggestedAppointment.get("dateScheduled");
															   recommendedNextDate : famMemberSuggestedAppointment.get("recommendedNextDate");
															   nameOfFamilyMember : nameOfFamMember;
							});
						});
				});

			    //looking through all suggested appointments to find relevant ones
			    var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);

			    querySuggestedAppointments.find().then(function(suggestedAppointmentResults){

					suggestedAppointmentResults.forEach(function(famMemberSuggestedAppointment){
					  	var lowerBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[0];
					  	var upperBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[1];
					  	var relevantGender = famMemberSuggestedAppointment.get("relevantGender");
					  	var nameOfSuggestedAppointment = famMemberSuggestedAppointment.get("name");

					  	var specialAgeArray = famMemberSuggestedAppointment.get("SpecialAges");
						var specialAgeMarker = specialAgeArray.indexOf(ageInMonths);
						var padding = 5; //adding padding to the months

						var existingAppointnmentMarker = listOfFamMemberExistingAppointments.indexOf(nameOfSuggestedAppointment);

						//test for relevant appointments
					  	if ( ((age >= lowerBound - padding && age <=upperBound + padding) || specialAgeMarker > -1)
					  		&& (gender==relevantGender || relevantGender == "All")
					  		&& existingAppointnmentMarker > -1 )
					  	{
					  		$scope.unscheduledAppointmentList.push({ famMemberName: famMember.get("Name"), 
																	 appointmentName: famMemberSuggestedAppointment.get("name"),
																});	
					  	};

					});
				});

			});
  		});
  	};



	
});




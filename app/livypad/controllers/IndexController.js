livypad.controller("IndexController", function($scope,supersonic){

//Initialize Parse with Javascript Key
	supersonic.ui.tabs.update([{title: "Home", badge: "1"}]);
	 	 
	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
	
	//classes
	
	var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
	var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
	var FamilyMember = Parse.Object.extend("FamilyMember");
	var Doctor = Parse.Object.extend("Doctor");

	//get the the parameter pased by previous page
	supersonic.ui.views.current.params.onValue(function(values){
		$scope.previewId = values.id;
	})

	//Example Queries

	//var queryScheduledAppointments = new Parse.Query(ScheduledAppointment);
	//var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
	//var queryFamilyMember = new Parse.Query(FamilyMember);

	//Refresh functionality

	$scope.refresh = function(){
		location.reload();
	}

	// Preliminary Log in Functionality, mostly for testing

		
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

	// Query the family members of current user

	$scope.members = [];
	
	function loadFamilyMember(){
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){
  				var scheduled = famMember.relation("scheduledAppointments");
  				scheduled.query().find().then(function(scheduledResults){
  				var numScheduled = scheduledResults.length;

				var suggested = famMember.relation("suggestedAppointments");
  				suggested.query().find().then(function(suggestedResults){
  				var numSuggested = suggestedResults.length;
	  				$scope.members.push({ familyMember: famMember,
	  									  id : famMember.id,
										  name: famMember.get("Name"),
										  icon: famMember.get("icon").url(),
										  dateOfBirth: famMember.get("dateOfBirth"),
										  gender: famMember.get("gender"),
										  scheduled: numScheduled,
										  suggested: numSuggested,
										});
  				});
  				});
  			});
  			//alert($scope.members.length);
  		});
	};
	loadFamilyMember();

	//Add a family member
	$scope.addFamilyMember = function(){
		var familyRelations = currentUser.relation("familyMember");
		var familyMember = new FamilyMember();
		familyMember.set("Name", $scope.newMember.name);
		//var validDate = ($scope.newMember.dateOfBirth | date: "yyyy-MM-dd")
		familyMember.set("dateOfBirth", $scope.newMember.birthdate);
		familyMember.set("gender", $scope.newMember.gender);
		// var parseFile = new Parse.File();
		// FamilyMember.set("icon", parseFile);
		familyMember.save().then(function(familyMember) {
				familyRelations.add(familyMember);
	    		currentUser.save();
				var options = {
				  message: "Member has been added to your family",
				  buttonLabel: "Close"
				};

				supersonic.ui.dialog.alert("Success!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});
				supersonic.ui.layers.pop();
					
				}, function(error) {
					alert("Member save failed");
				// the save failed.
				});

	};
	

	//Add a past scheduled event
	$scope.addScheduled = function(){
		var queryMember = new Parse.Query(FamilyMember);
		queryMember.get($scope.previewId, {
		  success: function(familyMember) {
		    var memberScheduledAppointmentsRelation = familyMember.relation("scheduledAppointments");
		   	var newScheduled = new ScheduledAppointment();
		   	newScheduled.set("name", $scope.newScheduled.name);
		   	newScheduled.set("doctor", $scope.newScheduled.doctor);
		   	newScheduled.set("location", $scope.newScheduled.location);
		   	newScheduled.set("dateScheduled", $scope.newScheduled.dateScheduled);
		   	var newScheduledFamMember = newScheduled.relation("familyMember");
		   	newScheduledFamMember.add(familyMember);
		   	newScheduled.save().then(function(newOne) {
				memberScheduledAppointmentsRelation.add(newOne);
	    		familyMember.save();

				var options = {
				  message: "Event has been added",
				  buttonLabel: "Close"
				};

				supersonic.ui.dialog.alert("Success!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});
				supersonic.ui.layers.pop();
					
				}, function(error) {
					alert("Event save failed");
				// the save failed.
				});
		  },
		  error: function(object, error) {
		  	alert("could not add family member");
		  }
		});
	}

	//Add a doctor to particular family member
	$scope.addDoctor = function(){
		var queryMember = new Parse.Query(FamilyMember);
		queryMember.get($scope.previewId, {
		  success: function(familyMember) {
		  	alert(familyMember.id);
		    var memberDoctorsRelation = familyMember.relation("doctors");
		   	var newDoctor = new Doctor();
		   	newDoctor.set("name", $scope.newDoctor.name);
		   	newDoctor.set("type", $scope.newDoctor.type);
		   	newDoctor.save().then(function(newOne) {
				memberDoctorsRelation.add(newOne);
	    		familyMember.save();

				var options = {
				  message: "Doctor has been added",
				  buttonLabel: "Close"
				};

				supersonic.ui.dialog.alert("Success!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});
				supersonic.ui.layers.pop();
					
				}, function(error) {
					alert("Doctor save failed");
				// the save failed.
				});
		  },
		  error: function(object, error) {
		  	alert("could not add family member");
		  }
		});
	}

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

						var famMemberSuggestedAppointmentRelation = famMember.relation("suggestedAppointments");
						famMemberSuggestedAppointmentRelation.add(famMemberSuggestedAppointment);
						famMember.save();	
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



	$scope.login = function (){
	Parse.User.logOut();
	//force log in, for testing
	Parse.User.logIn("Sonia", "password", {
	  success: function(user) {
	  	supersonic.ui.dialog.alert("Welcome, Sonia!");
		supersonic.ui.initialView.dismiss();
		//alert("successfully logged in");
			supersonic.ui.animation("curlDown").perform();
		},
	  error: function(user, error) {
	    	alert("log in error");
	       // The login failed. Check error to see why.
	  }
	});
	};

	$scope.skiplogin = function (){
		supersonic.ui.dialog.alert("Welcome, guest!");
		supersonic.ui.initialView.dismiss();
	
	};		
	$scope.signup = function (){
		var view = new supersonic.ui.View("livypad#signup");
		supersonic.ui.layers.push(view);
	
	};	
	$scope.confirmSignUp = function(){
		var user = new Parse.User();
		user.set("username", $scope.newUser.username);
		user.set("password", $scope.newUser.password);
		//user.set("email", $scope.newUser.email);
		user.signUp(null, {
			success: function(user) {
				supersonic.ui.initialView.dismiss();
				supersonic.ui.dialog.alert("Success!");
			},
			error: function(user, error) {
				alert("sign up error!");
			}
		});
	};
});




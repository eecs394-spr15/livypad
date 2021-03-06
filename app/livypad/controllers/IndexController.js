livypad.controller("IndexController", function($scope,supersonic){

	//Initialize Parse with Javascript Key
	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");

	//classes
	var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
	var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
	var FamilyMember = Parse.Object.extend("FamilyMember");
	var Doctor = Parse.Object.extend("Doctor");
	
	//push notifications	
	var pushNotification;
	document.addEventListener("deviceready", function() {
	  pushNotification = window.plugins.pushNotification;

	// the result contains any error description text returned from the plugin call
	function errorHandler (error) {
	    alert('error = ' + error);
	}

	function registrationHandler (deviceToken) {
	   // alert('deviceToken = ' + deviceToken);
	    //save the deviceToken / registration ID to your Push Notification Server

	}

	pushNotification.register(
	    registrationHandler,
	    errorHandler, {
	        "badge":"true",
	        "sound":"true",
	        "alert":"true"
	        });
	});
	 	 
	
	$scope.iconstatus = 0;
	//used for icon select ui
	$scope.selectedRow=null;

	//for search
	$scope.keyword = "";

	

	//get the the parameter pased by previous page
	supersonic.ui.views.current.params.onValue(function(values){
		$scope.previewId = values.id;
		$scope.individualFamMember = values.id;
		loadIndividualFamilyMember();
	})

	//Example Queries

	//var queryScheduledAppointments = new Parse.Query(ScheduledAppointment);
	//var querySuggestedAppointments = new Parse.Query(SuggestedAppointment);
	//var queryFamilyMember = new Parse.Query(FamilyMember);
	function loadIndividualFamilyMember(){
		var queryIndividualFamMember = new Parse.Query(FamilyMember);

		queryIndividualFamMember.get($scope.individualFamMember, {
		      success: function(famMember) {
		      	$scope.memberIcon = famMember.get("iconID");
		      	$scope.individualFamMemberName = famMember.get("Name");
		      },
		      error: function(object, error) {
		      	//alert("ERROR");
		      }
		    });
	}

	//Refresh functionality

	$scope.refresh = function(){
		location.reload();
	}

	//function to filter by serach and by person  (element.nameOfAppointment.toLowerCase().match($scope.keyword.toLowerCase()) ? true : false)
	$scope.filterFunction= function(element){
		var localBool = (element.famMemberID == $scope.individualFamMember)
						&& (element.nameOfAppointment.toLowerCase().match($scope.keyword.toLowerCase())? true : false);
		return localBool
	}


	//USER FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////
		
	var currentUser = Parse.User.current();


	$scope.thisUser = [];

	$scope.thisUser.push({ 	userName: currentUser.get("username"), 
							Email: currentUser.get("email"), 
							thispassword: currentUser.get("password")
						});
	$scope.thisuser = $scope.thisUser[0];

	$scope.editThisUser = function(){
		var queryEditUser = new Parse.Query(Parse.User);
        queryEditUser.get(currentUser.id, {
          success: function(userAgain) {
            userAgain.set("username", $scope.editUser.username);
            userAgain.set("password", $scope.editUser.password);
			userAgain.set("email", $scope.editUser.email);
			currentUser = Parse.User.current();
			$scope.thisUser.push({ 	userName: currentUser.get("username"), 
									Email: currentUser.get("email"), 
									thispassword: currentUser.get("password")
								});
			$scope.thisuser = $scope.thisUser[0];
			alert(" Successfully updated your profile! "+ userAgain.get("username")+"\n Restart the app to view your new profile!");
            userAgain.save(null, {
              error: function(userAgain, error) {
                // This will error, since the Parse.User is not authenticated
              }
            });
            }
        });
	}

	// Remove Family Member function
	$scope.deleteFamilyMember = function(memberID){
		
		var queryDeleteMember = new Parse.Query(FamilyMember);
		var allFamilyMemberRelations = currentUser.relation("familyMember");
		var options = {
							message: "Do you really want to delete this member from your account?",
							buttonLabels: ["Yes", "No"]
						};

		supersonic.ui.dialog.confirm("", options).then(function(index) {
		  if (index == 0) {
		   		queryDeleteMember.get(memberID, {
					success: function(memberDelete){
						allFamilyMemberRelations.remove(memberDelete);
						currentUser.save();
						memberDelete.destroy({
							success: function(myObject){
								var options = {
									message: "This family member has been removed from your family.",
									buttonLable: "Close"
								};
								supersonic.ui.dialog.alert("Success!", options).then(function() {
								  supersonic.logger.log("Alert closed.");
								});
								reloadAllData();
							},
							error: function(myObject, error){
								var options = {
									message: "This member could not be removed from you family.",
									buttonLable: "Close"
								};
								supersonic.ui.dialog.alert("Issue Encountered", options).then(function() {
								  supersonic.logger.log("Alert closed.");
								});
							}
						});
					},
					error: function(memberDelete, error){

					}
				});
		  } else {
		    supersonic.logger.log("Alert closed.");
		  }
		});
		
	}



	$scope.openaddfamilymembers = function (){
		var view = new supersonic.ui.View("livypad#addFamilyMember");
		supersonic.ui.layers.push(view);
	
	};


	$scope.deleteVisit = function(visitID){
		var queryDeleteVisit = new Parse.Query(ScheduledAppointment);
		var options = {
							message: "Do you really want to delete this visit.",
							buttonLabels: ["Yes", "No"]
						};
		supersonic.ui.dialog.confirm("", options).then(function(index) {
		  if (index == 0) {
		    queryDeleteVisit.get(visitID, {
			success: function(visitDelete){
		
				visitDelete.destroy({
					success: function(myObject){
						var options = {
							message: "This visit has been deleted.",
							buttonLable: "Close"
						};
						supersonic.ui.dialog.alert("Success!", options).then(function() {
						  supersonic.logger.log("Alert closed.");
						});
						reloadAllData();
					},
					error: function(myObject, error){
						var options = {
							message: "This visit could not be deleted, try again later.",
							buttonLable: "Close"
						};
						supersonic.ui.dialog.alert("Issue Encountered", options).then(function() {
						  supersonic.logger.log("Alert closed.");
						});
					}
				});
			},
			error: function(memberDelete, error){

			}
		});
		  } else {
		    supersonic.logger.log("Alert closed.");
		  }
		});

	}


	// Redundant Code to be deleted???? /////////////////
	/*
	$scope.members = [];
	$scope.allScheduledApps = [];
	
	function loadFamilyMember(){
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){
  				$scope.members.push({ id: famMember.id,
									  name: famMember.get("Name"),
									  icon: famMember.get("iconID"),
									  dateOfBirth: new Date(famMember.get("dateOfBirth")),
									  gender: famMember.get("gender"),
									});
				var scheduled = famMember.relation("scheduledAppointments");
				scheduled.query().find().then(function(scheduledResults){
					for (i = 0; i < scheduledResults.length; i++) {
						$scope.allScheduledApps.push({name: famMember.get("Name"), 
													  results: scheduledResults[i]});
					}
				});
  			});
  			//alert($scope.members.length);
  		});
	};
	loadFamilyMember();*/

	// Query all the icons
	$scope.icons = [];
	$scope.icons.push({ url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Dad.png",
						name: "dad"});
	$scope.icons.push({	url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Boy.png",
						name: "boy"
						});
	$scope.icons.push({	url: src="https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Mom.png",
						name: "mom"});
	$scope.icons.push({	url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Girl.png",
						name: "girl_1"});
	$scope.icons.push({	url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Girl2.png",
						name: "girl_2"});
	$scope.icons.push({	url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Grandma.png",
						name: "grandma"});
	$scope.icons.push({ url: "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Dog.png",
						name: "dog"});

	$scope.urlPass = "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Dad.png"; //initializing to default icon
	$scope.getIconTitle = function(url,index){
		//alert("Icon selected! Click Add Member to save.");
		$scope.urlPass = url;
		$scope.selectedRow = index;
	}
	
	// Preliminary Add Family Member function

	function addFamilyRelation(name, dateOfBirth, gender){
		var familyRelations = currentUser.relation("familyMember");
		var familyMember = new FamilyMember();

		familyMember.set("Name", name);
		familyMember.set("dateOfBirth", dateOfBirth);
		familyMember.set("gender", gender);
		familyMember.save();

	    familyRelations.add(familyMember);
	    currentUser.save();
	}

	
	//Add a family member
	$scope.addFamilyMember = function(){
		var familyRelations = currentUser.relation("familyMember");
		var familyMember = new FamilyMember();
		familyMember.set("Name", $scope.newMember.name);
		//var validDate = ($scope.newMember.dateOfBirth | date: "yyyy-MM-dd")
		familyMember.set("dateOfBirth", $scope.newMember.birthdate);
		familyMember.set("gender", $scope.newMember.gender);
		familyMember.set("iconID", $scope.urlPass);
		familyMember.set("ignoredAppointments", []);

		familyMember.save().then(function(familyMember) {
				familyRelations.add(familyMember);
	    			currentUser.save();
				var options = {
				  message: $scope.newMember.name +  " has been added to your family",
				  buttonLabel: "Close"
				};
				reloadAllData();

				supersonic.ui.dialog.alert("Success!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});
				supersonic.ui.layers.pop();
				//location.reload();
				}, function(error) {
					alert("Member save failed");
				// the save failed.
				});

	};
	

	//Add a past scheduled event - I DON'T THINK THIS IS ANYWHERE.
	/*
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
	}*/


	// edit scheduled
	$scope.editScheduledAppointment = function(visitID, appointmentName, famMember, location, doctor, date, typeDoc){
		//alert(appointmentName +" "+ famMember.get("Name")+ " " + location + " " + doctor + " " + date);
		var famMemberID = famMember.id;
		var editDateObject = new Date(date);
		var extractTime = editDateObject.toTimeString().split(' ')[0]
		var yyyy = editDateObject.getFullYear().toString();
		var mm = (editDateObject.getMonth() + 1).toString();
		var dd = editDateObject.getDate().toString();
		var myParams = {params: {editVisitID: visitID, newAppointmentName: appointmentName, famMemberToAddToForRecommended: famMemberID, newAppointmentLocation: location, newAppointmentDoctor: doctor, newAppointmentDate: date, docType: typeDoc}};
		var view = new supersonic.ui.View("livypad#editUpcomingVisit");
		supersonic.ui.layers.push(view,myParams);
	}

	//Add a doctor to particular family member
	$scope.addDoctor = function(){
		var queryMember = new Parse.Query(FamilyMember);
		queryMember.get($scope.previewId, {
		  success: function(familyMember) {
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



	//LOADING scheduled and suggested appointments DATA FOR WHOLE FAMILY....On Initial load///////////////////////////////////////////////


	$scope.suggestedAppointmentList = [];
	$scope.allScheduledAppointmentList = [];
	$scope.allFamilyMembers = [];
	var sorted = [];
	$scope.chunkedMembers = [];

	loadFamilyData();
	function loadFamilyData(){	
		var allFamilyMemberRelations = currentUser.relation("familyMember");
  		allFamilyMemberRelations.query().find().then(function(familyMemberResults){
  			familyMemberResults.forEach(function(famMember){

			    //preparing to exclude existing appointments, also filling in the scheduled appointment list at the same time.
			    loadFamilyMemberExistingAppointments(famMember).then(function(result){ //NEED TO ensure this finishes populating before you call the next function! It won't break but it relies on this being filled to filter out appointments that don't exist yet.
				
			    	var numExistingAppointments = result;

			    	//looking through all suggested appointments to find relevant ones
			    	loadFamilyMemberSuggestedAppointments(famMember).then(function(result){
			    		var numSuggestedAppointments = result;
			    		var percentage = 0.0;
						if ((numExistingAppointments + numSuggestedAppointments) != 0) {
							percentage = Math.round(numExistingAppointments/(numSuggestedAppointments + numExistingAppointments)*100);
						}

			    		$scope.allFamilyMembers.push({ familyMember: famMember,
	  									  id : famMember.id,
										  name: famMember.get("Name"),
										  iconID: famMember.get("iconID"),
										  dateOfBirth: famMember.get("dateOfBirth"),
										  gender: famMember.get("gender"),
										  scheduled: numExistingAppointments,
										  suggested: numSuggestedAppointments,
										  percent: percentage,
										  numSuggestedAppointments : numSuggestedAppointments,
										  numExistingAppointments : numExistingAppointments,
										});
			    		sorted = $scope.allFamilyMembers.sort(compare);
			    		$scope.chunkedMembers = chunk(sorted, 2);
  					});

			    });
			    
			}); 
			    
		
  		});
  	};

  	   function compare(a,b) {
	  if (a.dateOfBirth < b.dateOfBirth)
	    return -1;
	  if (a.dateOfBirth > b.dateOfBirth)
	    return 1;
	  return 0;
	}

	function chunk(arr, size) {
	  var newArr = [];
	  for (var i=0; i<arr.length; i+=size) {
	    newArr.push(arr.slice(i, i+size));
	  }
	  return newArr;
	}


	$scope.allScheduledAppointmentWithHistory = [];
	$scope.allVisitHistory = [];
  	function loadFamilyMemberExistingAppointments(famMember){
  		return new Promise(function(resolve, reject) {
		   	var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");
			famMemberScheduledAppointmentRelation.query().find().then(function(scheduledAppointmentResults){
				$scope.numExistingAppointments=scheduledAppointmentResults.length;
				//alert("infunc" + $scope.numExistingAppointments);
				var counter = 0;
				scheduledAppointmentResults.forEach(function(famMemberScheduledAppointment){
					var dateLastScheduled = famMemberScheduledAppointment.get("dateScheduled");
					var currentDate = new Date();
					
					$scope.allScheduledAppointmentWithHistory.push({ nameOfAppointment : famMemberScheduledAppointment.get("name"),
														   doctor : famMemberScheduledAppointment.get("doctor"),
														   doctorType : famMemberScheduledAppointment.get("doctorType"),
														   location : famMemberScheduledAppointment.get("location"),
														   dateScheduled : famMemberScheduledAppointment.get("dateScheduled"),
														   recommendedNextDate : famMemberScheduledAppointment.get("recommendedNextDate"),
														   nameOfFamilyMember : famMember.get("Name"),
														   famMemberID : famMember.id,
														});
					//test to see if the appointment is in the future, if so, add it, else, don't.
					if (dateLastScheduled >currentDate){
						//filling in the all scheduled appointment list
						counter ++;
						$scope.allScheduledAppointmentList.push({ id: famMemberScheduledAppointment.id,
														   nameOfAppointment : famMemberScheduledAppointment.get("name"),
														   doctor : famMemberScheduledAppointment.get("doctor"),
														   doctorType : famMemberScheduledAppointment.get("doctorType"),
														   location : famMemberScheduledAppointment.get("location"),
														   dateScheduled : famMemberScheduledAppointment.get("dateScheduled"),
														   recommendedNextDate : famMemberScheduledAppointment.get("recommendedNextDate"),
														   nameOfFamilyMember : famMember.get("Name"),
														   famMember : famMember,
														   famMemberID : famMember.id,
														});
					} else {
						$scope.allVisitHistory.push({ 	   id: famMemberScheduledAppointment.id,
														   nameOfAppointment : famMemberScheduledAppointment.get("name"),
														   doctor : famMemberScheduledAppointment.get("doctor"),
														   doctorType : famMemberScheduledAppointment.get("doctorType"),
														   location : famMemberScheduledAppointment.get("location"),
														   dateScheduled : famMemberScheduledAppointment.get("dateScheduled"),
														   recommendedNextDate : famMemberScheduledAppointment.get("recommendedNextDate"),
														   nameOfFamilyMember : famMember.get("Name"),
														   famMember : famMember,
														   famMemberID : famMember.id,
														});
					}
				});
				resolve(counter);
				$scope.allScheduledAppointmentListSorted = $scope.allScheduledAppointmentList.sort(dateOrder);
			});
			
		});

  	};
  	function dateOrder(a,b) {
	  if (a.dateScheduled < b.dateScheduled)
	    return -1;
	  if (a.dateScheduled > b.dateScheduled)
	    return 1;
	  return 0;
	}


	function loadFamilyMemberSuggestedAppointments(famMember){
		return new Promise(function(resolve, reject) {
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
		    //constraining it so it's only the livypad suggested appointments, and the ones created by the user
		    querySuggestedAppointments.containedIn("author",["livypad", currentUser.id]);
		    var counter = 0;
			querySuggestedAppointments.find().then(function(suggestedAppointmentResults){

				suggestedAppointmentResults.forEach(function(famMemberSuggestedAppointment){

					//getting data of this suggested appointment
				  	var lowerBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[0];
				  	var upperBound = famMemberSuggestedAppointment.get("relevantAgeGroup")[1];
				  	var relevantGender = famMemberSuggestedAppointment.get("relevantGender");
				  	var nameOfSuggestedAppointment = famMemberSuggestedAppointment.get("name");
				  	var frequency = famMemberSuggestedAppointment.get("frequency");
				  	var specialAgeArray = famMemberSuggestedAppointment.get("specialAges");
					var specificFamMemberArray = famMemberSuggestedAppointment.get("SpecificMembers");

					var padding = 2; //adding padding to the months
					lowerBound = Math.max(0,lowerBound); //ruling out negative numbers
					
					//check to see if age is among special ages
					var specialAgeMarker = specialAgeArray.indexOf(ageInMonths);
					
					var currentDate = new Date();

					//test to see if user chose to ignore appointment for this fam member. The last ignored date must be within the same year for it to count
					//var ignoredAppointmentMarker = appointmentsToIgnore.indexOf(famMemberSuggestedAppointment.id);
					var searchTermIgnore = famMemberSuggestedAppointment.id;
					var ignoredAppointmentMarker = -1;
					
					for(var j = 0; j < appointmentsToIgnore.length; j++) {
					    if (appointmentsToIgnore[j].appointmentID === searchTermIgnore && appointmentsToIgnore[j].dateAtWhichToUnignore > currentDate) {
					        ignoredAppointmentMarker = 1;
					        //alert(" here! " + searchTermIgnore);
					        break;
					    }
					}
					

					//test to see if appointment already exists, by name
					//if appointment exists, check for next date...
					var searchTerm = nameOfSuggestedAppointment;
					var existingAppointmentMarker = -1;

					var currentDateScheduled = null;
					var recommendedNextDate = new Date(0);

					var currentRecommendedDate = null;
					var mostRecentScheduledDate = new Date(0);
					 
					var dateLastScheduled = "no prior information";
					for(var i = 0; i < $scope.allScheduledAppointmentWithHistory.length; i++) {
					    if ($scope.allScheduledAppointmentWithHistory[i].nameOfAppointment.toLowerCase() === searchTerm.toLowerCase() && $scope.allScheduledAppointmentWithHistory[i].famMemberID === famMember.id) {
					        existingAppointmentMarker = i;
					        currentRecommendedDate = $scope.allScheduledAppointmentWithHistory[i].recommendedNextDate;
					        currentDateScheduled = $scope.allScheduledAppointmentWithHistory[i].dateScheduled;
					        if (mostRecentScheduledDate < currentDateScheduled){
					        	mostRecentScheduledDate = currentDateScheduled;
								dateLastScheduled = mostRecentScheduledDate.toDateString(); //picking the most recent date
					        } 
					        if (recommendedNextDate < currentRecommendedDate){
					        	recommendedNextDate = currentRecommendedDate; // picking the latest recommendation,
					        }
					        //alert(" here! " + recommendedNextDate);
					    }
					   // break;
					}

					//calculating days left till you should have a next appointment...
					var recommendation = "";
					var daysLeft = 0;
					
					if (recommendedNextDate.getFullYear() > 1971){ //this happens if there is a valid recommended next date
						var _MS_PER_DAY = 1000 * 60 * 60 * 24;
						var utc1 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
						var utc2 = Date.UTC(recommendedNextDate.getFullYear(), recommendedNextDate.getMonth(), recommendedNextDate.getDate());
						daysLeft = Math.floor((utc2 - utc1) / _MS_PER_DAY);
						//alert("days left" + daysLeft + " for " + nameOfSuggestedAppointment + " for " + famMember.get("Name"));
						if(daysLeft<0){
							recommendation = "You should have scheduled this " + Math.abs(daysLeft) + " days ago! ";
						}else{
							recommendation = "schedule within the next " + daysLeft + " days! "; //also should see if it's negative, then you need to change the phrasing
						}										
					} else if (frequency == 0){ //test for invalid frequency, or maybe it's just once...
						recommendation = "consult your doctor";
					} else {
						recommendation = "schedule it now!";
					}

					//test to see if recommended for specific fam member;
					var specificMemberMarker = specificFamMemberArray.indexOf(famMember.id);
					if (specificFamMemberArray.length ==0){
						specificMemberMarker = 1;
					}

					//test for relevant appointments, maybe check if days left < 30? for more pressing appointments...
				  	if ( ((ageInMonths >= lowerBound - padding && ageInMonths <=upperBound + padding) || specialAgeMarker > -1)
				  		&& (gender.toLowerCase()==relevantGender.toLowerCase() || relevantGender == "all")
				  		&& (existingAppointmentMarker == -1 || mostRecentScheduledDate < currentDate) //the appointment does not exist and the most recent existing appointment has passed //
				  		&& ignoredAppointmentMarker == -1
				  		&& daysLeft <= 180
				  		&& specificMemberMarker != -1) //the days left test ensures that only suggested appointments in the next 180 days show up...
				  	{
				  		counter += 1; //keeping track of number, for later use.
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
				  			frequencyString = "consult your doctor";
				  		}else if (frequency ==12) {
				  			frequencyString = "yearly";
				  		}else{
				  			frequencyString = "once every " + formatMonthsToString(frequency);
				  		};
				  		 
				  		 //Adding strings and information to scope
				  		$scope.suggestedAppointmentList.push({  appointmentID : famMemberSuggestedAppointment.id,
				  												famMember : famMember,
				  												famMemberID: famMember.id,
				  												famMemberName: famMember.get("Name"), 
															 	nameOfAppointment: famMemberSuggestedAppointment.get("name"),
															 	doctorType : famMemberSuggestedAppointment.get("doctorType"),
															 	lowerBound : lowerBoundAgeString,
															 	upperBound : upperBoundAgeString,
																keyAges: keyAgeString,
																frequency: frequencyString,
																frequencyNum: frequency,
																recommendedNextDate : recommendation,
																dateLastScheduled: dateLastScheduled,
																appointment : famMemberSuggestedAppointment,
															});

						var famMemberSuggestedAppointmentRelation = famMember.relation("suggestedAppointments");
						//maybe clear all relations first?
						famMemberSuggestedAppointmentRelation.add(famMemberSuggestedAppointment);
						famMember.save();	
				  	};

				});
				resolve(counter);
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


	//FUNCTIONS FOR RECOMMENDED VISITS ///////////////////////////////////////////////////////

	//variable for showing history:

	$scope.showHistory = false;

	$scope.showRecommended = false;

	$scope.showUpcoming = true;

    $scope.gotoBottom = function() {
      // set the location.hash to the id of
      // the element you wish to scroll to.
		$scope.showRecommended = !$scope.showRecommended;
		
    };


	//Scheduling new recommended appointment 
	$scope.scheduleRecommendedAppointment = function(appointmentName,famMember,frequency,doctorType){
		//alert("scheduled " + appointmentName + " appointment for " + famMember.get("Name"));
		var famMemberID = famMember.id;
		var myParams = {params: {newAppointmentName: appointmentName, famMemberToAddToForRecommended: famMemberID, recommendedFrequency:frequency, typeOfDoctor:doctorType}};
		var view = new supersonic.ui.View("livypad#addRecommendedEventToGCalandLivyPad");
		supersonic.ui.layers.push(view,myParams);
	}

	//ignoring recommendation
	//variable to toggle the ignore button
	$scope.showIgnore = false;
	$scope.ignoreTimeLength ={"getLength" : 12} ;
	$scope.ignoreReccomendation = function(appointment, famMember){
		
		
		var ignoreLengthInMonths = parseInt($scope.ignoreTimeLength.getLength , 10);
		var dateAtWhichToUnignore = new Date();
		dateAtWhichToUnignore.setMonth(dateAtWhichToUnignore.getMonth() + ignoreLengthInMonths);

		var arrayOfIgnoredAppointments = famMember.get("ignoredAppointments");

		var markerForExistingIgnoredAppointment = -1;
		for(var i = 0; i < arrayOfIgnoredAppointments.length; i++) {
		    if (arrayOfIgnoredAppointments[i].appointmentID == appointment.id) {
		    	markerForExistingIgnoredAppointment = i;
		    	arrayOfIgnoredAppointments[i].dateAtWhichToUnignore = dateAtWhichToUnignore;
		        break;
		    }
		}

		alert("ignored this appointment till " + dateAtWhichToUnignore.toDateString());

		if (markerForExistingIgnoredAppointment == -1){
			famMember.addUnique("ignoredAppointments", {appointmentID: appointment.id, dateAtWhichToUnignore: dateAtWhichToUnignore});
			famMember.save(null, {
			  success: function(newSuggestedAppointment) {
			    //alert('Successfully saved!');
			    reloadAllData();
			  },
			  error: function(newSuggestedAppointment, error) {
			    
			  }
			});
		} else {
			famMember.set("ignoredAppointments",arrayOfIgnoredAppointments);
			famMember.save(null, {
			  success: function(newSuggestedAppointment) {
			    //alert('Successfully saved!');
			    reloadAllData();
			  },
			  error: function(newSuggestedAppointment, error) {
			  }
			});
		}
		
	}

	//FUNCTIONS FOR ADDING CUSTOM RECOMMENDED VISIT ///////////////////////////////////////////////////////

	//initializing
	$scope.newUserAddedRecommendation= {"newTitle": "", "category":"screen", "frequency" : 0, "lower":0, "upper":130, "specialOne":0, "specialTwo":0,"relevantGender":"all","timeUnit":"years"} ;
	$scope.timeUnitArray = ["years", "months"];
	$scope.addNewRecommendedVisit = function (){
		var doctor = "";
		var doctorType = "";
		doctor = document.getElementById("doctor").value;
        doctorType = document.getElementById("doctorType").value;
		var arrayOfSpecialAges = [];
		if ($scope.newUserAddedRecommendation.specialOne != 0){
			arrayOfSpecialAges.push($scope.newUserAddedRecommendation.specialOne * 12);
		}
		if ($scope.newUserAddedRecommendation.specialTwo != 0){
			arrayOfSpecialAges.push($scope.newUserAddedRecommendation.specialTwo * 12);
		}
		var suggestedFrequency = $scope.newUserAddedRecommendation.frequency;
		if($scope.newUserAddedRecommendation.timeUnit == "years"){
			var suggestedFrequency = suggestedFrequency * 12;
		}
		var lowerBoundMonths = $scope.newUserAddedRecommendation.lower * 12;
		var upperBoundMonths = $scope.newUserAddedRecommendation.upper * 12;

		var newSuggestedAppointment = new SuggestedAppointment();
        newSuggestedAppointment.set("name", $scope.newUserAddedRecommendation.newTitle);
		newSuggestedAppointment.set("doctor", doctor);
		newSuggestedAppointment.set("doctorType", doctorType);
        newSuggestedAppointment.set("type", $scope.newUserAddedRecommendation.category);
        newSuggestedAppointment.set("frequency", suggestedFrequency);
        newSuggestedAppointment.set("relevantAgeGroup", [lowerBoundMonths,upperBoundMonths]);
        newSuggestedAppointment.set("specialAges", arrayOfSpecialAges);
        newSuggestedAppointment.set("relevantGender", $scope.newUserAddedRecommendation.relevantGender);
    	newSuggestedAppointment.set("author", currentUser.id);
    	newSuggestedAppointment.set("SpecificMembers", $scope.selectedFamilyMembersToAddRecommendationFor);

        newSuggestedAppointment.save(null, {
		  success: function(newSuggestedAppointment) {
		    alert('Successfully created custom recommended visit!');
		    supersonic.ui.layers.pop();
		  },
		  error: function(newSuggestedAppointment, error) {
		    alert('Failed to create new custom recommended visit, with error code: ' + error.message);
		  }
		});
     
	}

	supersonic.ui.views.current.whenVisible(function(){
  		reloadAllData();
	});

	function reloadAllData(){
		$scope.$apply(function(){
  			$scope.suggestedAppointmentList = [];
			$scope.allScheduledAppointmentList = [];
			$scope.allFamilyMembers = [];
			$scope.chunkedMembers = [];
			$scope.allScheduledAppointmentWithHistory = [];
			$scope.allVisitHistory = [];
			$scope.selectedFamilyMembersToAddRecommendationFor = [];
			loadFamilyData();
  		});
	}
	//adding specific members to the new recommended visit.
	$scope.selectedFamilyMembersToAddRecommendationFor = [];

	$scope.toggleSelection = function (famMemberID) {
	    var idx = $scope.selectedFamilyMembersToAddRecommendationFor.indexOf(famMemberID);

	    // is currently selected, remove item from array.
	    if (idx > -1) {
	      $scope.selectedFamilyMembersToAddRecommendationFor.splice(idx, 1);
	    }
	    // is newly selected
	    else {
	      $scope.selectedFamilyMembersToAddRecommendationFor.push(famMemberID);
	    }
	 };


})

/*    .directive("scroll", function ($window, $document,$timeout) {
        return function(scope, element, attrs) {
            angular.element($window).bind("scroll", function() {
                var height = $document[0].body.offsetHeight - this.innerHeight;
                if(this.pageYOffset >= 300000000){
                    scope.iconstatus = 1;
                    $timeout(function(){
                        scope.iconstatus=0;
                        $window.scrollBy(0,1);
                    },1250);
                    //scope.allFamilyMembers = [];
                    //scope.loadFamilyData();
                    scope.refresh();
                };
            });
        };
    }); */




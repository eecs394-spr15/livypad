livypad.controller("CalendarController", function($scope,supersonic){
        Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
        $scope.iconstatus = 0;
    	 
        //classes
        var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
        var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
        var FamilyMember = Parse.Object.extend("FamilyMember");
        var Doctor = Parse.Object.extend("Doctor");

        // for search
        $scope.keyword = "";
        
        $scope.ScheduledAppointment = [];
	$scope.myCalendar = new JEC('myCalendarContainer',{
     		tableClass: 'styledCalendar',
    		firstMonth: 201205,
		lastMonth: 201605
    	 });
     
        $scope.defineEvents = function(date, description, myID, icon){
       	$scope.myCalendar.defineEvents([
	{
		eventDate: date,
		eventDescription: description,
        eventLink: 'livypad#person', 
        linkData: myID,
        image: icon,
        imageWidth: 25,
        imageHeight: 25
	
	}
	]);
       
       };
       $scope.defineEvents("20120520", "test", "WX2u5JqObs", "https://raw.githubusercontent.com/eecs394-spr15/livypad/master/app/livypad/images/Girl.png");

       
	$scope.refreshCalendar = function(){
	var allFamilyMemberRelations = Parse.User.current().relation("familyMember");
	allFamilyMemberRelations.query().find().then(function(familyMembers){
		familyMembers.forEach(function(familyMember){
			var myname = familyMember.get("Name");
            var myID = familyMember.id;
            var icon = familyMember.get("iconID");
			var visits = familyMember.relation("scheduledAppointments");
			visits.query().find().then(function(visittt){
				visittt.forEach(function(visit){
					var dateScheduled = visit.get("dateScheduled").toISOString();
					var newdateScheduled = dateScheduled.substring(0,4) + dateScheduled.substring(5,7) + dateScheduled.substring(8,10);
					$scope.defineEvents(newdateScheduled, myname, myID, icon);
				
				});
			$scope.myCalendar.showCalendar();
			});
		});
	});
	};

	
	//getting list of family members
        var currentUser = Parse.User.current();
        $scope.refreshCalendar();
	$scope.familyMembersList = [];   
        var allFamilyMemberRelations = currentUser.relation("familyMember");

        supersonic.ui.views.current.params.onValue(function(values){
             //for when scheduling from suggested
            $scope.newAppointmentName = values.newAppointmentName;
            $scope.famMemberToAddToForRecommended = values.famMemberToAddToForRecommended;
            $scope.recommendedFrequency = values.recommendedFrequency;
             //for edit a scheduled visit
            $scope.newAppointmentLocation = values.newAppointmentLocation;
            $scope.newAppointmentDoctor = values.newAppointmentDoctor;
            $scope.newAppointmentDate = values.newAppointmentDate;
            $scope.editVisitID = values.editVisitID;

            var editDateObject = new Date($scope.newAppointmentDate);
            $scope.newDate = editDateObject
            
             //for when adding GCal event to Livypad
            $scope.eventSummary = values.eventSummary;
            $scope.eventLocation = values.eventLocation;
            $scope.eventDate=new Date(values.startTime);
            $scope.startTime = new Date(values.startTime);
            $scope.endTime=new Date(values.endTime);
        });


        allFamilyMemberRelations.query().find().then(function(familyMemberResults){
            //initializing forms for adding events
            $scope.familyMemberToAddTo = familyMemberResults[0].id;
            $scope.famMemberToAddTo = familyMemberResults[0].id;
            familyMemberResults.forEach(function(famMember){
                $scope.familyMembersList.push({name: famMember.get("Name"),
                                                famMember:famMember,
                                                famMemberID:famMember.id,
                                            });

             });

        });
        
        //Google Calendar Authorization
        var clientId = '1095443679190-ma099501sii38seo2v6jcoten1h5g77e.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';
        $scope.refresh = function(){
        location.reload();
         }
        
        $scope.handleClientLoad = function() {
            window.setTimeout(checkAuth,1);
        };

        function checkAuth() {
            gapi.auth.authorize({client_id: clientId, 
            					scope: scopes, 
            					immediate: true}, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            var authorizeButton = document.getElementById('authorize-button');
            if (authResult && !authResult.error) {
            	authorizeButton.style.display = 'none';
                //authorizeButton.style.visibility = 'hidden';
                loadCalendarApi();
            } else {
                authorizeButton.style.visibility = '';
                authorizeButton.onclick = handleAuthClick;
            }
        }

        function handleAuthClick(event) {
            // Step 3: get authorization to use private data
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        }

        function loadCalendarApi() {
            gapi.client.load('calendar', 'v3', loadPastEvents);
           	gapi.client.load('calendar', 'v3', loadUpcomingEvents);
        }

        $scope.pastEvents = [];
        function loadPastEvents(){
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMax': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            });

            request.execute(function(resp) {
                supersonic.logger.log(resp);
                var events = resp.items;
                for (var i = 0; i < events.length; i++){
                    var dateOfEvent = new Date(events[i].start.dateTime);
                    var startTime = dateOfEvent.toTimeString().split(' ')[0];
                    var endingTimeDate = new Date(events[i].end.dateTime);
                    var endTime = endingTimeDate.toTimeString().split(' ')[0];
                    $scope.pastEvents.push({summary: events[i].summary,
                                            location: events[i].location,
                                            date: dateOfEvent.toDateString(),
                                            startTime: startTime,
                                            endTime: endTime,
                                            startTimeObject : events[i].start.dateTime,
                                            endTimeObject: events[i].end.dateTime}) ;
                }
                
            });
        }
        $scope.upcomingEvents = [];
        function loadUpcomingEvents(){
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            });

            request.execute(function(resp) {
                supersonic.logger.log(resp);
                var events2 = resp.items;

                for (var i = 0; i < events2.length; i++){
                    var dateOfEvent = new Date(events2[i].start.dateTime);
                    var startTime = dateOfEvent.toTimeString().split(' ')[0];
                    var endingTimeDate = new Date(events2[i].end.dateTime);
                    var endTime = endingTimeDate.toTimeString().split(' ')[0];
                    $scope.upcomingEvents.push({summary: events2[i].summary,
                                            location: events2[i].location,
                                            date: dateOfEvent.toDateString(),
                                            startTime: startTime,
                                            endTime: endTime,
                                            startTimeObject : events2[i].start.dateTime,
                                            endTimeObject: events2[i].end.dateTime}) ;
                }

            });
        }



        //edit scheduled visit
        $scope.saveChangeToScheduledVisit = function(){
            var options = {
                            message: "This change will only be made in Livypad. Do you still want to change this upcoming visit?",
                            buttonLabels: ["Yes", "No"]
                            };

            supersonic.ui.dialog.confirm("", options).then(function(index) {
                if (index == 0) {
                    var doctor = "";
                    var summary = "";
                    var location = "";
                    summary = document.getElementById("summary").value;
                    location = document.getElementById("Location").value;
                    var dateTime = document.getElementById("date").value;
                    doctor = document.getElementById("doctor").value;
                    var startTime = document.getElementById("startTime").value;
                   // var endTime = document.getElementById("endTime").value;
                    var currentDate = new Date();
                    var offset = currentDate.getTimezoneOffset() / 60;
                    /*alert(dateTime);
                    alert(startTime);
                    alert(endTime);
                    alert("offset:" + offset);*/
                    var startDateTime =dateTime+"T"+startTime + ":00.000-0"+offset+":00";
                    //var endDateTime = dateTime+"T"+endTime + ":00.000-0"+offset+":00";

                    //calculating end date object based on duration.
                    var duration = parseInt(document.getElementById("duration").value);
                    var endDateObject = new Date(startDateTime);
                    endDateObject.setHours(endDateObject.getHours() + duration);
                    var extractedEndingTime =  endDateObject.toTimeString().split(' ')[0];
                    //getting the ending date in string yyyy-mm-dd format
                    var yyyy = endDateObject.getFullYear().toString();
                    var mm = (endDateObject.getMonth()+1).toString(); // getMonth() is zero-based
                    var dd  = endDateObject.getDate().toString();
                    var endDateString = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
                    var endDateTime = endDateString+"T"+extractedEndingTime + ".000-0"+offset+":00";

                    var dateObject = new Date(startDateTime);
                    var recommendedNextDate = new Date(0);

                    var queryEditVisit = new Parse.Query(ScheduledAppointment);
                    queryEditVisit.get($scope.editVisitID,{
                        success: function(editVisit){
                            //alert(editVisit.get("name"));
                            editVisit.set("name", summary);
                            editVisit.set("doctor", doctor);
                            editVisit.set("location", location);
                            editVisit.set("dateScheduled", $scope.newDate);
                            editVisit.set("recommendedNextDate", recommendedNextDate);
                            editVisit.save(null, {
                                success: function(editVisit){
                                    var options = {
                                    message: "Changes have been successfully saved to Livypad.",
                                    buttonLabels: "Close"
                                    };
                                    supersonic.ui.dialog.alert("Success!", options).then(function() {
                                      supersonic.logger.log("Alert closed.");
                                    });
                                    supersonic.ui.layers.pop();
                                },
                                error: function(editVisit,error){
                                    alert("Save failed, try again later.");
                                    supersonic.ui.layers.pop();
                                }
                            });
                        },
                    });
                } else {
                     supersonic.logger.log("Alert closed.");
                     supersonic.ui.layers.pop();
                }
            });
           
        }


        //initializing duration
        $scope.defaultDuration = 1;
        $scope.addEventToGCalAndLivyPad = function(){
            var doctor = "";
            var summary = "";
            var location = "";
            summary = document.getElementById("summary").value;
            location = document.getElementById("Location").value;
            var dateTime = document.getElementById("date").value;
            doctor = document.getElementById("doctor").value;
            var startTime = document.getElementById("startTime").value;
           // var endTime = document.getElementById("endTime").value;
            var currentDate = new Date();
            var offset = currentDate.getTimezoneOffset() / 60;
            /*alert(dateTime);
            alert(startTime);
            alert(endTime);
            alert("offset:" + offset);*/
            var startDateTime =dateTime+"T"+startTime + ":00.000-0"+offset+":00";
            //var endDateTime = dateTime+"T"+endTime + ":00.000-0"+offset+":00";

            //calculating end date object based on duration.
            var duration = parseInt(document.getElementById("duration").value);
            var endDateObject = new Date(startDateTime);
            endDateObject.setHours(endDateObject.getHours() + duration);
            var extractedEndingTime =  endDateObject.toTimeString().split(' ')[0];
            //getting the ending date in string yyyy-mm-dd format
            var yyyy = endDateObject.getFullYear().toString();
            var mm = (endDateObject.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = endDateObject.getDate().toString();
            var endDateString = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
            var endDateTime = endDateString+"T"+extractedEndingTime + ".000-0"+offset+":00";

            var dateObject = new Date(startDateTime);
            var recommendedNextDate = new Date(0);

            //Adding to GCAL
            var resource = {
                "summary": summary,
                "location": location,
                "start": {
                    "dateTime": startDateTime
                },
                "end": {
                    "dateTime": endDateTime
                }
            };
            
            var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': resource
                    });
            request.execute(function(resp) {
                    alert("successfully added into your calendar!");
                    
            });

            //Adding to Parse
            var queryFamMemberToAddTo = new Parse.Query(FamilyMember);
            queryFamMemberToAddTo.get($scope.famMemberToAddTo, {
              success: function(famMember) {
                //alert(famMember.get("Name"));
                var newAppointment = new ScheduledAppointment();
                newAppointment.set("name", summary);
                newAppointment.set("doctor", doctor);
                newAppointment.set("location", location);
                newAppointment.set("dateScheduled", dateObject);
                newAppointment.set("recommendedNextDate", recommendedNextDate);
                var scheduledAppointmentRelation = newAppointment.relation("familyMember");           
                scheduledAppointmentRelation.add(famMember);
                var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");  
                newAppointment.save().then(function(newAppointment) {
                    famMemberScheduledAppointmentRelation.add(newAppointment);
                    famMember.save();
                });
              },
              error: function(object, error) {
                alert("could not add new visit");
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
              }
            });
            
        };

        $scope.loadGCalAppointment = function(summary, location, startDateTime, endDateTime){
            var myParams = {params: {eventSummary: summary, eventLocation: location, startTime:startDateTime, endTime:endDateTime}}; 
            
	        var view = new supersonic.ui.View("livypad#addGCalEventToLivyPad");
            supersonic.ui.layers.push(view,myParams);
        };

        $scope.addGCalEventToLivyPad = function(){
            var summary = "";
            var doctor = "";
            var location = "";
            summary = document.getElementById("summary").value;
            location = document.getElementById("Location").value;
            var dateTime = document.getElementById("date").value;
            doctor = document.getElementById("doctor").value;
            var startTime = (document.getElementById("startTime").value).slice(0,5);
            var endTime = (document.getElementById("endTime").value).slice(0,5);
            var currentDate = new Date();
            var offset = currentDate.getTimezoneOffset() / 60;
            var startDateTime =dateTime+"T"+startTime + ":00.000-0"+offset+":00";
            var endDateTime = dateTime+"T"+endTime + ":00.000-0"+offset+":00";
            var dateObject = new Date(startDateTime);
            //alert("month: " +dateObject.getMonth());
            var recommendedNextDate = new Date(0);
            //adding to relations
            var queryFamMemberToAddTo = new Parse.Query(FamilyMember);
            queryFamMemberToAddTo.get($scope.familyMemberToAddTo, {
              success: function(famMember) {
                var newAppointmentTwo = new ScheduledAppointment();
                newAppointmentTwo.set("name", summary);
                newAppointmentTwo.set("doctor", doctor);
                newAppointmentTwo.set("location", location);
                newAppointmentTwo.set("dateScheduled", dateObject);
                
                newAppointmentTwo.set("recommendedNextDate", recommendedNextDate);
                var scheduledAppointmentRelation = newAppointmentTwo.relation("familyMember");           
                scheduledAppointmentRelation.add(famMember);
                var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");  
                newAppointmentTwo.save().then(function(newAppointmentTwo) {
                    famMemberScheduledAppointmentRelation.add(newAppointmentTwo);
                    famMember.save();
                    alert("successfully added Event to Livypad");
                });
              },
              error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
              }
            });
        };

        $scope.addRecommendedEventToGCalAndLivyPad = function(){
            var recommendedFrequency = parseInt($scope.recommendedFrequency,10);
            var invalidFrequency = false;
            if (recommendedFrequency == 0){
                invalidFrequency =true;
            }
            var location = "";
            var doctor = "";
            var summary = "";
            summary = document.getElementById("summary").value;
            location = document.getElementById("Location").value;
            var dateTime = document.getElementById("date").value;
            doctor = document.getElementById("doctor").value;
            var startTime = document.getElementById("startTime").value;
            //var endTime = document.getElementById("endTime").value;
            var currentDate = new Date();
            var offset = currentDate.getTimezoneOffset() / 60;
            /*alert(dateTime);
            alert(startTime);
            alert(endTime);
            alert("offset:" + offset);*/
            var startDateTime =dateTime+"T"+startTime + ":00.000-0"+offset+":00";
            //var endDateTime = dateTime+"T"+endTime + ":00.000-0"+offset+":00";
            
            //calculating end date object based on duration.
            var duration = parseInt(document.getElementById("duration").value);
            var endDateObject = new Date(startDateTime);
            endDateObject.setHours(endDateObject.getHours() + duration);
            var extractedEndingTime =  endDateObject.toTimeString().split(' ')[0];
            //getting the ending date in string yyyy-mm-dd format
            var yyyy = endDateObject.getFullYear().toString();
            var mm = (endDateObject.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = endDateObject.getDate().toString();
            var endDateString = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
            var endDateTime = endDateString+"T"+extractedEndingTime + ".000-0"+offset+":00";



            //calculating the recommended next date
            var startDateObject = new Date(startDateTime);
            var recommendedNextDate = new Date(startDateTime);
           
            var startMonth = recommendedNextDate.getMonth();
            recommendedNextDate.setMonth(recommendedNextDate.getMonth() + recommendedFrequency);

            //testing for invalid dates/ invalid frequency
            if (recommendedNextDate.getMonth() != ((startMonth + recommendedFrequency) % 12)){
                recommendedNextDate.setDate(0);
            }
            if (invalidFrequency){
                //alert("invalid frequency");
                recommendedNextDate = new Date(0);
            }
    

            //adding to GCAL
            var resource = {
                "summary": summary,
                "location": location,
                "start": {
                    "dateTime": startDateTime
                },
                "end": {
                    "dateTime": endDateTime
                }
            };
            
            var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': resource
                    });
            request.execute(function(resp) {
                    // alert("successfully added into your calendar!");
                    
                    });


            //Adding to Parse
            var queryFamMemberToAddTo = new Parse.Query(FamilyMember);
            queryFamMemberToAddTo.get($scope.famMemberToAddToForRecommended, {
              success: function(famMember) {
                //alert(famMember.get("Name"));
                var newAppointment = new ScheduledAppointment();
                newAppointment.set("name", summary);
                newAppointment.set("doctor", doctor);
                newAppointment.set("location", location);
                newAppointment.set("dateScheduled", startDateObject);
                newAppointment.set("recommendedNextDate", recommendedNextDate);
                var scheduledAppointmentRelation = newAppointment.relation("familyMember");           
                scheduledAppointmentRelation.add(famMember);
                var famMemberScheduledAppointmentRelation = famMember.relation("scheduledAppointments");  
                newAppointment.save().then(function(newAppointment) {
                    famMemberScheduledAppointmentRelation.add(newAppointment);
                    famMember.save();
                });

                var options = {
                  message: "New visit has been successfully added.",
                  buttonLabel: "Close"
                };

                supersonic.ui.dialog.alert("Success!", options).then(function() {
                  supersonic.logger.log("Alert closed.");
                });
                supersonic.ui.layers.pop();
              },
              error: function(object, error) {
                alert("Could not add this to Livypad database");
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
              }
            });
          
  
        };


})


    .directive("scroll", function ($window, $document,$timeout) {
        return function(scope, element, attrs) {
            angular.element($window).bind("scroll", function() {
                var height = $document[0].body.offsetHeight - this.innerHeight;
                if(this.pageYOffset <= 0){
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
    });

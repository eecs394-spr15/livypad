livypad.controller("CalendarController", function($scope,supersonic){
        Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
     
    	 
        //classes
        var ScheduledAppointment = Parse.Object.extend("ScheduledAppointments");
        var SuggestedAppointment = Parse.Object.extend("SuggestedAppointments");
        var FamilyMember = Parse.Object.extend("FamilyMember");
        var Doctor = Parse.Object.extend("Doctor");

        $scope.ScheduledAppointment = [];
	var scheduledQuery = new Parse.Query(ScheduledAppointment);
	scheduledQuery.find().then(function (results){
			results.forEach(function(result){
			   $scope.ScheduledAppointment.push({
			       date:result.get("dateScheduled"),
			       name:result.get("name")
			   });
			
			});
	});
	 var myCalendar = new JEC('myCalendarContainer',{
     		tableClass: 'styledCalendar'
     
    	 });
     
     /*myCalendar.defineEvents([
       { 
         eventDate: 20150519, 
         eventDescription: '394 meeting', 
         eventLink: 'http://www.cs.northwestern.edu/academics/courses/394/'
       }]);
     myCalendar.defineEvents([
       { eventDate: 20150520, 
       eventDescription: 'client meeting' ,
       eventLink: 'http://www.cs.northwestern.edu/academics/courses/394/'
       }
     ]);
     */
     	angular.forEach($scope.ScheduledAppointment, function(value, key){
		myCalendar.defineEvents([
		{
		  eventDate: 20150519,
		  eventDescription: 'test'
		}
		]);
	
	});
     	myCalendar.showCalendar();


	//getting list of family members
        var currentUser = Parse.User.current();
        $scope.familyMembersList = [];   
        var allFamilyMemberRelations = currentUser.relation("familyMember");

        supersonic.ui.views.current.params.onValue(function(values){
            
            $scope.currentEvent = values.id;

             //document.getElementById("test").innerHTML =  values.id;
            // = $scope.currentEvent;
            //$scope.currentLocation = values.location;
        });

        allFamilyMemberRelations.query().find().then(function(familyMemberResults){
            familyMemberResults.forEach(function(famMember){
                
                $scope.familyMembersList.push({name: famMember.get("Name"),
                                                famMember:famMember,
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
                $scope.pastEvents = events;
            });
        }

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
                $scope.upcomingEvents = events2;
            });
        }

        $scope.addEventToGCalAndLivyPad = function(){
            var summary = document.getElementById("summary").value;
            var location = document.getElementById("Location").value;
            var dateTime = document.getElementById("date").value;
            var doctor = document.getElementById("doctor").value;
            var resource = {
                "summary": summary,
                "location": location,
                "start": {
                    "dateTime": dateTime+"T10:00:00.000-07:00"
                },
                "end": {
                    "dateTime": dateTime+"T12:00:00.000-07:00"
                }
                
            };
            var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': resource
                    });
            request.execute(function(resp) {
                    alert("successfully added into your calendar!");
                    
                    });
            
            var newAppointment = new ScheduledAppointment();
            newAppointment.set("name", summary);
            newAppointment.set("doctor", doctor);
            newAppointment.set("location", location);
            //newAppointment.set("dateScheduled", dateTime);
            //adding to relations
            var scheduledAppointmentRelation = newAppointment.relation("familyMember");           
            scheduledAppointmentRelation.add($scope.familyMemberToAddTo);
            var famMemberScheduledAppointmentRelation = $scope.familyMemberToAddTo.relation("scheduledAppointments");  
            newAppointment.save().then(function(newAppointment) {
                famMemberScheduledAppointmentRelation.add(newAppointment);
                //saving
                $scope.familyMemberToAddTo.save();
            });
                     
        };

        $scope.scheduleAppointmentFromGCal = function(summary, location, startDateTime, endDateTime){


        };
});

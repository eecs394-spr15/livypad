livypad.controller("CalendarController", function($scope,supersonic){


        var clientId = '1095443679190-ma099501sii38seo2v6jcoten1h5g77e.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';

        
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

        $scope.postEvent = function(){
            document.getElementById("test").innerHTML = document.getElementById("date").value;
            var resource = {
                "summary": document.getElementById("summary").value,
                "location": document.getElementById("Location").value,
                "start": {
                    "dateTime": document.getElementById("date").value+"T10:00:00.000-07:00"
                },
                "end": {
                    "dateTime": document.getElementById("date").value+"T12:00:00.000-07:00"
                }
                
            };
            var request = gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': resource
                    });
            request.execute(function(resp) {
                    alert("successfully added into your calendar!");
                    
                    });  

        };

        $scope.scheduleAppointmentFromGCal = function(summary, location, startDateTime, endDateTime){


        };
});
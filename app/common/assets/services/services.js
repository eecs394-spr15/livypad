angular.module('services',[])
    .factory('gCal',function(){
        var calFactory = {};

        calFactory.authorize = function() {
            var config = {
                'client_id': '1095443679190-ma099501sii38seo2v6jcoten1h5g77e.apps.googleusercontent.com',
                'scope': 'https://www.googleapis.com/auth/calendar',
                'immediate': 'true'
            };
            gapi.auth.authorize(config, function () {
                return gapi.client.load('calendar', 'v3')
            });
        };

        return calFactory;
});

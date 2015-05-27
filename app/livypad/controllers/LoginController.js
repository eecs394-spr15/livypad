livypad.controller("LoginController", function($scope,supersonic){

	Parse.initialize("1NREN2oBv02mpf2qMWSJMDdjxrlAFXklHLhMvaWo", "2pG9AFjrxmusIhuWDZcjUSsG8Rp4DueWQQNOVE1a");
	//Parse.User.logOut();

	$scope.refresh = function(){
		location.reload();
	}

	$scope.confirmSignUp = function(){
			var user = new Parse.User();
			user.set("username", $scope.newUser.username);
			user.set("password", $scope.newUser.password);
			//user.set("email", $scope.newUser.email);
			//user.set("phone",  $scope.newUser.phone);
			user.signUp(null, {
			success: function(user) {
				supersonic.ui.initialView.dismiss();
				var options = {
				  message: "You successfully signed up!",
				  buttonLabel: "Close"
				};

				supersonic.ui.dialog.alert("Success!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});
			},
			error: function(user, error) {
				// Show the error message somewhere and let the user try again.

				var options = {
				  message: error.code + " " + error.message,
				  buttonLabel: "Close"
				};

				supersonic.ui.dialog.alert("Error!", options).then(function() {
				  supersonic.logger.log("Alert closed.");
				});

			}
		});
	}

	$scope.dismissInit = function(){
		supersonic.ui.initialView.dismiss();
	}

	$scope.login = function(){
		Parse.User.logOut();
		//alert("entered function");
		Parse.User.logIn($scope.existingUser.username, $scope.existingUser.password, {
				success: function(user) {
					user.save(null, {
						success: function(user) {
						supersonic.ui.dialog.alert("Welcome to livypad, " + $scope.existingUser.username + "!");
						supersonic.ui.initialView.dismiss();
						}
					});
				},
				error: function( error) {
				    var options = {
					  message: "Log In Failed.",
					  buttonLabel: "Close"
					};

					supersonic.ui.dialog.alert("Error", options).then(function() {
					 supersonic.logger.log("Alert closed.");
					});
			  }
			});
	}


	$scope.skiplogin = function (){
		supersonic.ui.dialog.alert("Welcome, guest!");
		supersonic.ui.initialView.dismiss();
	};

	$scope.signup = function (){
		var view = new supersonic.ui.View("livypad#signup");
		supersonic.ui.layers.push(view);
	
	};
});

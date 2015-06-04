# Livypad

Livypad is a medical reminder system that is synched to your Google calendar. It analyzes your family's demographic, and recommends appointments based on their gender and age, using data from the US Health Human Services. It allows you to keep track of your upcoming and past appointments. Unlike existing calendaring systems, our product also provides smart notifications when the time period between your last visit and subsequent scheduled visit is greater than the recommended time frame.

## System Requirements
1.	[Appgyver-Supersonic](http://www.appgyver.com/supersonic) 
2.	[AngularJS](https://angularjs.org/) 
3.	[Parse](https://parse.com/) 
4.	iOS 8.0.0+


## Download and Installation

1.  [Install the Steroids Command-Line Interface](http://www.appgyver.com/steroids/getting_started) and follow the installation wizard, selecting iOS for the target platform, Supersonic for the framework, and the operating system that you use.  You may need to install other programs and command line interfaces throughout the installation process. 
2.  [Clone the GitHub repo](https://github.com/eecs394-spr15/livypad.git)
3.  Open your command line (terminal on Mac OS, cmd on Windows) and navigate to the directory where you cloned the GitHub repo to.
4.  While in this directory (.../livypad) run: ```steroids update```
5.  Then, to start the app run: ```steroids connect```
6.  After starting the app, your browser should open and navigate to a page with a QR code.  To use this code, [download the iOS app]( https://itunes.apple.com/us/app/appgyver-scanner/id575076515?mt=8) or run the [iOS simulator](http://docs.appgyver.com/tooling/cli/emulators/ios-simulator/)
7.  Scan the QR code in your browser with the app.

## Deploying to the Cloud

Cloud deployment allows you to share your work with others, without the need for them to download and install your code.

1.  After step 6 in Download and Installation, your browser should be displaying the QR code to scan.  At the top of this page, navigate to the "Cloud" tab.
2.  Click "Deploy to Cloud" (if this doesn't work, you may need stop the app using "q" on the command line, then deleting cloud.json from the config folder in the livypad directory ".../livypad/config" and then restart the app by running: steroids connect)
3.  Click "Open Cloud Share Page"
4.  You can use this url to share with others.  The user must have the appgyver scanner iOS app in order to scan the QR code and use your app.

## Deploying an Ad Hoc build

1.	You may also deploy the app as an Ad Hoc build, [using these instructions](http://docs.appgyver.com/tooling/build-service/build-settings/building-a-debug-build/).

## Google API Access
-  The functions to access Google Calendar functions are located in
  * app/livypad/controllers/CalendarController.js
  * app/common/assets/services/services.js
-  When performing authorization for your own version of the app, [register your app with Google Developers Console](https://developers.google.com/google-apps/calendar/auth). Then replace the clientID in the abovementioned files with your own clientID.

## Using the Parse.com Backend
-  The application currently uses Parse.com as a backend. This database is initialized in Livypad with a Parse.initialize() call at the start of each controller, with the appID and the javascript key. 
-  You can refer to the [documentation for Parse](https://parse.com/docs/js/guide) to see how to interact with the database.
-  In order to support your own Parse.com backend, set up your own [Parse.com account](https://parse.com/). 
-  Replace the Parse.initialize() call at the start of each controller with your own javascript key. NOTE: Do not use the master key!
-  Do note that you will have to set up the fields and classes exactly as Livypad backend is set up in order for the code to work.

##Platform Constraints
1. For Deployment
  -
  -
  -
2. For Development
  -
  -
  -

## Known Bugs and Limitations
*
*
*
*

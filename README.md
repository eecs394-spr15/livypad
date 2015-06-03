# Livypad

Livypad is a medical reminder system that is synched to the native calendar and informs users of upcoming or missing appointments recommended by the US Health Human Services.  Unlike existing calendaring systems, our product provides smart notifications when the last and subsequent visit are greater than the recommended time frame.

## Download and Installation

1.  Install the Steroids Command-Line Interface and follow the installation wizard, selecting iOS for the target platform, Supersonic for the framework, and the operating system that you use.  You may need to install other programs and command line interfaces throughout the installation process.
2.  Clone the GitHub repo at: https://github.com/eecs394-spr15/livypad.git
3.  Open your command line (terminal on Mac OS, cmd on Windows) and navigate to the directory where you cloned the GitHub repo to.
4.  While in this directory (.../livypad) run: steroids update
5.  Then, to start the app run: steroids connect
6.  After starting the app, your browser should open and navigate to a page with a QR code.  To use this code, download the iOS app at: https://itunes.apple.com/us/app/appgyver-scanner/id575076515?mt=8 or run the iOS simulator (installation directions: http://docs.appgyver.com/tooling/cli/emulators/ios-simulator/)
7.  Scan the QR code in your browser with the app.

## Deploying to the Cloud

Cloud deployment allows you to share your work with others, without the need for them to download and install your code.

1.  After step 6 in Download and Installation, your browser should be displaying the QR code to scan.  At the top of this page, navigate to the "Cloud" tab.
2.  Click "Deploy to Cloud" (if this doesn't work, you may need stop the app using "q" on the command line, then deleting cloud.json from the config folder in the livypad directory ".../livypad/config" and then restart the app by running: steroids connect)
3.  Click "Open Cloud Share Page"
4.  You can use this url to share with others.  The user must have the appgyver scanner iOS app in order to scan the QR code and use your app.

## Google API Access

## Using the Parse.com Backend

## Known Bugs and Limitations

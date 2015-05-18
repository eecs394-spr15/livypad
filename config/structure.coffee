# Read more about app structure at http://docs.appgyver.com

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  tabs: [
    {
      title: "Home"
      id: "index"
      location: "livypad#index" # Supersonic module#view type navigation
    }
    {
      title: "Calendar"
      id: "settings"
      location: "livypad#calendar"
    }
    {
      title: "List"
      id: "internet"
      location: "livypad#list" # URLs are supported!
    }
  ]

  # rootView:
  #   location: "livypad#index"

 # preloads: [
   # {
     # id: "learn-more"
    #  location: "example#learn-more"
    #}
    #{
     # id: "using-the-scanner"
      #location: "example#using-the-scanner"
    #}
  #]

  drawers:
    left:
      id: "leftDrawer"
      location: "drawer#drawer"
      showOnAppLoad: false
    options:
      animation: "swingingDoor"
      
  
   initialView:
     id: "initialView"
     location: "livypad#login"

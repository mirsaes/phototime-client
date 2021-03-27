NOT SURE IF USING ANGULAR OR STICKING WITH JQUERY MOBILE..
Tried angular and it was tedious with building, etc, so instead updated jquery and using javascript modules

design via jquery mobile
- application state is stored in window object (and some persisted in local storage)
- each page loads all assets required (should be same for every page)
  - no longer doing this, need to revisit links and refresh for other than main page
- before page renders, it loads the data to be available to initialize the view
- reload of page doesn't work as it would need to store/load all of the application state

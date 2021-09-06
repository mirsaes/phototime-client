# phototime-client
PhotoTime Client- fun time, photo time, cleaning house, making stuff

# Features
* connect to multiple "phototime" servers
* rate photos
* delete photos
* crop photos (basic)
* tag photos (basic)

# Getting Started
PhotoTime Client is a webapp for usage with the [PhotoTime Server](https://github.com/mirsaes/phototime-server)

Docker Usage
* Create or copy docker/docker-compose.yml
* Create .env file (similar to sample.env)
  * Data directory
    * directory to store generated thumbs and "trash"
    * PHOTOTIME_DATA_DIR=C:\\PhotoTime
  * Photo Repo
    * location of the photo repo to serve up
    * PHOTOTIME_REPO1_DIR=C:\\PathTo\\MyPictures
* docker-compose up -d
* navigate to http://lanip:8080/webapp
* start rating, tagging, cropping your photos

To serve multiple repositories, either run multiple instances of mirsaes/phototime, each with different repo configured, or bind your configuration override with multiple repositories specified into the single instance.

# Roadmap
* raw image support
  * basic thumb/view
  * basic editing (via xmp)
    * rating
    * cropping
    * tagging

# Known Issues
* 2021.09.05
  * After crop, new file is not visible until refresh

# Version History
* 2021.03.27 - your it
  * WIP tagging support
  * add or remove tags from jpg images
* 2021.03.13 - makin' croppies
  * WIP initial cropping support
  * select crop ratio, crop
  * needs navigation improvements, button icons, probably a bunch of other stuff
  * upgraded jquery and jquery mobile
  * converted to modules
  * navigation appears to have some bugs with timing

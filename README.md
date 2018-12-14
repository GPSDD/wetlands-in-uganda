# wetlands-in-uganda
A webviewer to monitor wetlands in Uganda :earth_africa:

The work on this web viewer is supported by the Global Partnership for Sustainable Development (GPSDD) in partnership with the World Bank through the Trust Fund for Statistical Capacity Building (TFSCB)

The code provided here has been developed by DHI GRAS A/S, using free and open tools from a number of sources. This includes the Google Polymer Project and Leaflet for producing web-maps, as well as code by DHI GROUP (www.dhigroup.com). 
The website also relies on other external services, e.g. for serving out the wetland raster map as well as the region polygons. In the current implementation, this is done using GeoServer, but this can be replaced by any software serving out raster data according to the WMS-protocol. 

An live version of the platform can be found at http://uganda-wetlands.dhigroup.com/

# How to use the code from this repository

Inside the DHI-Elements-projects folder you’ll find the three different pages. These sites use various bower components, and various DHI elements which are available in their corresponding folders. The site uses a config.json for basic settings, where ‘tabs’ refer to the three different web pages. 


# Vulcanizing
You need to have nodejs installed.

Then in some Windows shell run vulcanize-commands.cmd:

DHI Web Components:
1. Vulcanize
2. Update All
3. Install Polymer and Elements
4. Install Bower and Vulcanize
5. Vulcanize Current Project

To get things running you need
   Install node.js from http://nodejs.org/
   Install Git from http://git-scm.com/download/win.

Make your choice.
Make sure to install Bower, Vulcanize, Polymer and Elements and then Vulcanize Current Project will vulcanize our index.html into vulcanized.

Note: the install scripts will also pull 100s of bower_components. Make sure not to add them to the repo.”

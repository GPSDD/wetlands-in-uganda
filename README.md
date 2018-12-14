# wetlands-in-uganda

A webviewer to monitor wetlands in Uganda :earth_africa:

The work on this web viewer is supported by the Global Partnership for Sustainable Development (GPSDD) in partnership with the World Bank through the Trust Fund for Statistical Capacity Building (TFSCB)

Developed by DHI GRAS, leveraging Google Polymer and LeafletJS for producing web-maps, as well as code by [DHI](www.dhigroup.com).
The website also relies on other external services, e.g. for serving out the wetland raster map as well as the region polygons.
In the current deployment, this is done using GeoServer, but this can be replaced by any software serving out raster data according to the WMS-protocol.

[Live version of the platform](http://uganda-wetlands.dhigroup.com/)

# Code structure

Inside the `dhi_elements_projects` folder you’ll find the three different pages. These sites use various Bower components, and various DHI elements which are available in their corresponding folders. The site uses a `config.json` for basic settings, where "tabs" refer to the three different web pages.

# Vulcanization

To get things running you will need to

- Install node.js from http://nodejs.org/
- Install Git from http://git-scm.com/download/win.

Make sure to install Bower, Vulcanize, Polymer, and Elements.

Then in some Windows shell run

```cmd
$ vulcanize-commands.cmd
```

The choice `Vulcanize Current Project` will vulcanize our `index.html` into `vulcanized/`.

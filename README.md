# Repository Contents 

## Applet
- RCD_plugin.html is a draft of a mapping plugin that can be added to RCDs' websites. It will display a single RCD's boundaries, and markers for projects for which that RCD is the Primary RCD. When clicked on, the pop-ups will link to the website of that project. For now, this applet is hard-corded with information for Gold Ridge RCD. The intention is that this plugin will eventually make use of the RCD Project Tracker's web services and dynamically update. 

## Data 
(The JSON and JS files contain the same information. The JS files are what the .html file actually uses, but the JSON files are easier to view clickably in the browser.)
- GoldRidge_projects - all of the Projects assigned to Gold Ridge RCD (downloaded from the RCD Project Tracker's web services)
- RCD_Boundaries2 - GeoJSON that gives the boundaries of all RCDs

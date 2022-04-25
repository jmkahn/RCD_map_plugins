# Repository Contents 

## Applets
- RCD_plugin.html is an initial draft of a plugin that can be added to RCDs' websites. It displays a single RCD's boundaries and markers of projects that have taken place within that RCD's boundaries. When clicked on, it links to the website of that project. For now, this applet is hard-corded with information for Gold Ridge RCD. The intention is that this will eventually make use of the RCD Project Tracker's web services and dynamically update. 

## Data 
(The JSON and JS files should contain the same information. The JS files are what are actually used by the .html files, but the JSON files are easier to view clickably in the browser.)
- GoldRidge_projects - all of the Projects assigned to Gold Ridge RCD (downloaded from the RCD Project Tracker's web services)
- RCD_Boundaries2 - GeoJSON that gives the boundaries of all RCDs

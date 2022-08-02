let base_url = 'https://www.rcdprojects.org/WebServices/GetProjectsByOrganization/JSON/bcdb2d4b-5d7a-4e25-b2e2-7634453c80e8/';

/**
 * boundingBox returns lat/lon coordinates of the most extreme NW and SE points of an irregular polygon
 * @param coord_array - array of boundary points where each entry is a [long, lat] coordinate 
 * usage: boundingBox(single_rcd_boundary.geometry.coordinates[0]);
 */
 function boundingBox(coord_array){
    // sort by latitudes descending to find smallest/largest lat
    let sorted_coords = coord_array.slice().sort(function(a, b){return b[1] - a[1]});
    let north_bound = sorted_coords[0][1];
    let south_bound = sorted_coords[sorted_coords.length - 1][1];

    // do the same with longitudes
    sorted_coords.sort(function(a, b){return b[0] - a[0]});
    let east_bound = sorted_coords[0][0];
    let west_bound = sorted_coords[sorted_coords.length - 1][0];

    return [[north_bound, west_bound], [south_bound, east_bound]];
}
/**
 * Function for generating a text file URL containing given text
 * source: https://www.linuxscrew.com/javascript-write-to-file
 * @param {string} rcd_name 
 * @param {string} organization_ID 
 * @param {string} color 
 * @param {LatLngBounds} current_map_extent - Leaflet LatLngBounds object
 * @returns 
 */
function print_map_code(rcd_name, organization_ID, color, current_map_extent){
    let map_extent_array = [[current_map_extent.getNorth(), current_map_extent.getEast()], [current_map_extent.getSouth(), current_map_extent.getWest()]];
    output_code = `<!DOCTYPE html>
    <head>
        <meta charset="utf-8" />
        <!-- include Leaflet CSS file in the head of document -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />

        <style>
            /* define the height of the map element
            USERS: Change this if you want to resize the map */
            #RCD_map {
                height: 360px;
                width: 480px;
            }
        </style>

        <!-- include Leaflet (map) library -->
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin=""></script>

        <!-- load the boundaries for all RCDs
        The file is hosted on Github Gist, but getting the content from https://statically.io/ -->
        <script type="text/javascript" src="https://cdn.statically.io/gist/jmkahn/6533a7e7eb4b2f3994881892dae9dae8/raw/1800f19f8b2a61a978d559e7df418f8feec69429/RCD_Boundaries.js"></script>
        <script type="text/javascript" src="functions.js"></script>
        
    </head>

    <body>
        <div id="RCD_map">
            <script>
            let RCD_boundaries = JSON.parse(RCD_Boundaries2);
            
            function filter_by_name(RCD_boundaries, name){
                for (let i = 0; i < RCD_boundaries.features.length; i++){
                    if (RCD_boundaries.features[i].properties.RCDNAME==name){ 
                        return RCD_boundaries.features[i]
                    }
                };
            }

            let single_RCD_boundary = filter_by_name(RCD_boundaries, "${rcd_name}");

            var RCD_map = L.map('RCD_map'); 

            //add base layer 
            var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamthaG4xNjE4IiwiYSI6ImNsNXZvMnZ3OTBibGYzY3A0cDAwOGhudDYifQ.S7Iz_lKck91Rx9L2mxBNlg', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(RCD_map);

            // add the desired RCD boundary to map 
            var rcd_boundary = L.geoJSON(single_RCD_boundary, {style: {color: "${color}"}}).addTo(RCD_map); 
            RCD_map.fitBounds([[${map_extent_array[0]}], [${map_extent_array[1]}]]);

            function render_project_data(organization_ID){
                let url = "${base_url}" + "${organization_ID}"; 

                fetch(url)
                .then(response => response.json())
                .then(projects => draw_project_markers(projects))
            }
            function find_project_center(projects){
                let lats = 0; 
                let lngs = 0;
                let num_projects = 0; 
                for (let i=0; i<projects.length; i++){
                    if (["Planning/Design", "Implementation", "Post-Implementation", "Completed"].includes(projects[i].Stage)){
                        if (projects[i].Latitude && projects[i].Longitude){
                            lats += projects[i].Latitude; 
                            lngs += projects[i].Longitude; 
                            num_projects++; 
                        }
                    }
                }
                return L.latLng({lng: lngs/num_projects, lat: lats/num_projects});
            }
            function draw_project_markers(projects){
                let project_center = find_project_center(projects); 
                let all_project_points = []; 
                for (let i = 0; i < projects.length; i++){
                    let latlng; 
                    let popup_content = '<p style="font-size:12px;"><a href= https://www.rcdprojects.org' + projects[i].ProjectDetailUrl + ' target="_blank">' + projects[i].ProjectName+ '</a></p> <p style="font-size:10px;">'+ projects[i].ProjectDescription;
                    // don't use projects in proposal/deferred stage (not public)
                    if (["Planning/Design", "Implementation", "Post-Implementation", "Completed"].includes(projects[i].Stage)){
                        if (projects[i].Latitude && projects[i].Longitude){
                            latlng = [projects[i].Latitude, projects[i].Longitude];
                        }else{
                            // assign projects without a location a point around the center of the project region 
                            let jitters = [0.06*(Math.random() - 0.5), 0.12*(Math.random() - 0.5)]; //lng jitter is twice as big bc there are twice as many degrees for lng
                            latlng = [project_center.lat + jitters[0], project_center.lng + jitters[1]];  
                            popup_content = popup_content + '</p><p style="font-style:italic">(True Location hidden) </p>';
                        }
                    all_project_points.push(L.marker(latlng).bindPopup(popup_content));
                    }
                }
                // make layer group of all projects
                all_projects = L.featureGroup(all_project_points).addTo(RCD_map);
            }

            render_project_data(${organization_ID}); 
            </script>
        </div> 
    </body>`;

    var textFileUrl = null;
    let fileData = new Blob([output_code], {type: 'text/plain'});
    // If a file has been previously generated, revoke the existing URL
    if (textFileUrl !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    textFileUrl = window.URL.createObjectURL(fileData);
    window.open(textFileUrl, '_blank');
    return textFileUrl;

}

/**
 * filter_by_name returns the GeoJSON for a single RCD from the full set of RCD boundaries 
 * @param {} RCD_boundaries - the Object variable with all the RCD Boundary data, from RCD_Boundaries.js
 * @param {string} name - the RCD boundary you want 
 * @returns a Feature of the desired RCD (includes geometry and properties)
 */ 
function filter_by_name(RCD_boundaries, name){
    for (let i = 0; i < RCD_boundaries.features.length; i++){
        if (RCD_boundaries.features[i].properties.RCDNAME==name){ 
            return RCD_boundaries.features[i]
      }
    };
}

/**
 * render_RCD_boundary draws the selected RCD boundary on the map defined in render_basemap  
 * @param {string} RCD_name - which RCD we want to draw
 */
function render_RCD_boundary(RCD_name){
    let RCD_Boundaries = JSON.parse(RCD_Boundaries2); 
    let single_RCD_boundary = filter_by_name(RCD_Boundaries, RCD_name); 

    // add the desired RCD boundary to map 
    current_boundary = L.geoJSON(single_RCD_boundary).addTo(mapReference); // global scope
    return single_RCD_boundary; 
}

/**
 * update the color of the RCD boundary
 * @param {string} color: 6 digit color code 
 */
function set_boundary_color(color){
    current_boundary.setStyle({color: color});
}

/**
 * Removes old RCD boundary from map, draws a new one, and flies to the location of the new boundary
 * @param {string} RCD_name: string with the RCD name, as displayed in RCD_Boundaries 
 * @param {string} color: 6 digit color code (eg "ff5588")
 */
function update_RCD_boundaries(RCD_name, color){

    if (typeof current_boundary !== 'undefined') {
        mapReference.removeLayer(current_boundary);
    }    
    let rcd_boundary = render_RCD_boundary(RCD_name);
    set_boundary_color(color); 

    let RCD_coord_array = rcd_boundary.geometry.coordinates[0];

    // need to do this because Cachuma RCD is made of multiple disjoint polygons
    if (RCD_name == "Cachuma"){
        var coords = rcd_boundary.geometry.coordinates;
        RCD_coord_array = coords[0][0].concat(coords[1][0], coords[2][0], coords[3][0]);
    }
    mapReference.flyToBounds(boundingBox(RCD_coord_array)); 
}

function render_basemap(){
    
    //keep a reference to the map so that we can modify it easier later
    L.Map.addInitHook(function () {
        mapReference = this; //global scope
      });

    const california_bounding_box = [[42.128, -125.341], [32.877, -113.84]]
    var RCD_map = L.map('RCD_map').fitBounds(california_bounding_box); 

    //add base layer 
    var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamthaG4xNjE4IiwiYSI6ImNsNXZvMnZ3OTBibGYzY3A0cDAwOGhudDYifQ.S7Iz_lKck91Rx9L2mxBNlg', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1 
    }).addTo(RCD_map);
}

/** 
 *  @param {string} organization_ID - numeric string indicating the url of the projects 
 */
function update_project_data(organization_ID){

    console.log(organization_ID);
    //clear old project markers before showing new ones 
    if (typeof all_projects !== 'undefined') {
        mapReference.removeLayer(all_projects);
    }    
    return render_project_data(organization_ID);
}

function render_project_data(organization_ID){
    let url = base_url + organization_ID; 

    //asynch function
    return fetch(url)
    .then(response => response.json())
    .then(projects => draw_project_markers(projects));
}

function draw_project_markers(projects){
    let project_center = find_project_center(projects); 
    let all_project_points = []; 
    for (let i = 0; i < projects.length; i++){
        let latlng; 
        let popup_content = '<p style="font-size:12px;"><a href= https://www.rcdprojects.org' + projects[i].ProjectDetailUrl + ' target="_blank">' + projects[i].ProjectName+ '</a></p> <p style="font-size:10px;">'+ projects[i].ProjectDescription;
        // don't use projects in proposal/deferred stage (not public)
        if (["Planning/Design", "Implementation", "Post-Implementation", "Completed"].includes(projects[i].Stage)){
            if (projects[i].Latitude && projects[i].Longitude){
                latlng = [projects[i].Latitude, projects[i].Longitude];
            }else{
                // assign projects without a location a point around the center of the project region 
                let jitters = [0.06*(Math.random() - 0.5), 0.12*(Math.random() - 0.5)]; //lng jitter is twice as big bc there are twice as many degrees for lng
                latlng = [project_center.lat + jitters[0], project_center.lng + jitters[1]];  
                popup_content = popup_content + '</p><p style="font-style:italic">(True Location hidden) </p>';
            }
        all_project_points.push(L.marker(latlng).bindPopup(popup_content));
        }
    }
    // make layer group of all projects
    all_projects = L.featureGroup(all_project_points).addTo(mapReference);
    mapReference.flyToBounds(all_projects.getBounds()); 
}

/**
 * returns the mean lat/lng value for projects with a location  
 * @param {JSON} projects 
 * returns a Leaflet LatLng object 
 */ 
function find_project_center(projects){
    let lats = 0; 
    let lngs = 0;
    let num_projects = 0; 
    for (let i=0; i<projects.length; i++){
        if (["Planning/Design", "Implementation", "Post-Implementation", "Completed"].includes(projects[i].Stage)){
            if (projects[i].Latitude && projects[i].Longitude){
                lats += projects[i].Latitude; 
                lngs += projects[i].Longitude; 
                num_projects++; 
            }
        }
    }
    return L.latLng({lng: lngs/num_projects, lat: lats/num_projects});
}

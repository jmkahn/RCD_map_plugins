var output_code = `<!DOCTYPE html>

<head>
    <meta charset="utf-8" />
    <!-- include Leaflet CSS file in the head of document -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />

    <style>
        /* define the height of the map element
        USERS: Change this if you want to resize the map */
        #RCD_map {
            height: 360px;
            width: 450px
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

        let single_RCD_boundary = filter_by_name(RCD_boundaries, ${rcd_name});

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
        var rcd_boundary = L.geoJSON(single_RCD_boundary, {style: {color: ${color}}}).addTo(RCD_map); 
        RCD_map.fitBounds(rcd_boundary.getBounds());

        function render_project_data(organization_ID){
            let url = 'https://qa.rcdprojects.org/WebServices/GetProjectsByOrganization/JSON/bcdb2d4b-5d7a-4e25-b2e2-7634453c80e8/' + ${organization_ID}; 
            //TODO: change to production when that goes online

            fetch(url)
            .then(response => response.json())
            .then(data => format_json(data))
            .then(projects => draw_project_markers(projects))
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
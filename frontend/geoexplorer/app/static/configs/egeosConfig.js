{
   "geoStoreBase":"http://84.33.2.25/geostore/rest/",
   "proxy":"/proxy/proxy?url=",
   "refreshTimeInterval": 10,
   "timeVisualizationPosition": "position:relative;left:60px;top:10px;background-color:#0055BB;color:#FFFFFF;font-size: 12px;",
   "projection": "EPSG:900913",
   "maxExtent": [
			-50000.00, 6300000.00,
			3000000.00, 3800000.00
		],
   "bounds": [
			-50000.00, 6300000.00,
			3000000.00, 3800000.00
		],
   "units": "m",
   "startTime": "2010-12-24T00:00:00.000Z",
   "endTime":   "2010-12-24T23:59:00.000Z",
   "timeUnits": "Minutes",
   "timeStep": 15,
   "timeFrameRate": 5,
   
	"backgrounds":[
	{
		"format": "image/jpeg",
		"transparent": false,
		"source": "demo1",
		"group": "background",
		"name": "GeoSolutions:ne_shaded",
		"title": "Nurc Background"
	}
	],
	
	"models":[
	],
   
   "gsSources":{
        "MARISS-Layers": {
            "ptype": "gxp_wmssource",
            "title": "MARISS", 
            "version": "1.1.1",
            "url": "http://84.33.2.25/geoserver/mariss/ows",
			"layerBaseParams": {
				"TILED": true,
				"TILESORIGIN": "-180,-90" 
			}
        },
		"google": {
			"ptype": "gxp_googlesource"
		}
   },
   "layers":[
		{
			"source": "MARISS-Layers",
			"title": "SAR-imagery",
			"name": "TEM_QL__1P_mosaic",
			"displayInLayerSwitcher": true,
			"tiled": true
		},
		{
			"source": "MARISS-Layers",
			"title": "SAR-imagery-footprints",
			"name": "TEM_QL__1P_mosaic_idx",
			"displayInLayerSwitcher": true,
			"tiled": true
		},
		{
			"source": "MARISS-Layers",
			"title": "SHIP-detection",
			"name": "tem_sd__1p",
			"displayInLayerSwitcher": true,
			"tiled": true
		},
		{
			"source": "google",
			"title": "Google Roadmap",
			"name": "ROADMAP",
			"group": "background"
		},{
			"source": "google",
			"title": "Google Terrain",
			"name": "TERRAIN",
			"group": "background"
		},{
			"source": "google",
			"title": "Google Hybrid",
			"name": "HYBRID",
			"group": "background"
		}
	],
	"customTools":[
		{
			"actions": ["->"], 
			"actionTarget": "paneltbar"
		},
		{
			"ptype": "gxp_wfsgrid",
			"id": "featuregrid",
			"container": "panel",
			"outputTarget": "south",
			"wfsURL": "http://84.33.2.25/geoserver/mariss/wfs",
			"featureType": "TEM_QL__1P_mosaic_idx",
			"zoomToTooltip": "zoom to AOI",
			"projection": "EPSG:4326",
			"fieldForSort": "time",
			"sortDirection": "DESC",
			"fields": [
			  {
				"name": "geometry",            
				"mapping": "geometry"
			  },
			  {
				"name": "location",
				"mapping": "properties.location"
			  }, 
			  {
				"name": "time",         
				"mapping": "properties.time"
			  }
			],
			"columnModel": [
				{
					"header": "filename",      
					"dataIndex": "location"
				},
				{
					"header": "time",      
					"dataIndex": "time"
				}
			]
		},
		{
		   "ptype": "gxp_wpsmanager",
		   "id": "wpsSPM",
		   "url": "http://84.33.2.25/geoserver/wps",
		   "geostoreUrl": "http://84.33.2.25/geostore/rest",
		   "geostoreUser": "admin",
		   "geostorePassword": "admin",
		   "geostoreProxy": "/proxy?url=",
		   "target": ""
		},
		{
			"ptype": "gxp_downloadgrid",
			"id": "downloadgrid",
			"container": "panel",
			"outputTarget": "downloadlist"
		}
		
	]
}

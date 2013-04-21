
/**
 *  this class contains info about cruise configurations
 */
var Configuration = function( config, builder ){
	this.builder_ = builder;
	this.config_ = config;
};

Configuration.prototype.setParam = function(name, value){
	this.config_[name]=value;
};

Configuration.prototype.build = function(){
	return this.builder_.toString( this.config_ );
};

/**
 *  this class is a builder for Configuration
 */
var ConfigurationBuilder =  {
	
	
	createVehicleConfiguration: function( selected ){
		var result = '';
		
		for (var i=0; i<selected.length; i++){
			
			var item = selected[i].data;
			
			result += '[';
			result += 'true,';
			result +=  '"' + item.text + '",';
			result +=  '"' + item.url + '",';
			result += 'false';
			result += ']';
			
			if ( i < selected.length - 1){
				result += ', ';
			}
		}
		
		return result;
	},
	
   /**
	* Create a proper gsSources configuration.
	* For each source applies the default config, so 'default' is:
	*
	* 	"default": {
    *       "ptype": "gxp_wmssource",
    *       "version": "1.1.1",
	*		"layerBaseParams": {
	*			"TILED": true,
	*			"TILESORIGIN": "-180,-90" 
	*		}
	*	}
	*
	*/
	createSourcesConfiguration: function(selectedModelsSources, slectedBackgroundsSources, props){
		var size = selectedModelsSources.getCount();
		var records = selectedModelsSources.getRange(0, size);

		var source = {};
		
		//
		// Add models sources as first
		//
		for (var i=0; i<records.length; i++){			
			var item = records[i].data;			
			
			source[item.id] = Ext.applyIf({
				title: item.title,
				url: item.url
			}, props['default']);
		}
		
		size = slectedBackgroundsSources.getCount();
		records = slectedBackgroundsSources.getRange(0, size);
		
	    //
		// Add background sources as second
		//
		for (var i=0; i<records.length; i++){			
			var item = records[i].data;			
			
			var index = selectedModelsSources.find('id', item.id);
			if ( index === -1 ){
				source[item.id] = Ext.applyIf({
					title: item.title,
					url: item.url
				}, props['default']);
			}
		}
		
		var result = Ext.encode( source );
		return result;
	},
	
   /**
	* Create a proper configuration for models and background layers, specifying for each the releated source
	* or the default source according to the 'default' configuration properties. 
	* Something like that:
	*
	*	"modelsProperties": {
	*		"default": {
	*			"format": "image/png8",
	*			"group": "Ocean Models",
	*			"transparent": true,
	*			"visibility": true,
	*			"ratio": 1
	*		},
	*		"nurc:watvelingv": {
	*			"format": "image/png8",
	*			"group": "Ocean Models",
	*			"opacity": 1,
	*			"selected": false,
	*			"title": "Watvel Forecast Model INGV",
	*			"transparent": true,
	*			"visibility": true,
	*			"ratio": 1,
	*			"elevation": 1.472,
	*			"styles": "watvel_marker_ramp"
	*		},
	*		...
	*	}
	*
	*/
	createElementConfiguration: function(default_, props, selected){	
		var result = '';
		var size = selected.length;
		if(size < 1){
			result = Ext.util.JSON.encode(default_);
		}else{
		    result += '[';
			for (var i=0; i<size; i++){
				
				var item = selected[i].data;
				
				//
				// Sets the default configured item corresponding to the item.name or the default one plus the own  selected source
				//
				var defaultParams;
				if(props[ item.name ]){
					defaultParams = Ext.applyIf({source: item.source}, props[ item.name ]);
				}else{
					defaultParams = Ext.applyIf({source: item.source}, props['default']);
				}
				 
				var layer = Ext.applyIf({
					name: item.name,
					title: item.title
				}, defaultParams);
				
				result += Ext.encode( layer );
				
				if ( i < size - 1){
					result += ', ';
				}
			}
			
			result += ']';
		}
		
		return result;
	},
	
	create: function( params ){
		return new Configuration( params, this );
	},
	
	toString: function( params ){
			var conf = new Object;
			conf.name = params.name;
			conf.description = params.name;
			conf.blob = '{ '
						+ '"cruiseName":"'+ params.name + '",'
						+ '"timeRange":["'+ params.timeRange[0] 
								+ '","'+ params.timeRange[1]  + '"],'
					    + '"timeStep":"' + params.timeStep  + '",'
						+ '"timeFrameRate":"' + params.timeFrameRate + '",'
						+ '"timeUnits":"' + params.timeUnits + '",'

			if (params.models){
				conf.blob += '"models":'+ this.createElementConfiguration(params.defaultModels, params.modelsProperties, params.models) + ','
			}
			
			if (params.backgrounds){
				conf.blob += '"backgrounds":'+ this.createElementConfiguration(params.defaultBackgrounds, params.backgroundsProperties, params.backgrounds) + ','
			}
			
			if(params.selectedModelsSources || params.slectedBackgroundsSources){
				//
				// Merge between the the selected source from the models and background groups.
				//
				//var selectedSources = Ext.applyIf(params.selectedModelsSources, params.slectedBackgroundsSources);
				conf.blob += '"gsSources":'+ this.createSourcesConfiguration(params.selectedModelsSources, params.slectedBackgroundsSources, params.sourcesProperties) + ','
			}

			conf.blob += '"watermarkUrl":"'+ params.watermarkUrl + '",';
						
			if ( params.watermarkText && params.watermarkText !== '' ){
				conf.blob += '"watermarkText":"'+ params.watermarkText + '",'
			}
				        
			conf.blob += '"watermarkPosition":"'+ params.watermarkPosition + '",'

						+ '"bounds":['  
						+	params.bounds[0] + ','
						+   params.bounds[1] + ','
						+   params.bounds[2] + ','
						+   params.bounds[3]
						+ '],'

					   + '"vehicleSelector": {' 
					   +	'"data":['
								+ this.createVehicleConfiguration( params.vehicles )
					   + '],'
					   +	'"refreshIconPath": "../theme/app/img/silk/arrow_refresh.png",'  
					   +	'"geoserverBaseURL": "' + params.geoserverBaseUrl + '",'		
					   +	'"gliderPropertyName": "glider_name",'	
					   +	'"cruisePropertyName": "cruise_name",'	
					   +	'"glidersFeatureType": "GlidersTracks",'	
					   +	'"glidersPrefix": "it.geosolutions",'
					   +    '"wfsVersion": "1.1.0"'
					   + '}'					
			
			conf.blob += ' }';					
			conf.owner = 'admin';
			return conf;
	}
};
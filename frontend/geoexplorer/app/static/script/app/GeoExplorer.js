/**
 * Copyright (c) 2009-2011 The Open Planning Project
 */

Ext.USE_NATIVE_JSON = true;

// No shadows for windows, so they can be resized without the need to also
// resize the shadow.
// TODO remove when we have switched to CrumbPanel navigation.
Ext.Window.prototype.shadow = false;

// http://www.sencha.com/forum/showthread.php?141254-Ext.Slider-not-working-properly-in-IE9
// TODO re-evaluate once we move to Ext 4
Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(), s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

(function() {
    // backwards compatibility for reading saved maps
    // these source plugins were renamed after 2.3.2
    Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
    Ext.preg("gx_olsource", gxp.plugins.OLSource);
    Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
    Ext.preg("gx_bingsource", gxp.plugins.BingSource);
    Ext.preg("gx_osmsource", gxp.plugins.OSMSource);
})();

/**
 * api: (define)
 * module = GeoExplorer
 * extends = gxp.Viewer
 */

/** api: constructor
 *  .. class:: GeoExplorer(config)
 *     Create a new GeoExplorer application.
 *
 *     Parameters:
 *     config - {Object} Optional application configuration properties.
 *
 *     Valid config properties:
 *     map - {Object} Map configuration object.
 *     sources - {Object} An object with properties whose values are WMS endpoint URLs
 *
 *     Valid map config properties:
 *         projection - {String} EPSG:xxxx
 *         units - {String} map units according to the projection
 *         maxResolution - {Number}
 *         layers - {Array} A list of layer configuration objects.
 *         center - {Array} A two item array with center coordinates.
 *         zoom - {Number} An initial zoom level.
 *
 *     Valid layer config properties (WMS):
 *     name - {String} Required WMS layer name.
 *     title - {String} Optional title to display for layer.
 */
var GeoExplorer = Ext.extend(gxp.Viewer, {

    // Begin i18n.
    zoomSliderText: "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
    loadConfigErrorText: "Trouble reading saved configuration: <br />",
    loadConfigErrorDefaultText: "Server Error.",
    xhrTroubleText: "Communication Trouble: Status ",
    layersText: "Layers",
    titleText: "Title",
    saveErrorText: "Trouble saving: ",
    
    bookmarkText: "XML Map Context",
    permakinkText: 'XML',
    
    appInfoText: "Credits",
    aboutText: "About GeoExplorer",
    mapInfoText: "Map Info",
    descriptionText: "Description",
    contactText: "Contact",
    aboutThisMapText: "About this Map",
    //viewTabTitle : "View",

    userConfigLoadTitle: "Loading User Context",
    userConfigLoadMsg: "Error reading user map context",
    // End i18n.
    
    /**
     * private: property[mapPanel]
     * the :class:`GeoExt.MapPanel` instance for the main viewport
     */
    mapPanel: null,
    
    toggleGroup: "toolGroup",
    
    mapId: -1,
    
    auth: false,
    
    fScreen: false,

    constructor: function(config, mapId, auth, fScreen) {    
        if(mapId)
            this.mapId = mapId;
        if(auth)
            this.auth = auth;
        if(fScreen){
            this.fScreen = fScreen;
            this.auth = false;
        }
		
        this.mapItems = [
			{
           		xtype: "gxp_mouse_position"
        	},{
                xtype: "gxp_scaleoverlay"
            },{
                xtype: "gx_zoomslider",
                vertical: true,
                height: 100,
                plugins: new GeoExt.ZoomSliderTip({
                    template: this.zoomSliderText
                })
            },{
	            xtype: "gxp_timevisualization",
				position: config.timeVisualizationPosition
	        }
        ];

        // both the Composer and the Viewer need to know about the viewerTools
        // First row in each object is needed to correctly render a tool in the treeview
        // of the embed map dialog. TODO: make this more flexible so this is not needed.
        config.viewerTools = [
            /*{
                leaf: true, 
                text: gxp.plugins.Navigation.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-pan",
                ptype: "gxp_navigation", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 2}
            }, {
                leaf: true, 
                text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip, 
                checked: true, 
                iconCls: "gxp-icon-getfeatureinfo",
                ptype: "gxp_wmsgetfeatureinfo", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 3}
            }, {
                leaf: true, 
                text: gxp.plugins.Measure.prototype.measureTooltip, 
                checked: true, 
                iconCls: "gxp-icon-measure-length",
                ptype: "gxp_measure", 
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 4}
            }, {
                leaf: true, 
                text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-in",
                ptype: "gxp_zoom",
                actionTarget: {target: "paneltbar", index: 5}
            }, {
                leaf: true, 
                text: gxp.plugins.ZoomBox.prototype.zoomInTooltip + " / " + gxp.plugins.ZoomBox.prototype.zoomOutTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoombox-in",
                ptype: "gxp_zoombox",
                toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 6}
            }, {
                leaf: true, 
                text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip, 
                checked: true, 
                iconCls: "gxp-icon-zoom-previous",
                ptype: "gxp_navigationhistory",
                actionTarget: {target: "paneltbar", index: 7}
            }, {
                leaf: true, 
                text: gxp.plugins.ZoomToExtent.prototype.tooltip, 
                checked: true, 
                iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 8}
            }, {
                leaf: true, 
                text: gxp.plugins.FDHGeoCoder.prototype.tooltip, 
                checked: true, 
                ptype: "gxp_fdhgeocoder",
                actionTarget: {target: "paneltbar", index: 9}
            }, {
                leaf: true, 
                text: gxp.plugins.Legend.prototype.tooltip, 
                checked: true, 
                iconCls: "gxp-icon-legend",
                ptype: "gxp_legend",
                actionTarget: {target: "paneltbar", index: 10}
            }, {
                leaf: true,
                text: gxp.plugins.GoogleEarth.prototype.tooltip,
                checked: true,
                iconCls: "gxp-icon-googleearth",
                ptype: "gxp_googleearth",
                actionTarget: {target: "paneltbar", index: 11}
        }*/];

        GeoExplorer.superclass.constructor.apply(this, arguments);
    }, 

    loadConfig: function(config) {

        if(config.isLoadedFromConfigFile){
          this.applyConfig(config);
        } else if ( !this.mapId || this.mapId===-1 ){
			this.prepareConfig( config );
            this.applyConfig(config);
        } else {
            
            var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
            var mHost=pattern.exec(geoStoreBaseURL);

            var mUrl = geoStoreBaseURL + "data/" + this.mapId;

            Ext.Ajax.request({
               url: mHost[2] == location.host ? mUrl : proxy + mUrl,
               method: 'GET',
               scope: this,
               headers:{
                  'Accept': "application/json"
               },
               success: function(response, opts){  
                    var addConfig;                    

                    try {
                      addConfig = Ext.util.JSON.decode(response.responseText);
                    } catch (err) {
						console.error(response);
						console.error('Cannot decode response as JSON because of: ' + err);
                    }
                    
                    if(addConfig){
                        if(addConfig.data){    
                            addConfig = Ext.util.JSON.decode(addConfig.data);
							this.prepareConfig( config, addConfig );
                            this.applyConfig( addConfig );
                        }else{        
							this.prepareConfig( config, addConfig );
                            this.applyConfig( addConfig );
                        }
                    } else {
						this.prepareConfig( config );
                        this.applyConfig(config);
                    }

               },
               failure: function(response, opts){
				  this.prepareConfig( config );
                  this.applyConfig(config);
               }
            });        
        }
    },

	/**
	 *  change dynamically the default configuration depending on custom parameters
	 */
    prepareConfig: function(config, addConfig){
	
		if ( addConfig ){
		    // before merging WMS sources
			addConfig.sources = Ext.applyIf(addConfig.gsSources, config.sources);
			
			// add properties of config if they are not defined in addConfig
			config = Ext.applyIf(addConfig, config);
		}
	
		// add models to layers if defined
		if ( config.models ){
			for (var i=0; i<config.models.length; i++){
				var model = config.models[i];
				config.map.layers.push( model );
				// console.log(model);
			}
			// remove model configuration
			delete config.models;
		}
			
		// add background if any
		if ( config.backgrounds ){
			for (var i=0; i<config.backgrounds.length; i++){
				var bg = config.backgrounds[i];
				config.map.layers.push( bg );
			}
			// remove model configuration
			delete config.backgrounds;
		} 

		if ( config.bounds ){
			config.map.extent = config.bounds;
			config.map.maxExtent = config.bounds;
			delete config.bounds;		
		}
		
		config.tools.unshift(
				{
                ptype:"gxp_playback",
                outputTarget: "paneltbar",
				id: "playback", //MARIS
                playbackMode: "range",
                showIntervals: false,
                labelButtons: true,
                settingsButton: true,
                rateAdjuster: false,
                dynamicRange: false,
                timeFormat: 'l, F d, Y g:i:s A',
                outputConfig: {
                    controlConfig:{
                        step: config.timeStep,
                        units: config.timeUnits,
                        range: config.timeRange,
                        frameRate: config.timeFrameRate
                    }
                }
               }
		   );
		return config;	
	},
    
    loadUserConfig: function(json){
        var uploadWin = Ext.getCmp('upload-win');
        if(uploadWin != null){
            uploadWin.destroy();
        }

        var layerTree = Ext.getCmp('tree');
        layerTree.destroy();
        
        app.destroy();

        var config = Ext.util.JSON.decode(json);
		
        if(config && config.map){
            config.isLoadedFromConfigFile = true;
            app = new GeoExplorer.Composer(config, this.mapId, this.auth, this.fScreen);
        }else{
            Ext.Msg.show({
                title: this.userConfigLoadTitle,
                msg: this.userConfigLoadMsg,
                icon: Ext.MessageBox.WARNING
            });
        }

    },
    
    displayXHRTrouble: function(msg, status) {        
        Ext.Msg.show({
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING
        });        
    },
    
    /** private: method[initPortal]
     * Create the various parts that compose the layout.
     */
    initPortal: function() {
        
        var westPanel = new Ext.TabPanel({
            border: false,
            id:'west',
            region: "west",
            width: 250,
			minWidth: 250,
			maxWidth: 250,
            split: true,
            collapsible: true,
            collapseMode: "mini",
			activeTab:0,
            header: false,
            items: [
                {
					region: 'center', 
					autoScroll: true, 
					tbar: [], 
					border: false, 
					id: 'tree', 
					title: this.layersText
				},
                {
                    region: 'south', xtype: "panel", 
					autoScroll:true,
                    border: false, height: 200, id: 'legend', title:'Legend'
                }
            ]
        });		
		var eastPanel = new Ext.TabPanel({
            border: false,
            id:'east',
            region: "east",
            width: 250,
            split: true,
            collapsible: true,
            collapseMode: "mini",
			activeTab:0,
            header: false,
            items: [
                /*{
					region: 'center', 
					autoScroll: true, 
					tbar: [], 
					border: false, 
					id: 'aoi', 
					title: 'Spatial Filter'
				},*/
				{
					region: 'center', 
					autoScroll: true, 
					tbar: [], 
					border: false, 
					id: 'downloadlist', 
					title: 'Download List'
				}
            ]
        });
		var southPanel = new Ext.Panel({
            border: false,
            id:'south',
            region: "south",
            height:250,
            split: true,
            collapsible: true,
            collapseMode: "mini",
			activeTab:0,
            header: true,
			layout: 'fit'
            
        });
        
        this.toolbar = new Ext.Toolbar({
            disabled: true,
            id: 'paneltbar', 
            items: this.createTools()
        });
        
        this.on("ready", function() {
		    //
            // enable only those items that were not specifically disabled
            //
			var disabled = this.toolbar.items.filterBy(function(item) {
                return item.initialConfig && item.initialConfig.disabled;
            });
            
            this.toolbar.enable();
			
            disabled.each(function(item) {
                item.disable();
            });
        });
        
        this.mapPanelContainer = new Ext.Panel({
            layout: "card",
            region: "center", 
            defaults: {
                border: false
            },
            items: [
                this.mapPanel
                //,googleEarthPanel
            ],
            activeItem: 0,
            tbar: this.toolbar
        });
        
        this.portalItems = [{
            region: "center",
            layout: "border",            
            items: [
                this.mapPanelContainer,
                westPanel,
				eastPanel,
				southPanel
            ]
        }];
        
        GeoExplorer.superclass.initPortal.apply(this, arguments);        
    },
    
    /** private: method[createTools]
     * Create the toolbar configuration for the main panel.  This method can be 
     * overridden in derived explorer classes such as :class:`GeoExplorer.Composer`
     * or :class:`GeoExplorer.Viewer` to provide specialized controls.
     */
    createTools: function() {
        var tools = [
            "-"
        ];
        return tools;
    },
    
    /** private: method[save]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    save: function(callback, scope) {
        var configStr = Ext.util.JSON.encode(this.getState());        
        var method = "POST";
        var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
        var mHost=pattern.exec(app.xmlJsonTranslateService);

        var mUrl = app.xmlJsonTranslateService + 'HTTPWebGISSave';
        var url = mHost[2] == location.host ? mUrl : proxy + mUrl;
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSave(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
    },
        
    /** private: method[handleSave]
     *  :arg: ``XMLHttpRequest``
     */
    handleSave: function(request) {
        if (request.status == 200) {
            this.xmlContext = request.responseText;
        } else {
            throw this.saveErrorText + request.responseText;
        }
    },

    /** private: method[saveAndExport]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    saveAndExport: function(callback, scope) {
        var configStr = Ext.util.JSON.encode(this.getState());
        var method, url;
        if (this.id) {
            method = "PUT";
            url = "maps/" + this.id;
        } else {
            method = "POST";
            url = "maps";
        }
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSaveAndExport(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
    },
        
    /** private: method[handleSaveAndExport]
     *  :arg: ``XMLHttpRequest``
     */
    handleSaveAndExport: function(request) {
        if (request.status == 200) {
            var config = Ext.util.JSON.decode(request.responseText);
            var mapId = config.id;
            if (mapId) {
                this.id = mapId;
                //window.location.hash = "#maps/" + mapId;
            }
        } else {
            throw this.saveErrorText + request.responseText;
        }
    },
    
    /** private: method[showUrl]
     */
    showUrl: function() {
        var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
        var mHost=pattern.exec(app.xmlJsonTranslateService);

        var mUrl = app.xmlJsonTranslateService + 'HTTPWebGISFileDownload';
        OpenLayers.Request.POST({
            url: mHost[2] == location.host ? mUrl : proxy + mUrl,
            data: this.xmlContext,
            callback: function(request) {

                if(request.status == 200){                            
                    
                    //        
                    //delete other iframes appended
                    //
                    if(document.getElementById("downloadIFrame")) {
                      document.body.removeChild( document.getElementById("downloadIFrame") ); 
                    }
                    
                    //
                    //Create an hidden iframe for forced download
                    //
                    var elemIF = document.createElement("iframe"); 
                    elemIF.setAttribute("id","downloadIFrame");
                    var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
                    var mHost=pattern.exec(app.xmlJsonTranslateService);

                    var mUrlEncoded = encodeURIComponent(app.xmlJsonTranslateService + "HTTPWebGISFileDownload?file="+request.responseText);
                    var mUrl = app.xmlJsonTranslateService + "HTTPWebGISFileDownload?file="+request.responseText;
                    elemIF.src = mHost[2] == location.host ? mUrl : proxy + mUrlEncoded; 
                    elemIF.style.display = "none"; 
                    document.body.appendChild(elemIF); 
                }else{
                    Ext.Msg.show({
                       title:'File Download Error',
                       msg: request.statusText,
                       buttons: Ext.Msg.OK,
                       icon: Ext.MessageBox.ERROR
                    });
                }

            },
            scope: this
        });
    },
    
    /** api: method[getBookmark]
     *  :return: ``String``
     *
     *  Generate a bookmark for an unsaved map.
     */
    getBookmark: function() {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(),
            {q: Ext.util.JSON.encode(this.getState())}
        );
        
        // disregard any hash in the url, but maintain all other components
        var url = 
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);
        
        return url;
    },

    /** private: method[displayAppInfo]
     * Display an informational dialog about the application.
     */
    displayAppInfo: function() {
        var appInfo = new Ext.Panel({
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>"+this.aboutText+"</a> </iframe>"
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            items: [appInfo]
        });

        var win = new Ext.Window({
            title: this.aboutThisMapText,
            modal: true,
            layout: "fit",
            width: 300,
            height: 300,
            items: [appInfo]
        });
        win.show();
    }
});


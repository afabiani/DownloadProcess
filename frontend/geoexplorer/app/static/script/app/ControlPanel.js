
var Source = Ext.extend(Ext.util.Observable, {
	
	constructor: function(config){
		this.url = config.url;
		this.id = config.id || Ext.id(null);
		
		Source.superclass.constructor.apply(this, arguments);
		
        if (!this.format) {
            this.format = new OpenLayers.Format.WMSCapabilities({keepData: true});
        }
	},
	
	init: function(scope){
		this.createStore();
	},
	
	getStore: function(){
		return this.store;
	},
	
	createStore: function(){
		var baseParams = this.baseParams || {
			SERVICE: "WMS",
			REQUEST: "GetCapabilities"
		};
			
	    if (this.version) {
	         baseParams.VERSION = this.version;
	    }

	    this.store = new GeoExt.data.WMSCapabilitiesStore({
			// Since we want our parameters (e.g. VERSION) to override any in the 
			// given URL, we need to remove corresponding paramters from the 
			// provided URL.  Simply setting baseParams on the store is also not
			// enough because Ext just tacks these parameters on to the URL - so
			// we get requests like ?Request=GetCapabilities&REQUEST=GetCapabilities
			// (assuming the user provides a URL with a Request parameter in it).
			url: this.url,
			baseParams: baseParams,
			format: this.format,
			autoLoad: true,
			layerParams: {exceptions: null},
			listeners: {
				load: function(store, records, options) {
					// The load event is fired even if a bogus capabilities doc 
					// is read (http://trac.geoext.org/ticket/295).
					// Until this changes, we duck type a bad capabilities 
					// object and fire failure if found.
					if (!this.store.reader.raw || !this.store.reader.raw.service) {
						this.fireEvent("failure", this, "Invalid capabilities document.");
					} else {
						if (!this.title) {
							this.title = this.store.reader.raw.service.title;                        
						}
						if (!this.ready) {
							this.ready = true;
							this.fireEvent("ready", this);
						} else {
							this.lazy = false;
							//TODO Here we could update all records from this
							// source on the map that were added when the
							// source was lazy.
						}							
					}
					
					// clean up data stored on format after parsing is complete
					delete this.format.data;
				},				
				exception: function(proxy, type, action, options, response, error) {
					delete this.store;
					var msg, details = "";
					if (type === "response") {
						if (typeof error == "string") {
							msg = error;
						} else {
							msg = "Invalid response from server.";
							// special error handling in IE
							var data = this.format && this.format.data;
							if (data && data.parseError) {
								msg += "  " + data.parseError.reason + " - line: " + data.parseError.line;
							}
							var status = response.status;
							if (status >= 200 && status < 300) {
								// TODO: consider pushing this into GeoExt
								var report = error && error.arg && error.arg.exceptionReport;
								details = gxp.util.getOGCExceptionText(report);
							} else {
								details = "Status: " + status;
							}
						}
					} else {
						msg = "Trouble creating layer store from response.";
						details = "Unable to handle response.";
					}
					
					// TODO: decide on signature for failure listeners
					this.fireEvent("failure", this, msg, details);
					// clean up data stored on format after parsing is complete
					delete this.format.data;
				},
				scope: this
			}
		});		
	}	
});

var SourceCollection = Ext.extend(Ext.util.Observable, {
	
	control: null,
	referenceId: null,
	
	constructor: function(config) {
		this.addEvents(
			'server-added'
		);
		
		Ext.apply(this, {
	        layerSources: {}
	    });
		
		this.control = config.control;
		this.referenceId = config.referenceId;
		
	    SourceCollection.superclass.constructor.apply(this, arguments);
	},
	
	addLayerSource: function( options ){
	
	    var config = options.config;

		//
		// Check before for already added WMS sources in this component
		//
		for(var id in this.layerSources){
			if(id && this.layerSources[id].url.indexOf(config.url) != -1){				
				Ext.Msg.show({
					title: 'Add New Server',
					msg: "Server WMS already added !",
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.WARNING
				});				
				
				this.fireEvent('server-added', null, this);
				var callback = options.callback || Ext.emptyFn;
				callback.call(options.scope || this, id);
				
				return;
			}				
		}
		
		var source = new Source( config );
		
		// ////////////////////////////////////////////////////////////////////////////////////////
		// Check before for already added WMS sources in twin 'Add WMS' component.
		// If we have already saved sources with the same URL we have 
		// to use their id to not miss possible layers references or duplicate sourcse references.
		// ////////////////////////////////////////////////////////////////////////////////////////
		if(this.referenceId == "../../backgroundSelector"){
		    var modelSelector = this.control.cruisePanelView.modelSelector;
			
			for(var id in modelSelector.scope.sources.layerSources){
				if(id && modelSelector.scope.sources.layerSources[id].url.indexOf(config.url) != -1){				
					source.id = id;
				}				
			}
		}else if(this.referenceId == "../../modelSelector"){
		    var backgroundSelector = this.control.cruisePanelView.backgroundSelector;
			
			for(var id in backgroundSelector.scope.sources.layerSources){
				if(id && backgroundSelector.scope.sources.layerSources[id].url.indexOf(config.url) != -1){				
					source.id = id;
				}				
			}
		}
		
		var gsSources = this.control.gsSources;
		
		// ///////////////////////////////////////////////////////////////
		// If we have already saved sources with the same URL we have 
		// to use their id to not miss possible layers references 
		// ///////////////////////////////////////////////////////////////
		if(gsSources){
			for(var id in gsSources){
				if(id && gsSources[id].url.indexOf(source.url) != -1){
					source.id = id;
				}				
			}
		}
  
	    source.on({
			ready: {
				fn: function() {
					this.fireEvent('server-added', source, this);
					var callback = options.callback || Ext.emptyFn;
					callback.call(options.scope || this, id);
				},
				scope: this,
				single: true
			},
			failure: {
				fn: function() {
					var fallback = options.fallback || Ext.emptyFn;
					delete this.layerSources[id];
					fallback.apply(options.scope || this, arguments);
				},
				scope: this,
				single: true
			}
	    });
		
	    this.layerSources[source.id] = source;
	    source.init(this);
		
	    return source;		
	},
	
	get: function( key ){
		return this.layerSources[key];
	}
});

var ServerListView = Ext.extend(Ext.form.ComboBox, {

		untitledText: 'Title not specified',
        valueField: "id",
        displayField: "title",
        triggerAction: "all",
        editable: false,
        allowBlank: false,
        forceSelection: true,
        mode: "local",
		
		listeners:{
			select: function (combo, record, index){
				combo.selectedRecord = record;
			}
		},
		
		store: null,
		
		constructor: function(config){
			this.store = new Ext.data.ArrayStore({
				fields: ["id", "title", "url"],
				data: []
			});
			
			ServerListView.superclass.constructor.apply(this, arguments);
		},

		addServer: function( source ){			
			if(source){
				var record = new this.store.recordType({
					id: source.id,
					title: source.title || this.untitledText,
					url: source.url
				});
				
				this.store.insert(0, [record]);
				this.onSelect(record, 0);	
			}			
		}
});

var LayerListView = Ext.extend(Ext.grid.GridPanel,{

	autoScroll: true,
	loadMask: true,
	height: 100,
	
	initComponent: function( ){
	
		this.sm = new Ext.grid.RowSelectionModel({
	        // singleSelect: true
	    });
		
		this.colModel = new Ext.grid.ColumnModel([
	        {id: "title", header: 'Title', dataIndex: "title", sortable: true},
	        {header: "Id", dataIndex: "name", width: 150, sortable: true},
			{header: "Source", dataIndex: "source", width: 150, sortable: true, hidden: true},
	        {header: "uuid", dataIndex: "keywords", width: 150, sortable: true, hidden: true}
	    ]);
		
		this.store = new Ext.data.ArrayStore({
	        fields: ["name", "source", "keywords", "title"],
	        data: []
	    });		
		
		LayerListView.superclass.initComponent.call(this, arguments);
	}
});

var LayerSelector = Ext.extend(Ext.util.Observable, {
	
	constructor: function(config){		
		this.name = config.name;
		this.ref = config.ref;
		this.control = config.control;
	
		this.sources = new SourceCollection({
			control: this.control,
			referenceId: this.ref
		});
		
		this.layerList = new LayerListView({
			
		});
		
		this.selectedLayerList = new LayerListView({

		});
		
		this.serverList = new ServerListView({
		
		});		
		
        LayerSelector.superclass.constructor.apply(this, arguments);		
		this.bind();
    },
	
	bind: function(){
		this.sources.on('server-added', this.serverList.addServer, this.serverList);
		this.serverList.on('select', this.uploadLayersHandler, this);
	},
	
	addServerHandler: function(){
		var newSourceWindow = new gxp.NewSourceWindow({
		
            modal: true,
			
            listeners: {
                "server-added": function(url) {
				    if(url){
						newSourceWindow.setLoading();
						this.sources.addLayerSource({
							config: {url:url},
							callback: function(id){
								newSourceWindow.hide();
							},
							fallback: function(source, msg){
								var addLayerSourceErrorText = "Error getting WMS capabilities ({msg}).\nPlease check the url and try again.";
								newSourceWindow.setError(
									new Ext.Template(addLayerSourceErrorText).apply({msg: msg})
								);
							},
							scope: this
						});
					}else{
						newSourceWindow.hide();
					}

                },
                scope: this
            }
        });
		
		newSourceWindow.show();
	},
	
	uploadLayersHandler: function(  combo, record, index){
		// get the store with layers of the selected source
		var store = this.sources.get( record.get("id") ).getStore();
		// upload capabilities into layerList (delete previous items)
		this.layerList.store.clearFilter();                    
        this.layerList.reconfigure( store , this.layerList.getColumnModel());
		// select already selected layers
		var selectedLayers = this.selectedLayerList.getStore().getRange();
		this.layerList.getSelectionModel().selectRecords( selectedLayers );
	},
	
	addToRightHandler: function(){
		// Add selected layer to the list of selected layers
		var selectedLayers = this.layerList.getSelectionModel().getSelections();
		
		if ( selectedLayers.length === 0){
				Ext.Msg.show({
						title: 'Cannot add layer',
						msg: 'No layer selected in left grid.',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.WARNING
				});
				return;
		}
		
		for (var i=0; i<selectedLayers.length; i++){
			var layer = selectedLayers[i];
			var index = this.selectedLayerList.getStore().find('name', layer.data.name);
			if ( index === -1 ){
				var selectedRecord = this.serverList.selectedRecord;
				
				if(selectedRecord){
					layer.data.source = selectedRecord.data.id;
				}
				
				this.selectedLayerList.getStore().add( layer );
			} else {
				Ext.Msg.show({
						title: 'Cannot select layer',
						msg: 'Layer already selected.',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.WARNING
				});
			}			
		}		
	},
	
	removeFromRightHandler: function(){
		var selectedLayers = this.selectedLayerList.getSelectionModel().getSelections();
		
		if ( selectedLayers.length === 0){
			Ext.Msg.show({
					title: 'Cannot remove layer',
					msg: 'No layer selected in right grid.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.WARNING
			});
			return;
		}
		
		for (var i=0; i<selectedLayers.length; i++){
			var layer = selectedLayers[i];
			this.selectedLayerList.getStore().remove( layer );
		}		
	},
	
	resetHandler: function(){
		this.selectedLayerList.getStore().removeAll( );
	},
	
	enableHandler: function( scope ){
		return function(){
				scope.left.addServerBtn.enable();
				scope.layerList.enable();
				scope.selectedLayerList.enable();
				scope.serverList.enable();
				scope.right.addBtn.enable();
				scope.right.removeBtn.enable();
				scope.right.resetBtn.enable();
		};	
	},
	
	disableHandler: function( scope ){
		return function(){
			scope.left.addServerBtn.disable();
			scope.layerList.disable();
			scope.selectedLayerList.disable();
			scope.serverList.disable();
			scope.right.addBtn.disable();
			scope.right.removeBtn.disable();
			scope.right.resetBtn.disable();
		};	
	},
	
	getSelectedLayersHandler: function( scope ){
		return function(){
			var layers = scope.selectedLayerList.getStore().getRange();
			return layers;			
		};	
	},
	
	selectedLayersHandler: function( scope ){
		return function( layers ){
			var store = scope.selectedLayerList.getStore();
			for (var i=0; i<layers.length; i++){
				var layer = layers[i];
				var record = new store.recordType({
					title: layer.title,
					name: layer.name,
					source: layer.source
				});
				store.add( record );
			}				
		};	
	},
	
	getSourcesListHandler: function(scope){
		return function(){
			var list = scope.serverList.getStore();			
			return list;
		}
	},
	
	reset: function(){
		var selLayList = this.scope.selectedLayerList;
		if(selLayList){
			selLayList.getStore().removeAll();
		}
	},
	
	getView: function(){
		this.left = new Ext.Panel({
			scope: this,
			tbar: [ 
				'View layers from: ', 
				this.serverList,
		            new Ext.Button({
		                tooltip: 'Add WMS Server',
						text: 'Add WMS',
						ref:'../addServerBtn',
		                iconCls: "gxp-icon-addserver",
		                handler: this.addServerHandler,
		                scope : this
		            })
				],
			items:[
				this.layerList
			]
		});
		
		this.right = new Ext.Panel({
			buttonAlign:'right',
			scope: this,
			tbar: [ 
					new Ext.Button({
						text: 'Add',
						ref:'../addBtn',
						iconCls: "add",
						handler: this.addToRightHandler,
						scope : this
					}),
					new Ext.Button({
						text: 'Remove',
						ref:'../removeBtn',
						iconCls: "delete",
						handler: this.removeFromRightHandler,
						scope : this
					}),
					'->',
					new Ext.Button({
						text: 'Reset',
						ref:'../resetBtn',
						iconCls: "refresh",
						handler: this.resetHandler,
						scope : this
					})
				],
			items:[
				this.selectedLayerList
			]
		});
			
		var columns = 	new Ext.Container( 
			{
			    layout: 'column',
				ref: this.ref,
			    defaults: {
			        xtype: 'container',
			        layout: 'form',
			        columnWidth: 0.5,
			        style: {
			            padding: '10px'
			        }
			    },
				enable: this.enableHandler( this ),
				disable: this.disableHandler( this ),
				getSelectedLayers: this.getSelectedLayersHandler( this ),
				selectLayers: this.selectedLayersHandler( this ),
				getSourcesList: this.getSourcesListHandler(this),
				reset: this.reset,
				scope:this,
			    items: [
					{
			        	items: this.left
			    	}, 
					{
			        	items: this.right
			    	}
				]
		    });	
		
			this.disableHandler( this ).call(this);
		
		return columns;
	}
});

var ControlPanel = Ext.extend(Ext.Panel, {

	/** i18n */
	titleText: "Date & Time Options",
	rangeFieldsetText: "Time Range",
	animationFieldsetText: "Animation Options",
	startText: 'Start',
	endText: 'End',
	listOnlyText: 'Use Exact List Values Only',
	stepText: 'Step',
	unitsText: 'Step Units',
	frameRateText: 'Refresh Delay (s)',
	noUnitsText: 'Snap To Time List',
	loopText: 'Loop Animation',
	reverseText: 'Reverse Animation',
	rangeChoiceText: 'Choose the range for the time control',
	rangedPlayChoiceText: 'Playback Mode',

	/**
	 *  the id of the current configuration
	 *  if mapId = -1, the configuration is brand new
	 */
	mapId: -1,
	cruiseListView: null,
	cruisePanelView: null,
	token: null,
	
	toggleGroup: "toolGroup",

	constructor: function(config) {

		// configuration settings
		this.token = config.token;
		this.infoPageBaseUrl = config.infoPageBaseUrl;
		this.fileUploaderServlet = config.fileUploaderServlet;
		this.proxy = config.proxy;
		this.interPageBaseUrl = config.interPageBaseUrl;
		this.imgsBaseUrl = config.imgsBaseUrl;
		this.geostoreBaseUrl = config.geostoreBaseUrl;
		this.url = config.geostoreBaseUrl + 'resources';
		this.urlData = config.geostoreBaseUrl + 'data';
		this.geoserverBaseUrl = config.geoserverBaseUrl;
		this.defaultWatermarkUrl = config.defaultWatermarkUrl;
		
		this.backgrounds = config.backgrounds;
		this.models = config.models;
		
		this.defaultBackgrounds = config.defaultBackgrounds;
		this.defaultModels = config.defaultModels;
		
		this.sourcesProperties = config.sourcesProperties;
		
		// create an instance of geostore client
		this.geostore = new GeoStore.Maps({
			authorization: this.token,
			proxy: this.proxy,
			url: config.geostoreBaseUrl
		});
		
		// get the Ext.data.Store for the geostore client
		// an associate it with a paging toolbar
		this.store = this.geostore.getStore();
		this.pagingToolbar = new Ext.PagingToolbar({
		        store: this.store,       
		        displayInfo: true,
		        pageSize: config.pageSize,
		        prependButtons: true
		});
		
		// init store
		this.store.load({
            params:{
                start: 0,
                limit: config.pageSize
            }
        });
		
		// this.loadCruiseList();

		this.reloadListButton = new Ext.Button({
			iconCls:'gxp-icon-refresh', 
			// text:"Reload",
			// disabled: true,
			ref:'../reloadListButton',
			handler: this.reloadListHandler,
			tooltip: 'Reload cruise list',
			scope: this			
		});

		// list of cruise configurations
		this.cruiseListView = new Ext.list.ListView({
			store: this.store,
			hideHeaders: true,
			autoScroll: true,
			border: false,
			singleSelect: true,
			emptyText: 'No cruise to display',
			reserveScrollOffset: true,
			columns: [{
				header: 'Name',
				width: .5,
				dataIndex: 'name'
			}]
		});
		this.viewButton = new Ext.Button({
			iconCls: 'gxp-icon-view-map',
			text: 'View',
			ref: '../viewButton',
			disabled: true,
			handler: this.handleViewMap,
			scope: this
		});
		this.saveButton = new Ext.Button({
			iconCls: 'save',
			text: this.mapId === -1 ? 'Save' : 'Update',
			ref: '../saveButton',
			disabled: true,
			handler: this.saveOrUpdate,
			scope: this
		});
		this.deleteButton = new Ext.Button({
			iconCls: 'delete',
			text: 'Delete',
			ref: '../deleteButton',
			disabled: true,
			handler: this.deleteCruise,
			scope: this
		});
		
		this.createButton = new Ext.Button({ 
			icon:'../theme/app/img/silk/add.png', 
			// text:"New cruise",
			tooltip:'Create new cruise',
			disabled: true,
			ref:'../createButton',
			handler: this.createCruise,
			scope: this
		});
		
		this.reloadButton = new Ext.Button({ 
			iconCls:'gxp-icon-refresh', 
			text:"Reload",
			disabled: true,
			ref:'../reloadButton',
			handler: this.createLoadCruiseHandler( this ),
			scope: this
		});
		
		
		this.loginButton =  new Ext.Button({
			iconCls: 'gxp-icon-user',
			text: 'Login',
			ref: '../loginButton',
			handler: function(){
				
				if ( Application.user.isGuest() ){
					var win = new Ext.Window({
						
			            title: 'Enter your credentials',
			            iconCls: 'gxp-icon-user',
			            layout: "fit",
			            width: 275,
						closeAction: 'hide',
			            height: 130,
			            plain: true,
			            border: false,
			            modal: true,
			            items: [{
							xtype:'form',
							ref:'loginForm',
							labelWidth:80,
							frame:true, 
							defaultType:'textfield',
							items:[
								{  
				                	fieldLabel: 'Username',
				                	ref:'../username', 
				                	allowBlank:false,
				                	listeners: {
				                 		beforeRender: function(field) {
				                    		field.focus(false, 1000);
				                  		}
				                	}
				            	},{  
				                	fieldLabel:'Password', 
				                	ref:'../password', 
				                	inputType:'password', 
				                	allowBlank:false
				            	}],
				            buttons:[{ 
				                text: 'Login',
				                iconCls: 'save',
				                formBind: true,
				                scope: this,
				                handler: function submitLogin(){
									if ( win.loginForm.getForm().isValid() ){
										Application.user.login( win.username.getValue(), win.password.getValue());
										win.destroy();
									} else {
										Ext.Msg.show({
												title: 'Cannot login',
												msg: 'You must specify a username and a password.',
												buttons: Ext.Msg.OK,
												icon: Ext.MessageBox.ERROR
										});
									}
								}
				            }],
							keys: [{ 
				                key: [Ext.EventObject.ENTER],
				                scope: this,
				                handler: function submitLogin(){
									if ( win.loginForm.getForm().isValid() ){
										Application.user.login( win.username.getValue(), win.password.getValue());
										win.destroy();
									} else {
										Ext.Msg.show({
												title: 'Cannot login',
												msg: 'You must specify a username and a password.',
												buttons: Ext.Msg.OK,
												icon: Ext.MessageBox.ERROR
										});
									}
								}
				            }]
						}],
			            listeners: {
			                afterRender: function(){
			                    win.loginForm.getForm().clearInvalid();
			                },
			                hide: function(){
			                    win.loginForm.getForm().reset();
			                }
			            }
			        });
			        win.show();
					
				} else {
					Ext.MessageBox.show({
					           title:'Logout',
					           msg: 'You are closing this application. Every unsaved changes will be lost. <br/>Are you sure?',
					           buttons: Ext.MessageBox.YESNO,
					           fn: function(btn){
									if ( btn === 'yes' ){
										Application.user.logout();
									}

							   },
					           icon: Ext.MessageBox.QUESTION
					       });
				}
				
				
			},
			scope: this
		});

		this.fileForm = new Ext.FormPanel({
			border: false,
			width:700,
			fileUpload: true,
			labelWidth: 120,
			// bodyStyle: 'padding: 10px 10px 0 10px;',
			bodyBorder: false,
			defaults: {
				// anchor: '50%',
				allowBlank: false,
				msgTarget: 'side'
			},
			items: [{
				ref: 'fileuploadField',
				allowBlank: false,
				disabled: true,
				xtype: "fileuploadfield",
				emptyText: 'Select a file...',
				fieldLabel: 'File',
				name: "watermarkFile",
				buttonText: "",
				buttonCfg: {
					iconCls: "gxp-icon-filebrowse"
				},
				listeners: {
					"fileselected": function(cmp, value) {
						// remove the path from the filename - avoids C:/fakepath etc.
						cmp.setValue(value.split(/[/\\]/).pop());
						// self.filename = cmp.getValue();
					}
				},
				width: 500
			}]
		});

		var self = this;
		this.cruisePanelView = new Ext.Panel({
			// layout: 'fit',
			
			// layout: { type:'vbox', align: 'center' },
			region:'center',
			width:850,
			
			border: false,
			autoScroll: true,
			listeners: {
			  render: function(p){
			    p.body.on('scroll', function(){
				  // workaround to fix map disalignment bug
			      self.updateMapSize();
			    }, p);
			  }
			},
			items: [
			new Ext.Panel({
				border: false,
				// fileUpload: true,
				// autoScroll: true,
				ref: '../formPanel',
				width:800,
				bodyStyle: 'padding: 10px 10px 0 10px;',
				bodyBorder: false,
				defaults: {
					anchor: '80%',
					allowBlank: false,
					msgTarget: 'side'
				},
				buttons: [
				this.viewButton, this.reloadButton, this.saveButton, this.deleteButton],
				items: [{
					xtype: 'fieldset',
					title: 'General properties',
					labelWidth: 120,
					items: [{
						xtype: 'textfield',
						allowBlank: false,
						fieldLabel: 'Name',
						invalidText: 'A name for the cruise must be specified',
						disabled: true,
						ref: '../../name',
						width: 500
					}]
				},{
					xtype: 'fieldset',
					title: 'Watermark',
					labelWidth: 120,
					items:[
					 {
						xtype: "hidden",
						id: "fileUrl",
						fieldLabel: 'Watermark picture url',
						name: "fileUrl",
						disabled: true,
						ref: '../../watermarkUrl',
						width: 500
					},
							new Ext.BoxComponent({
								ref: '../../watermarkLogo',
								width:30,
								heigth:30,
								fieldLabel: 'Current',
								// fieldLabel: 'Current <span style="color:green;" ext:qtip="This is the default watermark if you do not specify a new file.">?</span> ',
								hidden: true,
							    autoEl: {
							        tag: 'img',
							        src: '../theme/app/img/nurc-logo.png'
							    }
							}),
					this.fileForm,
					{
						xtype: "combo",
						fieldLabel: 'Position',
						invalidText: 'A position must be specified',
						emptyText: 'Select a position...',
						store: [
							["position:absolute;right:5px;top:5px", "North-East"],
							["position:absolute;left:5px;top:5px", "North-West"],
							["position:absolute;right:5px;bottom:5px", "South-East"],
							["position:absolute;left:5px;bottom:5px", "South-West"]
						],
						mode: 'local',
						editable: false,
						forceSelection: true,
						disabled: true,
						triggerAction: 'all',
						value: "position:absolute;left:5px;bottom:5px",
						ref: '../../watermarkPosition',
						width: 500
					},
					{
						xtype: 'textfield',
						allowBlank: true,
						fieldLabel: 'Text',
						disabled: true,
						ref: '../../watermarkText',
						width: 500
					}
					
					]
				}, {
					xtype: 'fieldset',
					title: 'Select ocean models',
					id:'ocean-models-id',
					items: [
						
					/*	{
						xtype: 'itemselector',
						name: 'itemselector',
						// fieldLabel: 'Models',
						imagePath: '../theme/app/img/ext',
						disabled: true,
						ref: '../../modelSelector',
						multiselects: [{
							width: 250,
							height: 200,
							store: config.models,
							displayField: 'title',
							valueField: 'name'
						}, {
							width: 250,
							height: 200,
							displayField: 'title',
							valueField: 'name',
							store: new Ext.data.JsonStore({
									data: [],
									fields: ['format', 'group', 'name', 'opacity', 'selected', 
										'source', 'title', 'transparent', 'visibility', 'ratio', 'elevation', 'styles', 'style']
							}),
							tbar: [{
								text: 'clear',
								handler: function() {
									this.cruisePanelView.modelSelector.reset();
								},
								scope: this
							}]
						}]
					}
					,*/ (new LayerSelector( {
							ref: '../../modelSelector',
							control: self
						 } )).getView()
					
					
					]
				}, 
				
				{
					xtype: 'fieldset',
					title: 'Select backgrounds',
					items: [/*{
						xtype: 'itemselector',
						name: 'itemselector',
						// fieldLabel: 'Backgrounds',
						imagePath: '../theme/app/img/ext',
						disabled: true,
						ref: '../../backgroundSelector',
						multiselects: [{
							width: 250,
							height: 200,
							store: config.backgrounds,
							displayField: 'text',
							valueField: 'value'
						}, {
							width: 250,
							height: 200,
							// allowBlank: false,
							blankText: 'At least one background must be selected',
							store: [],
							tbar: [{
								text: 'clear',
								handler: function() {
									this.cruisePanelView.backgroundSelector.reset();
								},
								scope: this
							}]
						}]
					}*/
					(new LayerSelector( {
							ref: '../../backgroundSelector',
							control: self
						 } )).getView()
					]
				},				
				
				{
					xtype: 'fieldset',
					title: 'Select vehicles',
					buttonAlign: 'left',
					buttons: [{
						id: 'vehicle-selector-btn',
						// ref:'../../../../vehicleSelectorBtn',
						disabled: true,
						text: 'Add vehicle',
						handler: function() {
							var form = new Ext.FormPanel({
								width: 500,
								frame: true,
								autoHeight: true,
								bodyStyle: 'padding: 10px 10px 0 10px;',
								labelWidth: 50,
								defaults: {
									anchor: '95%',
									allowBlank: false,
									msgTarget: 'side'
								},
								items: [{
									xtype: "textfield",
									fieldLabel: 'Name',
									invalidText: 'A name must be specified',
									width: 200,
									allowBlank: false,
									ref: 'name'
								}, {
									xtype: 'textfield',
									vtype: 'url',
									invalidText: 'A valid url must be specified',
									fieldLabel: 'Url',
									width: 200,
									allowBlank: false,
									ref: 'url'
								}]
							});
							// open modal window
							var win = new Ext.Window({
								closable: true,
								title: 'Add vehicle',
								// iconCls: "",
								border: false,
								modal: true,
								bodyBorder: false,
								width: 500,
								// height: 200,
								resizable: false,
								items: [
								form],
								buttons: [{
									text: 'Add vehicle',
									formBind: true,
									handler: function() {

										if (form.name.isValid(false) && form.url.isValid(false)) {
											var store = self.cruisePanelView.vehicleSelector.fromMultiselect.store;
											var record = new store.recordType({
												value: form.name.getValue(),
												text: form.name.getValue(),
												url: form.url.getValue()
											});
											self.cruisePanelView.vehicleSelector.fromMultiselect.store.add(
											record);
											win.destroy();
										} else {
											Ext.Msg.show({
												title: 'Invalid values for a vehicle',
												msg: 'Some fields are invalid',
												buttons: Ext.Msg.OK,
												icon: Ext.MessageBox.ERROR
											});
										}

									}
								}]
							});
							win.show();
						}
					}],
					items: [{
						xtype: 'itemselector',
						name: 'itemselector',
						// fieldLabel: 'Vehicles',
						imagePath: '../theme/app/img/ext',
						disabled: true,
						ref: '../../vehicleSelector',
					
						
						multiselects: [{
							width: 250,
							height: 200,
							store: config.vehicles,
							displayField: 'text',
							valueField: 'value'
						}, {
							width: 250,
							height: 200,
							blankText: 'At least one vehicle must be selected',
							// allowBlank: false,
							// minSelections: 1,
							store: [],
							tbar: [{
								text: 'clear',
								handler: function() {
									this.cruisePanelView.vehicleSelector.reset();
								},
								scope: this
							}]
						}]
					}]
				}, {
					xtype: 'fieldset',
					title: 'Map Extent',
					items: [{
						xtype: 'panel',
						id: 'tiny-map-panel'
					}]
				},

				// time slider configuration
				{
					xtype: 'fieldset',
					title: this.animationFieldsetText,
					labelWidth: 120,
					ref: '../animationFieldset',
					items: [{
						id: 'startTime',
						xtype: 'datefield',
						allowBlank: false,
						editable: false,
						format: "d/m/Y",
						fieldLabel: 'Start time',
						disabled: true,
						ref: '../../startTime',
						width: 500

					}, {
						id: 'endTime',
						xtype: 'datefield',
						allowBlank: false,
						editable: false,
						format: "d/m/Y",
						fieldLabel: 'End time',
						ref: '../../endTime',
						disabled: true,
						width: 500
					}, {
						fieldLabel: this.frameRateText,
						xtype: 'numberfield',
						allowBlank: false,
						disabled: true,
						ref: '../../rateValueField',
						width: 500
					}, {
						fieldLabel: this.stepText,
						xtype: 'numberfield',
						allowBlank: false,
						disabled: true,
						ref: '../../stepValueField',
						width: 500
					}, {
						fieldLabel: this.unitsText,
						xtype: 'combo',
						store: [
							[OpenLayers.TimeUnit.SECONDS, 'Seconds'],
							[OpenLayers.TimeUnit.MINUTES, 'Minutes'],
							[OpenLayers.TimeUnit.HOURS, 'Hours'],
							[OpenLayers.TimeUnit.DAYS, 'Days'],
							[OpenLayers.TimeUnit.MONTHS, "Months"],
							[OpenLayers.TimeUnit.YEARS, 'Years']
						],
						valueNotFoundText: this.noUnitsText,
						value: OpenLayers.TimeUnit.MINUTES,
						mode: 'local',
						forceSelection: true,
						autoSelect: false,
						editable: false,
						disabled: true,
						triggerAction: 'all',
						ref: '../../stepUnitsField',
						width: 500
					}
					]
				}

				]
			})] // cruise panel 		
		});
		
	
		
		
		

		this.nwTextField = new Ext.form.TextField({
			xtype: 'textfield',
			allowBlank: false,
			fieldLabel: 'NW',
			disabled: true
		});
		this.neTextField = new Ext.form.TextField({
			xtype: 'textfield',
			allowBlank: false,
			fieldLabel: 'NE',
			disabled: true
		});
		this.swTextField = new Ext.form.TextField({
			xtype: 'textfield',
			allowBlank: false,
			fieldLabel: 'SW',
			disabled: true
		});
		this.seTextField = new Ext.form.TextField({
			xtype: 'textfield',
			allowBlank: false,
			fieldLabel: 'SE',
			disabled: true
		});

		this.tinyMap = new gxp.Viewer({
			proxy: this.proxy,
			defaultSourceType: "gxp_wmssource",
			portalConfig: {
				renderTo: 'tiny-map-panel',
				layout: "border",
				width: 500,
				height: 200,
				border: false,
				items: [{
					xtype: "panel",
					region: "center",
					layout: 'fit',
					border: false,
					items: ["map-viewport"]
				}, {
					xtype: 'panel',
					region: 'west',
					layout: 'form',
					labelWidth: 30,
					style: 'padding: 5px',
					width: 200,
					items: [
					this.nwTextField, this.swTextField, this.seTextField, this.neTextField]
				}]
			},

			
			// configuration of all tool plugins for this application
			tools: [
			/*{
                ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
                actionTarget: {target: "map.tbar", index: 1}
            },*/
			{
				ptype: "gxp_zoomtoextent",
				toggleGroup: this.toggleGroup,
				actionTarget: {
					target: "map.tbar",
					index: 2
				}
			}, {
				ptype: "gxp_zoom",
				toggleGroup: this.toggleGroup,
				actionTarget: {
					target: "map.tbar",
					index: 3
				}
			}, {
				ptype: "gxp_zoombox",
				toggleGroup: this.toggleGroup,
				actionTarget: {
					target: "map.tbar",
					index: 4
				}
			}

			],
			sources: config.sources,
			map: {
				id: "map-viewport",
				// projection: "EPSG:4326",
				// maxResolution: 156543.0339,
				layers: [ config.background ],
				controls: [
				  new OpenLayers.Control.Navigation({zoomWheelOptions: {interval: 250}}),
                  // new OpenLayers.Control.PanPanel(),
                  // new OpenLayers.Control.ZoomPanel(),
                  // new OpenLayers.Control.Attribution(),
				  new OpenLayers.Control.LoadingPanel()
				]
			}
		});


		var self = this;
		this.tinyMap.on("ready", function() {
			function resetBound() {
				var bounds = self.tinyMap.mapPanel.map.getExtent();		
				
				bounds = new OpenLayers.Bounds( 
								bounds.left.toFixed(2), 
								bounds.bottom.toFixed(2), 
								bounds.right.toFixed(2), 
								bounds.top.toFixed(2));
					
				var proj = new OpenLayers.Projection("EPSG:4326");
				bounds.transform(self.tinyMap.mapPanel.map.getProjectionObject(), proj);
				self.nwTextField.setValue( bounds.left.toFixed(2) );
				self.swTextField.setValue(bounds.bottom.toFixed(2) );
				self.seTextField.setValue(bounds.right.toFixed(2) );
				self.neTextField.setValue(bounds.top.toFixed(2) );
			};

			resetBound();
			self.tinyMap.mapPanel.map.events.register('zoomend', this, function() {
				resetBound();
			});
			self.tinyMap.mapPanel.map.events.register('moveend', this, function() {
				resetBound();
			});

			
			
			// TODO externalize coordinates
			var bounds = new OpenLayers.Bounds(-3.00, 32.55, 23.36, 50.13);
			var proj = new OpenLayers.Projection("EPSG:4326");
			bounds.transform(proj, self.tinyMap.mapPanel.map.getProjectionObject());
			self.tinyMap.mapPanel.map.zoomToExtent( bounds, true );
		});

		this.updateMapSize = function(){
			self.tinyMap.mapPanel.map.updateSize();
		};

		
		this.cruiseListView.on('click', function(list, index, node, evt) {
			var listItem = self.store.getAt(index).data;
			
			if ( listItem.id !== self.mapId){
				self.loadCruise( listItem.id );
			} /*else {
				Ext.Msg.show({
						title: 'Cannot select this cruise',
						msg: 'This cruise is already selected.',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.WARN
				});				
			}*/
			
		});
		
		// the control panel listens to authentication events
		Application.user.on( 'login',  function loginHandler(context){
			Ext.Msg.show({
					title: 'Login successeful',
					msg: 'You are logged in.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.INFO
			});
			if ( self.mapId !== -1 ){
				self.deleteButton.enable();
				self.saveButton.enable();
			}
			self.createButton.enable();
			self.loginButton.setText('Logout');
			// self.loginButton.setIconClass('logout');
			self.token = context.token;
			self.geostore.setToken( self.token );
		} );
		Application.user.on( 'logout',  function logoutHandler( context ){
			self.loginButton.setText('Login');
			if ( self.mapId === -1){
				self.disable();
			} else {
				self.createButton.disable();
				self.saveButton.disable();
				self.deleteButton.disable();
			}
			
			// self.loginButton.setIconClass('gxp-icon-user');
			self.token = null;
			self.geostore.invalidateToken( );
		} );
		Application.user.on( 'failed',  function loginFailedHandler( context ){
			self.createButton.disable();
			self.token = null;
			Ext.Msg.show({
					title: 'Login failed',
					msg: 'Wrong username or password.',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
			});
			self.geostore.invalidateToken( null );
		} );



	},
	
	reloadListHandler: function(){
		var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, loading..."});
		appMask.show();
		var self = this;
		var handler = function(){
			appMask.hide();
			self.store.un( 'load', handler);
		};
		this.store.on( 'load', handler);
		this.store.reload();
	},

	getCreateButton: function(){
		return this.createButton;
	},
	
	getLoginButton: function(){
		return this.loginButton;
	},

	getCruiseListView: function() {
		return this.cruiseListView;
	},
	getCruisePanelView: function() {
		return this.cruisePanelView;
	},

	handleViewMap: function() {
		window.open(this.interPageBaseUrl + this.mapId);
	},

	saveOrUpdate: function() {		

		if (this.validateForm()) {
			
			// TODO deal with months (28, 30 days) and years (365)
			function computeDuration( unit ){
				if ( unit === OpenLayers.TimeUnit.SECONDS ){
					return 1000;
				} else if ( unit === OpenLayers.TimeUnit.MINUTES) {
					return 1000*60;
				} else if ( unit === OpenLayers.TimeUnit.HOURS) {
					return 1000*60*60;
				} else if ( unit === OpenLayers.TimeUnit.DAYS) {
					return 1000*60*60*24;
				} else if ( unit === OpenLayers.TimeUnit.MONTHS) {
					return 1000*60*60*24*31;
				} else if ( unit === OpenLayers.TimeUnit.YEARS) {
					return 1000*60*60*24*31*365;
				}
			}
			
			// verify if timeslider params are consistent with each others
			var startTime = this.cruisePanelView.startTime.getValue();
			var endTime = this.cruisePanelView.endTime.getValue();
			var step = this.cruisePanelView.stepValueField.getValue();
			var unit = this.cruisePanelView.stepUnitsField.getValue();
			
			var period = endTime.getTime() - startTime.getTime();
			var stepSize = step * computeDuration(unit);
			
			// at least one bg and on vehicle must be selected
			/*if ( this.cruisePanelView.vehicleSelector.toMultiselect.store.getCount()<1
					|| this.cruisePanelView.backgroundSelector.toMultiselect.store.getCount()<1  ){
						Ext.Msg.show({
									title: 'Cannot save this configuration',
									msg: 'You must select at least one vehicle and at least one background.',
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.ERROR
								});
				return;
			}*/
			
			
			if ( endTime.getTime() <= startTime.getTime() ){
				Ext.Msg.show({
						title: 'Cannot save this configuration',
						msg: 'End date must be after start date',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});
			} else if (stepSize > period ){
				Ext.Msg.show({
					title: 'Cannot save this configuration',
					msg: 'Step bigger than time period for animations',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
				});		
			
			} else {
				
				var self = this;
				// verfy if the name is already taken
				this.geostore.count(this.cruisePanelView.name.getValue(), {
					onFailure: function( response ){
							Ext.Msg.show({
								title: 'Cannot save this configuration',
								msg: 'Cannot connect to GeoStore',
								buttons: Ext.Msg.OK,
								icon: Ext.MessageBox.ERROR
							});			
					},
					onSuccess: function( count ){
						if ( count > 1 || ( count>0 && ( self.mapId===-1) ) ){
							Ext.Msg.show({
								title: 'Cannot save this configuration',
								msg: 'Name already used',
								buttons: Ext.Msg.OK,
								icon: Ext.MessageBox.ERROR
							});	
							self.cruisePanelView.name.markInvalid();				
						} else {					
							
							// create a configuration from form fields
							var conf = ConfigurationBuilder.create({
										name: self.cruisePanelView.name.getValue(),
										description: self.cruisePanelView.name.getValue(),
										timeRange: [self.cruisePanelView.startTime.getValue().format("Y-m-d\\TH:i:s.u\\Z"), 
													self.cruisePanelView.endTime.getValue().format("Y-m-d\\TH:i:s.u\\Z")],
										timeStep: self.cruisePanelView.stepValueField.getValue(),
										timeFrameRate: self.cruisePanelView.rateValueField.getValue(),
										timeUnits: self.cruisePanelView.stepUnitsField.getValue(),
										// models: self.cruisePanelView.modelSelector.toMultiselect.store.data.items,
										// backgrounds: self.cruisePanelView.backgroundSelector.toMultiselect.store.data.items,
										
										models: self.cruisePanelView.modelSelector.getSelectedLayers(),
										modelsProperties: self.models,
										defaultModels: self.defaultModels,	
		
										backgrounds: self.cruisePanelView.backgroundSelector.getSelectedLayers(),
										backgroundsProperties: self.backgrounds,
										defaultBackgrounds: self.defaultBackgrounds,
										
										sourcesProperties: self.sourcesProperties,
										selectedModelsSources: self.cruisePanelView.modelSelector.getSourcesList(),
										slectedBackgroundsSources: self.cruisePanelView.backgroundSelector.getSourcesList(),										
										
										vehicles: self.cruisePanelView.vehicleSelector.toMultiselect.store.data.items,
										watermarkPosition: self.cruisePanelView.watermarkPosition.getValue(),
										watermarkUrl: self.cruisePanelView.watermarkUrl.getValue(),
										watermarkText: self.cruisePanelView.watermarkText.getValue(),
										bounds: [self.nwTextField.getValue(), self.swTextField.getValue(), self.seTextField.getValue(), self.neTextField.getValue()],
										geoserverBaseUrl: self.geoserverBaseUrl
									});				

							if (self.mapId === -1) { // a new configuration is created	
								var filename = self.fileForm.fileuploadField.getValue();
								if (filename && filename !== '') {
									self.uploadFileAndSave( conf );
								} else {
									conf.setParam('watermarkUrl', self.defaultWatermarkUrl );
									self.save( conf );		
								}

							} else { // an old conf is updated
								var filename = self.fileForm.fileuploadField.getValue();

								if (filename && filename !== '') { // a new logo is defined, use this one
									self.updateAndUploadFile( conf );
								} else {
									self.update( conf );
								}
							}
						}
					}
				});				
				
	
			}
			

		} else {
				Ext.Msg.show({
					title: 'Cannot save this configuration',
					msg: 'Some fields contain invalid values',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
				});
		}

	},
	
	createLoadCruiseHandler: function( caller ){
		return function(){
			caller.loadCruise( caller.mapId, function(){
				Ext.Msg.show({
					title: 'Configuration Reloading',
					msg: 'The configuration has been reloaded successfully',
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.INFO
				});
			} );
		};
	},
	
	loadCruise: function(mapId, callback){
		var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, loading..."});
		appMask.show();
		
		var self = this;
		this.geostore.findByPk(mapId, {
			params: { full: true },
			onFailure: function loadCruise_findByPK_callback_failed(response){
				appMask.hide();
				console.error(response);
				Ext.Msg.show({
					title: 'Cannot read configuration',
					msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.ERROR
				});			
			},
			onSuccess: function loadCruise_findByPK_callback_success(data) {
						appMask.hide();
						// get blob as a json object
						var payload = null;
						try {
							// payload = JSON.parse(data.blob);
							payload = Ext.util.JSON.decode(data.blob);
						} catch (e) {
							console.error(e);
						}

						// reset original values
						self.clean();
						// populate form fields
						self.mapId = data.id;
						self.cruisePanelView.name.setValue(data.name);

						if (payload) {

								self.gsSources = payload.gsSources;
								
								// TODO externalize
								self.cruisePanelView.startTime.setValue(Date.parseDate(payload.timeRange[0], "Y-m-d\\TH:i:s.u\\Z"));
								self.cruisePanelView.endTime.setValue(Date.parseDate(payload.timeRange[1], "Y-m-d\\TH:i:s.u\\Z"));
								self.cruisePanelView.watermarkUrl.setValue(payload.watermarkUrl);
								self.cruisePanelView.watermarkText.setValue(payload.watermarkText);
								self.cruisePanelView.watermarkPosition.setValue(payload.watermarkPosition);
								self.cruisePanelView.watermarkLogo.setVisible(true);
								self.cruisePanelView.watermarkLogo.getEl().dom.src = payload.watermarkUrl;

								self.cruisePanelView.stepValueField.setValue(payload.timeStep);
								self.cruisePanelView.rateValueField.setValue(payload.timeFrameRate);
								self.cruisePanelView.stepUnitsField.setValue(payload.timeUnits);



								self.updateItemSelector(self.cruisePanelView.vehicleSelector, payload.vehicleSelector.data, 
								function(selected, multiselectItem) {
									return selected[1] === multiselectItem.value;
								});
								
								self.cruisePanelView.modelSelector.selectLayers( payload.models );
								self.cruisePanelView.backgroundSelector.selectLayers( payload.backgrounds );
								
								/*self.updateItemSelector(self.cruisePanelView.modelSelector, payload.models, 
								function(selected, multiselectItem) {
									return selected.name === multiselectItem.name;
								});
								self.updateItemSelector(self.cruisePanelView.backgroundSelector, payload.backgrounds, 
								function(selected, multiselectItem) {
									return selected.name === multiselectItem.value;
								});*/

								var bounds = new OpenLayers.Bounds(payload.bounds);
								var proj = new OpenLayers.Projection("EPSG:4326");
								bounds.transform(proj, self.tinyMap.mapPanel.map.getProjectionObject());

								self.tinyMap.mapPanel.map.zoomToExtent( bounds, true );

								if (callback){
									// cruise loaded correctly, call callback
									callback();
								}

						} else {
								Ext.Msg.show({
									title: 'Cannot load this configuration properly',
									msg: 'The format read from server is unknown',
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.ERROR
								});
						}

						// enable editing
						self.enable();
			
			}
		});
		
	},
	
	save: function( conf ){

		var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, saving..."});
		appMask.show();

		var self = this;
		// send the current conf to the server
		this.geostore.create(conf.build(), {
				onFailure: function save_create_failed( response ){
					appMask.hide();
					console.error(response);
					Ext.Msg.show({
						title: 'Cannot save this configuration',
						msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});					
				},
				onSuccess: function save_create_success(newId){
					appMask.hide();
					// console.log( newId );
					Ext.Msg.show({
						title: 'Configuration saved',
						msg: 'configuration saved successfully',
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.INFO
					});	
					self.reload(
						function(data){
								var store = data.store;
								var item = store.getById(newId);
								self.cruiseListView.select(item, false, true);
								self.loadCruise( newId );
					});
				}
			});

	},

	uploadFileAndSave: function( conf ){
		
		var filestore = new GeoStore.Filestore(
			{
				authorization: this.token,
				proxy: this.proxy,
				url: this.fileUploaderServlet
			}		
		);
		
		var self = this;
		filestore.uploadFromForm(
			this.fileForm.getForm(),
			{
				waitMsg: 'Uploading watermark',
				waitMsgTarget: true,
				onSuccess: function( response ){
					if (response.success) {
							// add address for uploaded file
							conf.setParam('watermarkUrl', filestore.getBaseDir() + response.result.code);
							self.save( conf );
						
					} else {
						Ext.Msg.show({
									title: "Cannot upload watermark",
									msg: response.errorMessage,
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.ERROR
								});
					}					
				},
				onFailure: function( response ) {
					console.error( response );
					Ext.Msg.show({
						title: "Cannot upload watermark",
						msg: "File does not exist or is not valid.",
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
					});
				}
			}
		);
		
		},

		update: function( conf ){
			
				var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, updating..."});
				appMask.show();
			
				var self = this;
				// keep the old version for logo file and upload only changes
				this.geostore.updateData(
						self.mapId, conf.build().blob,{
						onFailure: function(response){
							appMask.hide();
							console.error(response);
							Ext.Msg.show({
									title: 'Cannot save this configuration',
									msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.ERROR
							});
						},
						onSuccess: function(data){
							appMask.hide();
							// It is necessary to update both metadata and data in two steps!
							self.geostore.update(
								self.mapId, conf.build(), {
									onFailure: function update_geostore_update_failed( response ){
										console.error(response);
										Ext.Msg.show({
											title: 'Cannot save this configuration',
											msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
											buttons: Ext.Msg.OK,
											icon: Ext.MessageBox.ERROR
										});
									},
									onSuccess: function update_geostore_update_success( data ){
											Ext.Msg.show({
													title: 'Configuration updated',
													msg: 'configuration updated successfully',
													buttons: Ext.Msg.OK,
													icon: Ext.MessageBox.OK
											});
											var mapId = self.mapId;
											self.reload(function(data){
														var store = data.store;
														var item = store.getById(mapId);
														self.cruiseListView.select(item, false, true);
														self.loadCruise( mapId );

												});
									}
								});
											
						}	
				}); 							
								
		},
		
		updateAndUploadFile: function( conf ){
			
			var filestore = new GeoStore.Filestore(
				{
					authorization: this.token,
					proxy: this.proxy,
					url: this.fileUploaderServlet
				}		
			);
			
			var self = this;
			filestore.uploadFromForm(
				this.fileForm.getForm(),
				{
					waitMsg: 'Uploading watermark',
					waitMsgTarget: true,
					onFailure: function(response) {
						console.error(response);
						Ext.Msg.show({
							title: "Cannot upload watermark",
							msg: action.responseText,
							buttons: Ext.Msg.OK,
							icon: Ext.MessageBox.ERROR
						});
					},
					onSuccess: function( response ){
						if (response.success) {
							// overwrite old watermark url
							conf.setParam('watermarkUrl', filestore.getBaseDir() + response.result.code);
							self.update( conf );
						} else {
							Ext.Msg.show({
								title: "Cannot upload watermark",
								msg: response.errorMessage,
								buttons: Ext.Msg.OK,
								icon: Ext.MessageBox.ERROR
							});
						}						
					}
				}
		   );

		},
		
		enable: function() {
			this.cruisePanelView.name.enable();
			this.cruisePanelView.startTime.enable();
			this.cruisePanelView.endTime.enable();
			this.fileForm.fileuploadField.enable();
			this.cruisePanelView.watermarkPosition.enable();
			this.cruisePanelView.watermarkText.enable();
			this.cruisePanelView.modelSelector.enable();
			this.cruisePanelView.vehicleSelector.enable();
			this.cruisePanelView.backgroundSelector.enable();
			
			
			// hack: the following two listeners are needed to cancel invalid reds after a failed save
			var self = this;
			this.cruisePanelView.vehicleSelector.toMultiselect.store.on(
				"add", function(){
					 self.cruisePanelView.vehicleSelector.toMultiselect.clearInvalid();
			});
			/*this.cruisePanelView.backgroundSelector.toMultiselect.store.on(
				"add", function(){
					 self.cruisePanelView.backgroundSelector.toMultiselect.clearInvalid();
			});*/
			

			Ext.getCmp('vehicle-selector-btn').enable();

			this.cruisePanelView.stepValueField.enable();
			this.cruisePanelView.rateValueField.enable();
			this.cruisePanelView.stepUnitsField.enable();

			this.saveButton.setText(this.mapId === -1 ? 'Save' : 'Update');
			
			if ( !Application.user.isGuest() ){
				this.saveButton.enable();
				this.deleteButton.enable();
			} else {
				this.saveButton.disable();
				this.deleteButton.disable();
			}
			
			this.viewButton.enable();
			this.reloadButton.enable();

		},

		disable: function() {
			this.cruisePanelView.name.disable();
			this.cruisePanelView.startTime.disable();
			this.cruisePanelView.endTime.disable();
			this.fileForm.fileuploadField.disable();
			this.cruisePanelView.watermarkPosition.disable();
			this.cruisePanelView.watermarkPosition.disable();
			this.cruisePanelView.modelSelector.disable();
			this.cruisePanelView.vehicleSelector.disable();
			this.cruisePanelView.backgroundSelector.disable();

			Ext.getCmp('vehicle-selector-btn').disable();

			this.cruisePanelView.stepValueField.disable();
			this.cruisePanelView.rateValueField.disable();
			this.cruisePanelView.stepUnitsField.disable();

			this.saveButton.setText('Save');
			this.saveButton.disable();
			this.deleteButton.disable();
			this.viewButton.disable();
			this.reloadButton.disable();
		},

		clean: function() {
			this.cruisePanelView.name.reset(); // ok
			this.cruisePanelView.startTime.reset(); // ok
			this.cruisePanelView.endTime.reset(); // ok
			this.mapId = -1; // ok

			this.cruisePanelView.watermarkLogo.setVisible(false); // ok
			this.cruisePanelView.watermarkPosition.reset(); // ok
			this.cruisePanelView.watermarkText.reset(); // ok
			this.cruisePanelView.watermarkLogo.getEl().dom.src = ''; // ok

			this.cruisePanelView.stepValueField.reset(); // ok
			this.cruisePanelView.rateValueField.reset(); // ok
			this.cruisePanelView.stepUnitsField.reset(); // ok

			this.cruisePanelView.vehicleSelector.reset();  // ok
			this.cruisePanelView.modelSelector.reset(); // ok
			this.cruisePanelView.backgroundSelector.reset(); // ok
		},

		createCruise: function() {
			this.cruiseListView.clearSelections();
			this.clean();
			this.enable();
			this.deleteButton.disable();
			this.viewButton.disable();
			this.reloadButton.disable();
			
			//
			// Defautl settings
			//
			this.cruisePanelView.watermarkLogo.setVisible(true);
			this.cruisePanelView.watermarkLogo.getEl().dom.src = this.defaultWatermarkUrl;
		},

		reload: function( callback ){
			this.clean();
			if (callback){
				var self = this;
				var handler = function(){
					callback( self );
					self.store.un( 'load', handler);
				};
				this.store.on( 'load', handler);
			}
			this.store.reload();
		},

		deleteCruise: function() {
			
			
			
			var self = this;
			Ext.MessageBox.show({
			           title:'Logout',
			           msg: 'You are deleting this configuraton forever. This operation cannot be undone. <br/>Are you sure?',
			           buttons: Ext.MessageBox.YESNO,
			           fn: function(btn){
							if ( btn === 'yes' ){
								
								var appMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait, deleting..."});
								appMask.show();
	
								self.geostore.deleteByPk(self.mapId, {
									onFailure: function(response){
										appMask.hide();
										console.error(response);
										Ext.Msg.show({
												title: 'Cannot delete this configuration',
												msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
												buttons: Ext.Msg.OK,
												icon: Ext.MessageBox.ERROR
										});
									},
									onSuccess: function( data){
										appMask.hide();
										self.reload();
										self.disable();
									}
								});
							}

					   },
			           icon: Ext.MessageBox.QUESTION
			       });

		},

		updateItemSelector: function(selector, selectedItems, isEqual) {
			// in this array I keep the list of removed item from the multiselect
			// I need it because it is not safe to delete items within a for loop
			var removed = new Array;
			var availableItems = selector.fromMultiselect.view.store.data.items;
			if (!availableItems || !selectedItems) {
				return;
			}

			for (var i = 0; i < availableItems.length; i++) {
				var item = availableItems[i];

				for (var j = 0; j < selectedItems.length; j++) {
					
					if (isEqual(selectedItems[j], item.data) ) {
						selector.toMultiselect.store.add(item);
						removed.push(item);
					}
				}
			}

			if (removed.length > 0) {
				for (var i = 0; i < removed.length; i++) {
					selector.fromMultiselect.view.store.remove(removed[i]);
				}
			}
			// tricky: it seems necessary to refresh the content of toMultiselect
			selector.toMultiselect.view.refresh();
			selector.fromMultiselect.view.refresh();
			selector.toMultiselect.view.select([selector.toMultiselect.view.store.getCount() - 1]);
		},



		validateForm: function() {
		
			var vSelector = this.cruisePanelView.vehicleSelector;
			var vehicleIsValid = vSelector.toMultiselect.store.data.items.length > 0;
			
			if(!vehicleIsValid){
				vSelector.markInvalid("At least one vehicle must be selected");
			}else{
				vSelector.clearInvalid();
			}
			
			/*var bgSelector = this.cruisePanelView.backgroundSelector;
			var bgIsValid = bgSelector.getSelectedLayers().length > 0;
			
			if(!bgIsValid){
				Ext.Msg.show({
						title: 'Background Settings',
						msg: "At least one background layer must be selected",
						buttons: Ext.Msg.OK,
						icon: Ext.MessageBox.ERROR
				});
			}*/
			
			var isValid = this.cruisePanelView.name.isValid(false) && this.cruisePanelView.startTime.isValid(false) && this.cruisePanelView.endTime.isValid(false) &&
			// this.cruisePanelView.watermarkUrl.isValid(false) &&
			this.cruisePanelView.watermarkPosition.isValid(false) 
			// && this.cruisePanelView.modelSelector.isValid(false) 
			&& vehicleIsValid
			//&& bgIsValid
			/*&& this.cruisePanelView.vehicleSelector.toMultiselect.isValid(false) && this.cruisePanelView.backgroundSelector.toMultiselect.isValid(false)*/
			&& this.cruisePanelView.stepValueField.isValid(false) && this.cruisePanelView.rateValueField.isValid(false) && this.cruisePanelView.stepUnitsField.isValid(false);
			
			return isValid;
		}		
	});

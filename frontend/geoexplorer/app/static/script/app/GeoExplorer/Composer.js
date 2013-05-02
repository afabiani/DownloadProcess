/**
 * Copyright (c) 2009-2010 The Open Planning Project
 *
 * @requires GeoExplorer.js
 */

/** api: (define)
 *  module = GeoExplorer
 *  class = GeoExplorer.Composer(config)
 *  extends = GeoExplorer
 */

/** api: constructor
 *  .. class:: GeoExplorer.Composer(config)
 *
 *      Create a GeoExplorer application intended for full-screen display.
 */
GeoExplorer.Composer = Ext.extend(GeoExplorer, {

    // Begin i18n.
    saveMapText: "Export Map",
    loadMapText: "Import Map",
    exportMapText: "Export Map",
    toolsTitle: "Choose tools to include in the toolbar:",
    previewText: "Preview",
    backText: "Back",
    nextText: "Next",
    fullScreenText: "Full Screen",	
    // End i18n.
	
    constructor: function(config, mapId) {     
	    this.mapId = mapId;
		config.tools = [
            {
                ptype: "gxp_layertree",
                outputConfig: {
                    id: "layertree"
                },
                outputTarget: "tree"
            }, {
                ptype: "gxp_legend",
                outputTarget: 'legend',
                outputConfig: {
                    autoScroll: true
                },
                legendConfig : {
                    legendPanelId : 'legendPanel',
                    defaults: {
                        style: 'padding:5px',                  
                        baseParams: {
                            LEGEND_OPTIONS: 'forceLabels:on; fontSize:10',
                            WIDTH: 12, HEIGHT: 12
                        }
                    }
                }

            },
			/* {
                ptype: "gxp_log_files",
                outputTarget: 'logfileTabs'

            }, */
			/*{
                ptype: "gxp_addlayers",
                actionTarget: "tree.tbar",
                upload: true
            }, {
                ptype: "gxp_removelayer",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_removeoverlays",
                actionTarget: "tree.tbar"
            }, {
                ptype: "gxp_addgroup",
                actionTarget: "tree.tbar"
            }, {
                ptype: "gxp_removegroup",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_groupproperties",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            },{
                ptype:"gxp_geonetworksearch",
                actionTarget:[
                   "layertree.contextMenu"
                ]
            },*/
			{
                ptype: "gxp_zoomtolayerextent",
                actionTarget: {target: "layertree.contextMenu", index: 0}
            }, {
                ptype: "gxp_layerproperties",
                actionTarget: ["tree.tbar", "layertree.contextMenu"]
            }, {
                ptype: "gxp_navigation", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 1}
            }, {
                ptype: "gxp_wmsgetfeatureinfo", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 2}
            }, {
                ptype: "gxp_measure", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 3}
            }, {
                ptype: "gxp_zoom",
                actionTarget: {target: "paneltbar", index: 4}
            }, {
                ptype: "gxp_zoombox", toggleGroup: this.toggleGroup,
                actionTarget: {target: "paneltbar", index: 6}
            }, {
                ptype: "gxp_navigationhistory",
                actionTarget: {target: "paneltbar", index: 8}
            }, {
                ptype: "gxp_zoomtoextent",
                actionTarget: {target: "paneltbar", index: 10}
            }/*, {
		        ptype:"gxp_embedded_link",
		        actionTarget: {target: "paneltbar", index: 11}
		    }*/
        ]; 

		//
		// Add custom tools if defined.
		//
		if(config.customTools){
		    var toolSize = config.customTools.length;
		    for(var i=0; i<toolSize; i++){
				config.tools.push(config.customTools[i]);
			}			
		}		
		

        GeoExplorer.Composer.superclass.constructor.apply(this, arguments);
    },

    /** api: method[destroy]
     */
    destroy: function() {
        this.loginButton = null;
        GeoExplorer.Composer.superclass.destroy.apply(this, arguments);
    },
    
    /**
     * api: method[createTools]
     * Create the toolbar configuration for the main view.
     */
    createTools: function() {
        var tools = GeoExplorer.Composer.superclass.createTools.apply(this, arguments);
         
        if(!this.fScreen){
            var fullScreen = new Ext.Button({
                text: this.fullScreenText,
                id: "full-screen-button",
                iconCls: "icon-fullscreen",
                enableToggle: true,
                handler: function(button, evt){
                    if(button.pressed){
                        Ext.getCmp('tree').findParentByType('panel').collapse();
						Ext.getCmp('east').collapse();
						Ext.getCmp('south').collapse();
					    Ext.getCmp('main-header').collapse();
                    } else {
                        Ext.getCmp('tree').findParentByType('panel').expand();
						Ext.getCmp('east').expand();
						Ext.getCmp('south').expand();
						Ext.getCmp('main-header').expand();
                    }
                }
            });            
                            
            tools.unshift(fullScreen);
        }
        
        /*tools.push(new Ext.Button({
            tooltip: this.saveMapText,
            handler: function() {
                this.save(this.showUrl);
            },
            scope: this,
            iconCls: "icon-save"
        }));        
        
        tools.push(new Ext.Button({
            tooltip: this.loadMapText,
            handler: function() {    
                var composer = this; 
                var win;  
                  
                var fp = new Ext.FormPanel({
                    fileUpload: true,
                    autoWidth: true,
                    autoHeight: true,
                    frame: true,
                    bodyStyle: 'padding: 10px 10px 0 10px;',
                    labelWidth: 50,
                    defaults: {
                        anchor: '95%',
                        allowBlank: false,
                        msgTarget: 'side'
                    },
                    items: [{
                        xtype: 'fileuploadfield',
                        id: 'form-file',
                        emptyText: 'Select a Map context file',
                        fieldLabel: 'File',
                        name: 'file-path',
                        buttonText: '',
                        buttonCfg: {
                            iconCls: 'upload-icon'
                        }
                    }],
                    buttons: [{
                        text: 'Upload',
                        handler: function(){
                            if(fp.getForm().isValid()){
                              fp.getForm().submit({
                                  url: app.xmlJsonTranslateService + 'HTTPWebGISFileUpload',
                                  //url: proxy + app.xmlJsonTranslateService + 'HTTPWebGISFileUpload',
                                  waitMsg: 'Uploading your context file...',
                                  success: function(fp, o){
                                      win.hide();
                                      var json_str = unescape(o.result.result);
                                      json_str = json_str.replace(/\+/g, ' ');
                                      
                                      composer.loadUserConfig(json_str);  
                                      
                                      //app.modified = true;
                                      modified = true;                                    
                                  },                                    
                                  failure: function(fp, o){
                                      win.hide();
                                      win.destroy();
                                      
                                      Ext.Msg.show({
                                         title:'File Upload Error',
                                         msg: o.result.errorMessage,
                                         buttons: Ext.Msg.OK,
                                         icon: Ext.MessageBox.ERROR
                                      });
                                  }
                              });
                            }
                        }
                    }]
                });
                
                win = new Ext.Window({
                    title: 'File Upload Form',
                    id: 'upload-win',
                    layout: 'form',
                    labelAlign: 'top',
                    modal: true,
                    bodyStyle: "padding: 5px",
                    width: 380,
                    items: [fp]
                });
                
                win.show();
            },
            scope: this,
            iconCls: "icon-load"
        }));*/
        
        return tools;
    },
    /*
     * private: method[disableAllFunc]
     */    
    disableAllFunc: function(){
        var navigation = this.mapPanel.map.getControlsByClass('OpenLayers.Control.Navigation');
        var panPanel = this.mapPanel.map.getControlsByClass('OpenLayers.Control.PanPanel');
        var zoomPanel = this.mapPanel.map.getControlsByClass('OpenLayers.Control.ZoomPanel');
     
        navigation[0].deactivate();
        navigation[1].deactivate();
        panPanel[0].deactivate();
        zoomPanel[0].deactivate();

        for(var panel in this.portalItems[0].items){
            if(this.portalItems[0].items[panel].id == "west"){         
                this.portalItems[0].items[panel].disable();            
            }
            if(this.portalItems[0].items[panel].id == "east"){                                
                this.portalItems[0].items[panel].disable();              
            }        
        }    

   		var south = Ext.getCmp('south');
		
		if(south){
			south.disable();
		}
        
        for(var map in this.mapPanel.items.items){
            if(this.mapPanel.items.items[map].xtype == "gx_zoomslider"){  
                this.mapPanel.items.items[map].hide();
            } 
            if(this.mapPanel.items.items[map].xtype == "gxp_scaleoverlay"){  
                this.mapPanel.items.items[map].hide();
            }        
        }                
        
        for(var items in this.toolbar.items.items){
            if(this.toolbar.items.items[items].id == "full-screen-button"){
                this.toolbar.items.items[items].disable();
            }
        }

        for(var tool in this.tools){            
            if(this.tools[tool].ptype == "gxp_measure"){  
                this.tools[tool].actions[0].disable();
            }               
            if(this.tools[tool].ptype == "gxp_wmsgetfeatureinfo"){  
                this.tools[tool].actions[0].disable();
            }
            if(this.tools[tool].ptype == "gxp_embedded_link"){  
                this.tools[tool].actions[0].disable();
            }            
            if(this.tools[tool].ptype == "gxp_navigation"){  
                this.tools[tool].actions[0].items[0].disable();
            }                                                        
            if(this.tools[tool].ptype == "gxp_navigationhistory"){  
                this.tools[tool].actions[0].items[0].disable();
                this.tools[tool].actions[1].items[0].disable();
            }
            if(this.tools[tool].ptype == "gxp_zoom"){  
                this.tools[tool].actions[0].items[0].disable();
                this.tools[tool].actions[1].items[0].disable();
            }   
            if(this.tools[tool].ptype == "gxp_zoombox"){  
                this.tools[tool].actions[0].disable();
                this.tools[tool].actions[1].disable();
            }  
            if(this.tools[tool].ptype == "gxp_zoomtoextent"){  
                this.tools[tool].actions[0].items[0].disable();
            }          
            if(this.tools[tool].ptype == "gxp_zoomtolayerextent"){  
                this.tools[tool].actions[0].items[0].disable();
            }                
        }
    },
    /*
     * private: method[enableAllFunc]
     */       
    enableAllFunc: function(){
        
        var navigation = this.mapPanel.map.getControlsByClass('OpenLayers.Control.Navigation');
        var panPanel = this.mapPanel.map.getControlsByClass('OpenLayers.Control.PanPanel');
        var zoomPanel = this.mapPanel.map.getControlsByClass('OpenLayers.Control.ZoomPanel');
 
        navigation[0].activate();
        navigation[1].activate();
        panPanel[0].activate();
        zoomPanel[0].activate();

        for(var panel in this.portalItems[0].items){
            if(this.portalItems[0].items[panel].id == "west"){
                this.portalItems[0].items[panel].enable();            
            }
            if(this.portalItems[0].items[panel].id == "east"){  
                this.portalItems[0].items[panel].enable();
            }       
        }    

		var south = Ext.getCmp('south');
		
		if(south){
			south.enable();
		}
        
        for(var a=0;a<this.mapPanel.items.items.length;a++){
            if(this.mapPanel.items.items[a].xtype == "gx_zoomslider"){  
                this.mapPanel.items.items[a].show();
            } 
            if(this.mapPanel.items.items[a].xtype == "gxp_scaleoverlay"){  
                this.mapPanel.items.items[a].show();
            }              
        }    
                                            
        for(var items in this.toolbar.items.items){
            if(this.toolbar.items.items[items].id == "full-screen-button"){
                this.toolbar.items.items[items].enable();
            }
        }
        
        for(var tool in this.tools){        
            if(this.tools[tool].ptype == "gxp_measure"){  
                this.tools[tool].actions[0].enable();
            }          
            if(this.tools[tool].ptype == "gxp_wmsgetfeatureinfo"){  
                this.tools[tool].actions[0].enable();
            }            
            if(this.tools[tool].ptype == "gxp_embedded_link"){  
                this.tools[tool].actions[0].enable();
            }            
            if(this.tools[tool].ptype == "gxp_navigation"){  
                this.tools[tool].actions[0].items[0].enable();
            }                                                       
            if(this.tools[tool].ptype == "gxp_navigationhistory"){
                if (this.tools[tool].actions[0].control.active){
                    this.tools[tool].actions[0].items[0].enable();
                }
                if (this.tools[tool].actions[1].control.active){
                    this.tools[tool].actions[1].items[0].enable();
                }
            }
            if(this.tools[tool].ptype == "gxp_zoom"){  
                this.tools[tool].actions[0].items[0].enable();
                this.tools[tool].actions[1].items[0].enable();
            }   
            if(this.tools[tool].ptype == "gxp_zoombox"){  
                this.tools[tool].actions[0].enable();
                this.tools[tool].actions[1].enable();
            }  
            if(this.tools[tool].ptype == "gxp_zoomtoextent"){  
                this.tools[tool].actions[0].items[0].enable();
            }   
            if(this.tools[tool].ptype == "gxp_zoomtolayerextent"){  
                this.tools[tool].actions[0].items[0].enable();
            }                                                 
        }
    },
    /*
     * private: method[openPreview]
     */
    viewMetadata: function(gnURL, uuid, title){
        var tabPanel = Ext.getCmp(app.renderToTab);
        
        var tabs = tabPanel.find('title', title);
        if(tabs && tabs.length > 0){
            tabPanel.setActiveTab(tabs[0]); 
        }else{
            var metaURL = gnURL + "metadata.show?uuid=" + uuid; 
            
            var meta = new Ext.Panel({
                title: title,
                layout:'fit', 
                tabTip: title,
                closable: true,
                items: [ 
                    new Ext.ux.IFrameComponent({ 
                        url: metaURL 
                    }) 
                ]
            });
            
            tabPanel.add(meta);
        }
    },

    /** private: method[openPreview]
     */
    openPreview: function(embedMap) {
        var preview = new Ext.Window({
            title: this.previewText,
            layout: "fit",
            items: [{border: false, html: embedMap.getIframeHTML()}]
        });
        preview.show();
        var body = preview.items.get(0).body;
        var iframe = body.dom.firstChild;
        var loading = new Ext.LoadMask(body);
        loading.show();
        Ext.get(iframe).on('load', function() { loading.hide(); });
    },

    /** private: method[showEmbedWindow]
     */
    showEmbedWindow: function() {
       var toolsArea = new Ext.tree.TreePanel({title: this.toolsTitle, 
           autoScroll: true,
           root: {
               nodeType: 'async', 
               expanded: true, 
               children: this.viewerTools
           }, 
           rootVisible: false,
           id: 'geobuilder-0'
       });

       var previousNext = function(incr){
           var l = Ext.getCmp('geobuilder-wizard-panel').getLayout();
           var i = l.activeItem.id.split('geobuilder-')[1];
           var next = parseInt(i, 10) + incr;
           l.setActiveItem(next);
           Ext.getCmp('wizard-prev').setDisabled(next==0);
           Ext.getCmp('wizard-next').setDisabled(next==1);
           if (incr == 1) {
               this.saveAndExport();
           }
       };

       var embedMap = new gxp.EmbedMapDialog({
           id: 'geobuilder-1',
           url: "viewer" + "#maps/" + this.id
       });

       var wizard = {
           id: 'geobuilder-wizard-panel',
           border: false,
           layout: 'card',
           activeItem: 0,
           defaults: {border: false, hideMode: 'offsets'},
           bbar: [{
               id: 'preview',
               text: this.previewText,
               handler: function() {
                   this.saveAndExport(this.openPreview.createDelegate(this, [embedMap]));
               },
               scope: this
           }, '->', {
               id: 'wizard-prev',
               text: this.backText,
               handler: previousNext.createDelegate(this, [-1]),
               scope: this,
               disabled: true
           },{
               id: 'wizard-next',
               text: this.nextText,
               handler: previousNext.createDelegate(this, [1]),
               scope: this
           }],
           items: [toolsArea, embedMap]
       };

       new Ext.Window({
            layout: 'fit',
            width: 500, height: 300,
            title: this.exportMapText,
            items: [wizard]
       }).show();
    }
});

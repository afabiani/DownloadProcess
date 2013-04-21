/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 
/**
 * requires 
 * include 
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = WFSGrid
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: WFSGrid(config)
 *
 *    WFS interface to show data in a Ext.Grid
 */   
gxp.plugins.WFSGrid = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_featuregrid */
    ptype: "gxp_wfsgrid",
    
    /** api: config[featureType]
     *  ``String``
     */
    featureType: null,
    
    /** api: config[wfsURL]
     *  ``String``
     */
    wfsURL: null,
    
	/** api: config[id]
     *  ``String``
     */
    id: "featuregrid",
		  
    zoomToIconPath: "theme/app/img/silk/map_magnify.png",
    
	addToIconPath: "theme/app/img/silk/add.png",
	
    zoomToTooltip: 'Zoom to this feature',
    
	addToDownloadListTooltip: 'Add to download List',
	
	projection: "",
	
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.WFSGrid.superclass.constructor.apply(this, arguments);         
    },
	
	buildStore: function() {
			
		var store = new WFSStore({
			root: 'features',
			idProperty: 'id', 
			typeName: this.featureType,
			
			proxy : new Ext.data.HttpProxy({
				method: 'GET',
				url: this.wfsURL
				
			}),
			
			fields: this.fields
		});
		
		return store;
	},
	
	onTargetSelect: function(check, rowIndex, e) {
		var grid = check.grid;
		var record = grid.store.getAt(rowIndex);
		var geom = record.get("geometry");
		
		var map = this.target.mapPanel.map;
		
		var targetLayer = map.getLayersByName("selectedFeature")[0];
		if(!targetLayer){
			targetLayer = new OpenLayers.Layer.Vector("selectedFeature",{
				displayInLayerSwitcher: false,
				style: {
					strokeColor: "#FF00FF",
					strokeWidth: 2,
					fillColor: "#FF00FF",
					fillOpacity: 0.8
				}
			});
			
			map.addLayer(targetLayer);
		}
		
		var geometry = this.getGeometry(map, geom);
		if(geometry) {
			var feature = new OpenLayers.Feature.Vector(geometry, { "featureID": record.id});
			targetLayer.addFeatures([feature]);						
		}
		
	},
	
	onTargetDeselect: function (selMod, rowIndex, record){
		var map = this.target.mapPanel.map;
		var targetLayer = map.getLayersByName("selectedFeature")[0];
		var unSelectFeatures= targetLayer.getFeaturesByAttribute("featureID", record.id);
		targetLayer.removeFeatures(unSelectFeatures);
	},
	
	getGeometry: function(map, geom) {
		var mapPrj = map.getProjectionObject();
		var selectionPrj = new OpenLayers.Projection(this.projection);
		var transform = mapPrj.equals(selectionPrj);
		var pointList;
		var geometry;
		
		switch(geom.type){
			case 'Polygon':
				var rings = [];
				for(var j = 0, ring; ring = geom.coordinates[j]; j++) {
					pointList = [];		
					for(var p=0, coords; coords = ring[p] ; p++) {
						var newPoint = new OpenLayers.Geometry.Point(coords[0],coords[1]);
						if(!transform){												
							newPoint = newPoint.transform(
								selectionPrj,
								mapPrj														
							);											
						}
						pointList.push(newPoint);
					}
					rings.push(new OpenLayers.Geometry.LinearRing(pointList));
				}
				
				geometry = new OpenLayers.Geometry.Polygon(rings);				
				break;			
				
			case 'MultiPolygon':
				var polygons = [];
				for(var i = 0, polygon; polygon = geom.coordinates[i]; i++) {
					var rings = [];
					for(var j = 0, ring; ring = polygon[j]; j++) {
						pointList = [];		
						for(var p=0, coords; coords = ring[p] ; p++) {
							var newPoint = new OpenLayers.Geometry.Point(coords[0],coords[1]);
							if(!transform){												
								newPoint = newPoint.transform(
									selectionPrj,
									mapPrj														
								);											
							}
							pointList.push(newPoint);
						}
						rings.push(new OpenLayers.Geometry.LinearRing(pointList));
					}
					polygons.push(new OpenLayers.Geometry.Polygon(rings));
				}
				
				geometry = new OpenLayers.Geometry.MultiPolygon(polygons);				
				break;			
		}
		return geometry;
	},
	
	buildGrid: function(store) {
		
		var checkConf = {
			listeners: {
				scope: this,				
				rowdeselect: this.onTargetDeselect,
				rowselect: this.onTargetSelect
			}
		};
		var checkSelModel = new Ext.grid.CheckboxSelectionModel(checkConf);
		return new Ext.grid.GridPanel({
			id: this.id,
			store: store,

			loadMask: {
				msg : "Caricamento in corso ..."
			},
			colModel: new Ext.grid.ColumnModel({
				columns: [checkSelModel,this.getZoomToAction()].concat(this.columnModel).concat(this.addToDownloadChart())
			}),
			viewConfig : {
				forceFit: true
			},
            sm: checkSelModel,
			bbar: new Ext.ux.LazyPagingToolbar({
				store: store,
				pageSize: 10									
			})
		});
	},	
	
    /** api: method[addOutput]
     */
    addOutput: function() {
		
		// build store
		this.store = this.buildStore();
		
		/*this.store.on('load', function(store, records){
			debugger;
		});*/
		
		// build grid
		this.grid = this.buildGrid(this.store);
		
		var params = {
						start: 0,
						limit: 10,
						sort: "location"
					};
		
		this.store.load({
						params: params
					});
		
		Ext.apply(this.grid, this.outputConfig || {} );
                      
        return gxp.plugins.WFSGrid.superclass.addOutput.call(this, this.grid);        
    },
    
    /** private: method[getZoomToAction]
     */
    getZoomToAction: function(actionConf){
        
        return {
			xtype: 'actioncolumn',
			sortable : false, 
			width: 30,
			items: [{
				iconCls : 'zoomIcon',
				tooltip: this.zoomToTooltip,
				scope: this,
				handler: function(grid, rowIndex, colIndex) {
					var record = grid.store.getAt(rowIndex);
					var map = this.target.mapPanel.map;
					var geometry = this.getGeometry(map, record.get("geometry"))
					map.zoomToExtent(geometry.getBounds());															
				}
			}]  
		 };
    },
	
	 /** private: method[getZoomToAction]
     */
    addToDownloadChart: function(actionConf){
        
        return {
			xtype: 'actioncolumn',
			sortable : false, 
			width: 10,
			items: [{
				iconCls: 'addIcon', 
				tooltip: this.addToDownloadListTooltip,
				scope: this,
				handler: function(grid, rowIndex, colIndex) {
					var record = grid.store.getAt(rowIndex);
					this.fireEvent('itemAdded', record);
				}
			}]  
		 };
    }
	
});

Ext.preg(gxp.plugins.WFSGrid.prototype.ptype, gxp.plugins.WFSGrid);

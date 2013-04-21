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
 
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: WFSGrid(config)
 *
 *    WFS interface to show data in a Ext.Grid
 */   
gxp.plugins.DownloadList = Ext.extend(gxp.plugins.Tool, {
	
	/** api: ptype = gxp_featuregrid */
    ptype: "gxp_downloadgrid",
	
	/** api: config[id]
     *  ``String``
     */
    id: "downloadgrid",
	
	delIconPath: "theme/app/img/silk/delete.png",
	
	downloadIconPath: "theme/app/img/ext/bottom2.gif",
	
	/** private: method[constructor]
    */
    constructor: function(config) {
        gxp.plugins.DownloadList.superclass.constructor.apply(this, arguments);         
    },
	
	/** api: method[addOutput]
     */
    addOutput: function() {
		this.grid = this.buildGrid();			
		Ext.apply(this.grid, this.outputConfig || {} );
        return gxp.plugins.DownloadList.superclass.addOutput.call(this, this.grid);        
    },
	
	buildGrid: function() {
		
		var storeEx = new Ext.data.ArrayStore({
			fields: [
				{name: 'filename', type: 'string'}
			]
		});
		
		var gridPanel = new Ext.grid.GridPanel({
		
			id: this.id,
			store: storeEx,

			loadMask: {
				msg : 'Loading...'
			},
			colModel: new Ext.grid.ColumnModel({
				
				columns: [
					{id: 'filename', header: 'filename', width: 10, sortable: true},
					{
						xtype:'actioncolumn',
						width:10,
						items: [{
							icon: this.delIconPath,
							tooltip: 'Delete',
							handler: function(grid, rowIndex, colIndex) {
								grid.getStore().removeAt(rowIndex);
							}
						}
						]
					}
					
				]
			}),
			viewConfig : {
				forceFit: true
			},
			tbar: new Ext.Toolbar({
				//renderTo: document.body,
				//width: 600,
				//height: 100,
				items: [
				{
					icon: this.downloadIconPath,
					text: 'Start Download',
					//ref: '../../downloadButton',
					handler: function(){
						
						
						
						
					}
				}]
			}),
			sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
			width: 400,
			height: 300,
			iconCls: 'icon-grid'
			
		});
		
		
		return gridPanel;
	}

});

	

Ext.preg(gxp.plugins.DownloadList.prototype.ptype, gxp.plugins.DownloadList);
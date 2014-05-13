/*
 *  https://github.com/geosolutions-it/fra2015
 *  Copyright (C) 2007-2012 GeoSolutions S.A.S.
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
package it.geosolutions.mariss.wps.gs;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.geotools.data.DataUtilities;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.factory.Hints;
import org.geotools.gce.imagemosaic.Utils;
import org.geotools.gce.imagemosaic.catalog.CatalogConfigurationBean;
import org.geotools.gce.imagemosaic.catalog.GranuleCatalogFactory;
import org.geotools.util.logging.Logging;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.geometry.BoundingBox;

/**
 * @author DamianoG
 *
 */
public class GranulesManager {

    static final Logger LOGGER = Logging.getLogger(GranulesManager.class);
    SimpleFeatureCollection granules;
    
    public GranulesManager(File mosaicDir){
        if(mosaicDir == null || !mosaicDir.exists() || !mosaicDir.isDirectory() || !mosaicDir.canRead()){
            LOGGER.severe("the passed parameter 'mosaicDir' is null or check if the file passed exist and it is a directory and if it can be read.");
        }
        else{
            this.granules = loadGranulesDescriptor(mosaicDir);
        } 
    }
    
    /**
     * Obtain the feature collection 
     * @param mosaicDir
     * @return
     * @throws IllegalStateException
     */
	private SimpleFeatureCollection loadGranulesDescriptor(File mosaicDir) throws IllegalStateException{
        File datastore = new File(mosaicDir, "datastore.properties");
        File shapeFile = null;
        File indexFound = null;
        if (datastore != null && datastore.exists()){ 
            if(!datastore.isFile() || !datastore.canRead()) {
                throw new IllegalStateException("The file datastore.properties is a directory or it cannot be read.");
            }
            else{
                indexFound = datastore; 
            }
        }
        else{
            //TODO Maybe is better search for a .shp called as the mosaicDir?
            for(File el : mosaicDir.listFiles()){
                if(el.getName().endsWith(".shp")){
                    shapeFile  = el;
                    break;
                }
            }
            if(shapeFile == null){
                throw new IllegalStateException("In the provided dir nor a datastore.properties file or a shapefile is found, The Mosaic Dir is not valid");
            }
            indexFound = shapeFile;
        }
        SimpleFeatureCollection sfc = null;
        try {
            String [] splittedURL = mosaicDir.toURI().toURL().toString().split("/");
            
            CatalogConfigurationBean mcb = loadProperties(new URL(mosaicDir.toURI().toURL()+splittedURL[splittedURL.length-1]), "");
            sfc = GranuleCatalogFactory.createGranuleCatalog(indexFound.toURI().toURL(), mcb, null, new Hints()).getGranules(new Query(mcb.getTypeName()));            
        } catch (Exception e) {
            LOGGER.severe(e.getMessage());
            return null;
        }
        return sfc;
    }
    
    public Map<String, BoundingBox> searchBoundingBoxes(List<String> granulesFileNames){
        Map<String, BoundingBox> bboxMap = new HashMap<String, BoundingBox>();
        
        SimpleFeatureIterator featureIterator = null;
        try{
        	featureIterator =  this.granules.features();
        	while(featureIterator.hasNext()){
        		SimpleFeature feature = featureIterator.next();
        		String location = (String) feature.getAttribute("location");
        		String [] urlSplitted = location.split("/");
        		if(granulesFileNames.contains(urlSplitted[urlSplitted.length-1])){
                  bboxMap.put(location, feature.getBounds());
        		}
        	}
        }catch (Exception e){
        	LOGGER.severe("Error getting bboxes");
        }finally{
        	featureIterator.close();
        }

        return bboxMap;
    }
    
    // **************************************************************************************
    // TODO The following load the properties from the source url properties into 
    // the CatalogConfigurationBean
    // **************************************************************************************
    
    private static CatalogConfigurationBean loadProperties(
            final URL sourceURL,
            final String defaultLocationAttribute){
    	return loadProperties(sourceURL, defaultLocationAttribute, null);
    }
    
    private static CatalogConfigurationBean loadProperties(
            final URL sourceURL,
            final String defaultLocationAttribute, 
            final Set<String> ignorePropertiesSet) {
            // ret value
            final CatalogConfigurationBean retValue = new CatalogConfigurationBean();
            final boolean ignoreSome = ignorePropertiesSet != null && !ignorePropertiesSet.isEmpty();

            //
            // load the properties file
            //
            URL propsURL = sourceURL;
            if (!sourceURL.toExternalForm().endsWith(".properties"))
                    propsURL = DataUtilities.changeUrlExt(sourceURL, "properties");
            final Properties properties = Utils.loadPropertiesFromURL(propsURL);
            if (properties == null) {
                    if (LOGGER.isLoggable(Level.INFO))
                            LOGGER.info("Unable to load mosaic properties file");
                    return null;
            }
            
            if (!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.PATH_TYPE)) {
            	final boolean absolutePath = Boolean.valueOf(properties
                            .getProperty(Utils.Prop.PATH_TYPE, "false").trim());
            	retValue.setAbsolutePath(absolutePath);
            }
            
            if (!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.LOCATION_ATTRIBUTE)) {
            	final String locationAttribute = properties
                            .getProperty(Utils.Prop.LOCATION_ATTRIBUTE, "").trim();
            	retValue.setLocationAttribute(locationAttribute);
            }
            
            if ((!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.SUGGESTED_SPI))
                    && properties.contains(Utils.Prop.SUGGESTED_SPI)) {
            	final String suggestedSPI = properties
                            .getProperty(Utils.Prop.SUGGESTED_SPI, "").trim();
            	retValue.setSuggestedSPI(suggestedSPI);
            }
            
            
            if (!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.HETEROGENEOUS)) {
            	final boolean heterogeneous = Boolean.valueOf(properties
                        .getProperty(Utils.Prop.HETEROGENEOUS, "false").trim());
            	retValue.setHeterogeneous(heterogeneous);
            }
            
            if (!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.TYPENAME)) {
            	final String typeName = properties
                        .getProperty(Utils.Prop.TYPENAME, "").trim();
            	retValue.setTypeName(typeName);
            }	
            
            if (!ignoreSome
                    || !ignorePropertiesSet.contains(Utils.Prop.CACHING)) {
            	final boolean caching = Boolean.valueOf(properties
                            .getProperty(Utils.Prop.CACHING, "false").trim());
            	retValue.setCaching(caching);
            }
            
            return retValue;
    }
}

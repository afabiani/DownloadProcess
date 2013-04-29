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
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.geotools.data.DataUtilities;
import org.geotools.gce.imagemosaic.GranuleDescriptor;
import org.geotools.gce.imagemosaic.MosaicConfigurationBean;
import org.geotools.gce.imagemosaic.Utils;
import org.geotools.gce.imagemosaic.Utils.Prop;
import org.geotools.gce.imagemosaic.catalog.GranuleCatalogFactory;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.util.logging.Logging;
import org.opengis.geometry.BoundingBox;

/**
 * @author DamianoG
 *
 */
public class GranulesManager {

    static final Logger LOGGER = Logging.getLogger(GranulesManager.class);
    
    Collection<GranuleDescriptor> granules;
    
    public GranulesManager(File mosaicDir){
        if(mosaicDir == null || !mosaicDir.exists() || !mosaicDir.isDirectory() || !mosaicDir.canRead()){
            LOGGER.severe("the passed parameter 'mosaicDir' is null or check if the file passed exist and it is a directory and if it can be read.");
        }
        else{
            this.granules = loadGranulesDescriptor(mosaicDir);
        } 
    }
    
    private Collection<GranuleDescriptor> loadGranulesDescriptor(File mosaicDir) throws IllegalStateException{
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
        Collection<GranuleDescriptor> granules = null;
        try {
            String [] splittedURL = mosaicDir.toURI().toURL().toString().split("/");
            MosaicConfigurationBean mcb = loadMosaicProperties(new URL(mosaicDir.toURI().toURL()+splittedURL[splittedURL.length-1]), "");
            granules = GranuleCatalogFactory.createGranuleCatalog(indexFound.toURI().toURL(), mcb).getGranules();
        } catch (Exception e) {
            LOGGER.severe(e.getMessage());
            return null;
        }
        return granules;
    }
    
    public Map<String, BoundingBox> searchBoundingBoxes(List<String> granulesFileNames){
        Map<String, BoundingBox> bboxMap = new HashMap<String, BoundingBox>();
        for(GranuleDescriptor el : this.granules){
            String [] urlSplitted = el.getGranuleUrl().toString().split("/");
            if(granulesFileNames.contains(urlSplitted[urlSplitted.length-1])){
                bboxMap.put(el.getGranuleUrl().getFile(), el.getGranuleBBOX());
            }
        }
        return bboxMap;
    }
    
    // **************************************************************************************
    // TODO The following 2 methods are copied by org.geotools.gce.imagemosaic.Utils class, 
    //  declare them public or investigate if other public similar method are avaiable somewhere.
    // **************************************************************************************    
    private static MosaicConfigurationBean loadMosaicProperties(final URL sourceURL,
            final String defaultLocationAttribute) {
        return loadMosaicProperties(sourceURL, defaultLocationAttribute, null);
    }
    
    private static MosaicConfigurationBean loadMosaicProperties(
            final URL sourceURL,
            final String defaultLocationAttribute, 
            final Set<String> ignorePropertiesSet) {
            // ret value
            final MosaicConfigurationBean retValue = new MosaicConfigurationBean();
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

            String[] pairs = null;
            String pair[] = null;
            
            //
            // imposed bbox is optional
            //              
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.ENVELOPE2D)) {
                    String bboxString = properties.getProperty(Prop.ENVELOPE2D, null);
                    if(bboxString!=null){
                            bboxString=bboxString.trim();
                            try{
                                    ReferencedEnvelope bbox = Utils.parseEnvelope(bboxString);
                                    if(bbox!=null)
                                            retValue.setEnvelope(bbox);
                                    else
                                            if (LOGGER.isLoggable(Level.INFO))
                                                    LOGGER.info("Cannot parse imposed bbox.");
                            }catch (Exception e) {
                                    if (LOGGER.isLoggable(Level.INFO))
                                            LOGGER.log(Level.INFO,"Cannot parse imposed bbox.",e);
                            }
                    }
                            
            }
            
            //
            // resolutions levels
            //              
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.LEVELS)) {
                    int levelsNumber = Integer.parseInt(properties.getProperty(
                                    Prop.LEVELS_NUM, "1").trim());
                    retValue.setLevelsNum(levelsNumber);
                    if (!properties.containsKey(Prop.LEVELS)) {
                            if (LOGGER.isLoggable(Level.INFO))
                                    LOGGER.info("Required key Levels not found.");
                            return null;
                    }
                    final String levels = properties.getProperty(Prop.LEVELS).trim();
                    pairs = levels.split(" ");
                    if (pairs == null || pairs.length != levelsNumber) {
                            if (LOGGER.isLoggable(Level.INFO))
                                    LOGGER
                                                    .info("Levels number is different from the provided number of levels resoltion.");
                            return null;
                    }
                    final double[][] resolutions = new double[levelsNumber][2];
                    for (int i = 0; i < levelsNumber; i++) {
                            pair = pairs[i].split(",");
                            if (pair == null || pair.length != 2) {
                                    if (LOGGER.isLoggable(Level.INFO))
                                            LOGGER
                                                            .info("OverviewLevel number is different from the provided number of levels resoltion.");
                                    return null;
                            }
                            resolutions[i][0] = Double.parseDouble(pair[0]);
                            resolutions[i][1] = Double.parseDouble(pair[1]);
                    }
                    retValue.setLevels(resolutions);
            }

            //
            // suggested spi is optional
            //
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.SUGGESTED_SPI)) {
                    if (properties.containsKey(Prop.SUGGESTED_SPI)) {
                            final String suggestedSPI = properties.getProperty(
                                            Prop.SUGGESTED_SPI).trim();
                            retValue.setSuggestedSPI(suggestedSPI);
                    }
            }

            //
            // time attribute is optional
            //
            if (properties.containsKey(Prop.TIME_ATTRIBUTE)) {
                    final String timeAttribute = properties.getProperty("TimeAttribute").trim();
                    retValue.setTimeAttribute(timeAttribute);
            }

            //
            // elevation attribute is optional
            //
            if (properties.containsKey(Prop.ELEVATION_ATTRIBUTE)) {
                    final String elevationAttribute = properties.getProperty(Prop.ELEVATION_ATTRIBUTE).trim();
                    retValue.setElevationAttribute(elevationAttribute);
            }


            //
            // caching
            //
            if (properties.containsKey(Prop.CACHING)) {
                    String caching = properties.getProperty(Prop.CACHING).trim();
                    try {
                            retValue.setCaching(Boolean.valueOf(caching));
                    } catch (Throwable e) {
                            retValue.setCaching(Boolean.valueOf(false));
                    }
            }

            //
            // name is not optional
            //
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.NAME)){
                if(!properties.containsKey(Prop.NAME)) {
                        if(LOGGER.isLoggable(Level.SEVERE))
                                LOGGER.severe("Required key Name not found.");          
                        return  null;
                }                       
                String coverageName = properties.getProperty(Prop.NAME).trim();
                retValue.setName(coverageName);
            }

            // need a color expansion?
            // this is a newly added property we have to be ready to the case where
            // we do not find it.
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.EXP_RGB)) {
                    final boolean expandMe = Boolean.valueOf(properties.getProperty(
                                    Prop.EXP_RGB, "false").trim());
                    retValue.setExpandToRGB(expandMe);
            }
            
            // 
            // Is heterogeneous granules mosaic
            //
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.HETEROGENEOUS)) {
                final boolean heterogeneous = Boolean.valueOf(properties.getProperty(
                        Prop.HETEROGENEOUS, "false").trim());
                retValue.setHeterogeneous(heterogeneous);
            }

            //
            // Absolute or relative path
            //
            if (!ignoreSome || !ignorePropertiesSet.contains(Prop.ABSOLUTE_PATH)) {
                    final boolean absolutePath = Boolean.valueOf(properties
                                    .getProperty(Prop.ABSOLUTE_PATH,
                                                    Boolean.toString(Utils.DEFAULT_PATH_BEHAVIOR))
                                    .trim());
                    retValue.setAbsolutePath(absolutePath);
            }

            //
            // Footprint management
            //
            if (!ignoreSome
                            || !ignorePropertiesSet.contains(Prop.FOOTPRINT_MANAGEMENT)) {
                    final boolean footprintManagement = Boolean.valueOf(properties
                                    .getProperty(Prop.FOOTPRINT_MANAGEMENT, "false").trim());
                    retValue.setFootprintManagement(footprintManagement);
            }

            //
            // location
            //  
            if (!ignoreSome
                            || !ignorePropertiesSet.contains(Prop.LOCATION_ATTRIBUTE)) {
                    retValue.setLocationAttribute(properties.getProperty(
                                    Prop.LOCATION_ATTRIBUTE, Utils.DEFAULT_LOCATION_ATTRIBUTE)
                                    .trim());
            }

            // return value
            return retValue;
    }
}

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

import it.geosolutions.mariss.wps.ppio.OutputResource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpConnectionManager;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.SimpleHttpConnectionManager;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.CoverageStoreInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.ows.Dispatcher;
import org.geoserver.ows.Request;
import org.geotools.gce.imagemosaic.properties.time.TimeParser;
import org.geotools.process.ProcessException;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.process.gs.GSProcess;
import org.geotools.util.logging.Logging;
import org.opengis.geometry.BoundingBox;

/**
 * @author DamianoG
 * 
 */
@DescribeProcess(title = "DownloadProcess", description = "The MARISS custom download process. Create an archive that contains the raster AOI and the .kml + shapefile of the ship detection")
public class DownloadProcess implements GSProcess {

    static final Logger LOGGER = Logging.getLogger(DownloadProcess.class);

    private String outputDirectory;
    
    private String baseURL;

    private Catalog catalog;
    
    private static String geomName;

    public DownloadProcess(Catalog catalog) {
        this.catalog = catalog;
    }

    /**
     * @param outputDirectory the outputDirectory to set
     */
    public void setOutputDirectory(String outputDirectory) {
        this.outputDirectory = outputDirectory;
    }
    
    public void setBaseURL(String baseURL) {
        this.baseURL = baseURL;
    }
    
    public void setGeomName(String geomName){
        this.geomName = geomName;
    }
    
    /**
     * TODO improve doc This process take as input a workspace name and a List of filenames then search some related resources on the catalog...
     * 
     * @param workspace
     * @param filename
     * @return
     */
    @DescribeResult(name = "ResourcesList", description = "A list of File pointer to the resources found and created", type=OutputResource.class)
    public OutputResource execute(
            @DescribeParameter(name = "MinTime", min = 0, description = "The start time of the Interval") String minTime,
            @DescribeParameter(name = "MaxTime", min = 0, description = "The end time of the Interval") String maxTime,
            @DescribeParameter(name = "Workspace", min = 0, description = "Target workspace (default is the system default)") String workspace,
            @DescribeParameter(name = "ImageMosaic Store Name", min = 1, description = "The Image mosaic store name ") String imStoreName,
            @DescribeParameter(name = "Ship Detection Layer", min = 1, description = "The layer name of the ship detection") String shipDetectionLayer,
            @DescribeParameter(name = "Granule Names", min = 1, collectionType = String.class, description = "The filenames of the granules") List<String> granuleNames) {

        
        if(granuleNames.size() == 1){
            String granules[] = granuleNames.get(0).split(";");
            granuleNames = Arrays.asList(granules);
        }
        
        
        StringBuilder sb = new StringBuilder();
        sb.append("DownloadProcess started with params [").append("workspace: '").append(workspace)
                .append("' - ImageMosaicStoreName: '").append(imStoreName)
                .append("' - num of fileNames Provided: ").append(granuleNames.size()).append("]");
        LOGGER.info(sb.toString());

        OutputResource outputResources = new OutputResource();

        // first off, decide what is the target store
        WorkspaceInfo ws;
        if (workspace != null) {
            ws = catalog.getWorkspaceByName(workspace);
            if (ws == null) {
                throw new ProcessException("Could not find workspace '" + workspace + "'");
            }
        } else {
            ws = catalog.getDefaultWorkspace();
            if (ws == null) {
                throw new ProcessException(
                        "The catalog is empty, could not find a default workspace");
            }
        }
        LOGGER.fine("Workspace loaded");

        // ok, find the image mosaic store
        CoverageStoreInfo storeInfo;
        storeInfo = catalog.getCoverageStoreByName(ws.getName(), imStoreName);
        if (storeInfo == null) {
            throw new ProcessException("Could not find store '" + imStoreName + "' in workspace '"
                    + workspace + "'");
        }
        LOGGER.fine("ImageMosaic store loaded");

        // retrieve the mosaic path
        String mosaicURL = storeInfo.getURL();
        File mosaicDir = new File(mosaicURL.replace("file:///", "/"));
        if (!mosaicDir.canRead() || !mosaicDir.isDirectory()) {
            throw new ProcessException("Problems occurred when try to access to the mosaic dir '"
                    + mosaicURL + "', please check if it is accessible.");
        }
        LOGGER.fine("Mosaic Path found");

        // Retrieve the timeregexProperties to extract time info from the filename
        Pattern timeregex = loadTimeRegex(mosaicDir);

        List<String> timeList = new ArrayList<String>();
        // Put the provided file into the resource map and extract the time from the file name
        int counter = 0;
        for (String el : granuleNames) {

            File f = new File(mosaicDir, el);
            if (!f.exists() || !f.isFile() || !f.canRead()) {
                LOGGER.warning("Problems when try access to granule '" + el
                        + "' check if the file exist or if it is accessible. The file is skipped");
                continue;
            }
            Matcher m = timeregex.matcher(el);
            String time = null;
            if (m.find()) {
                time = m.group(0);
            } else {
                LOGGER.warning("Problems when try access to granule '"
                        + el
                        + "' The time is not well specified in the file name as specified in the  timeregex file");
                continue;
            }
            timeList.add(time);
            outputResources.addUndeletableResource(f);
            LOGGER.fine("The file '" + el + "' is added");
            counter++;
        }
        LOGGER.info("Added " + counter + " raster resources to resources Map.");

        String cqlFilter = buildCQLFilterMinMaxIntervalAndGranulesBBox(minTime, maxTime, mosaicDir, granuleNames);

        SimpleHttpConnectionManager httpConnectionManager = new SimpleHttpConnectionManager();
        
        // Create the Shapefile with the selected features
        File fZip = new File(outputDirectory + shipDetectionLayer + UUID.randomUUID() + ".zip");
        String urlZip = composeWFSUrl(ws.getName(), shipDetectionLayer, cqlFilter, "shape-zip");
        downloadVectorDataFromLocalhost(urlZip, fZip, httpConnectionManager);
        outputResources.addDeletableResource(fZip);
        LOGGER.info("Added The shapefile to resources Map.");

        // Create the KMZ with the selected features
        File fKMZ = new File(outputDirectory + shipDetectionLayer + UUID.randomUUID() + ".kmz");
        String urlKMZ = composeWMSUrl(ws.getName(), shipDetectionLayer, mosaicDir, granuleNames, "kml", minTime, maxTime);
        downloadVectorDataFromLocalhost(urlKMZ, fKMZ, httpConnectionManager);
        outputResources.addDeletableResource(fKMZ);
        LOGGER.info("Added the KMZ to resources Map.");
        
        httpConnectionManager.shutdown();
         
        return outputResources;
    }

    private static Pattern loadTimeRegex(File mosaicDir) throws ProcessException {

        FileInputStream in = null;
        try {
            File f = new File(mosaicDir, "timeregex.properties");
            if (!f.exists() || !f.isFile() || !f.canRead()) {
                throw new ProcessException(
                        "The timeregex.properties file don't exist or is not accessible...");
            }
            in = new FileInputStream(f);
            Properties prop = new Properties();
            prop.load(in);
            String regex = prop.getProperty("regex");
            if (StringUtils.isBlank(regex)) {
                throw new ProcessException("The timeregex.properties not contains a valid regex...");
            }
            Pattern p = Pattern.compile(regex);
            LOGGER.info("Timeregex '" + regex + "' loaded");
            return p;
        } catch (IOException e) {
            LOGGER.severe(e.getMessage());
            throw new ProcessException("Error while trying to access to timeregex.properties file");
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    LOGGER.severe(e.getMessage());
                }
            }
        }
    }

    private String composeWFSUrl(String workspace, String layer, String cqlFilter, String format) {

        String localBaseURL = baseURL;
        if(StringUtils.isBlank(localBaseURL)){
            Request req = Dispatcher.REQUEST.get();
            String requestURL = req.getHttpRequest().getRequestURL().toString();
            String requestURLArray[] = requestURL.split("/");
            localBaseURL = "http://" + requestURLArray[2] + "/" + requestURLArray[3];
        }
        StringBuilder sb = new StringBuilder();
        sb.append(localBaseURL)
                .append("/").append(workspace)
                .append("/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=")
                .append(workspace).append(":").append(layer).append("&outputFormat=")
                .append(format).append(cqlFilter);

        String url = sb.toString();
        LOGGER.info("URL for download the '" + format + "' file composed");
        LOGGER.fine("The URL is " + url);
        return url;
    }
    
    private String composeWMSUrl(String workspace, String layer, File mosaicDir, List<String> granulesFileNames, String format, String minTime, String maxTime) {

        String localBaseURL = baseURL;
        if (StringUtils.isBlank(localBaseURL)) {
            Request req = Dispatcher.REQUEST.get();
            String requestURL = req.getHttpRequest().getRequestURL().toString();
            String requestURLArray[] = requestURL.split("/");
            localBaseURL = "http://" + requestURLArray[2] + "/" + requestURLArray[3];
        }
        GranulesManager gm = new GranulesManager(mosaicDir);
        Map<String,BoundingBox> bboxMap = gm.searchBoundingBoxes(granulesFileNames);
        // http://localhost:8080/geoserver/mariss/wms/kml?layers=mariss:tem_sd__1p
        StringBuilder sb = new StringBuilder();
        sb.append(localBaseURL).append("/").append(workspace).append("/wms/").append(format)
                .append("?layers=").append(workspace).append(":").append(layer)
                .append("&styles=point&mode=download").append("&time=").append(minTime).append("/").append(maxTime).append("&CQL_FILTER=").append(concatCqlBBOXFilters(bboxMap));

        String url = sb.toString();
        LOGGER.info("URL for download the '" + format + "' file composed");
        LOGGER.fine("The URL is " + url);
        return url;
    }

    private static boolean downloadVectorDataFromLocalhost(String url, File outDest, HttpConnectionManager manager)
            throws ProcessException {

        HttpClient client = new HttpClient(manager);
        HttpMethod method = new GetMethod(url);
        OutputStream out = null;
        InputStream in = null;
        try {
            client.executeMethod(method);
            out = new FileOutputStream(outDest);
            in = method.getResponseBodyAsStream();
            IOUtils.copy(in, out);
        } catch (Exception e) {
            LOGGER.severe(e.getMessage());
            throw new ProcessException("error in vector data download...");
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    LOGGER.severe(e.getMessage());
                }
            }
            if (out != null) {
                try {
                    out.close();
                } catch (IOException e) {
                    LOGGER.severe(e.getMessage());
                }
            }
        }
        LOGGER.info("Vector Resource downloaded");
        return true;
    }
    
    public static String buildCQLFilterMinMaxIntervalAndGranulesBBox(/*List<String> timeList, */String minTime, String maxTime, File mosaicDir, List<String> granulesFileNames) {

        /*
         * EXAMPLE:
         * time DURING 2010-01-24T09:52:32Z/2012-02-24T22:11:33Z AND (BBOX(wkb_geometry,9.887190592840616,37.981477602075785,10.310190592840616,38.38117760207579) OR BBOX(wkb_geometry,18.716863606878906,39.50822439921374,19.130563606878905,39.899624399213735))
         */
        
        GranulesManager gm = new GranulesManager(mosaicDir);
        Map<String,BoundingBox> bboxMap = gm.searchBoundingBoxes(granulesFileNames);
        
//        TimeParser p = new TimeParser();
//        Date min = null;
//        Date max = null;
//        boolean firstIter = true;
//        for(String el : timeList){
//            try {
//                Date tmpDate = p.parse(el).get(0);
//                if(firstIter){
//                    min = tmpDate;
//                    max = tmpDate;
//                    firstIter=false;
//                }
//                else{
//                    min = (tmpDate.before(min))?tmpDate:min;
//                    max = (tmpDate.after(max))?tmpDate:max;
//                }
//            } catch (ParseException e) {
//                LOGGER.severe(e.getMessage());
//            }
//        }
//        if(min.equals(max)){
//            Calendar cla = new GregorianCalendar();
//            cla.setTime(min);
//            cla.add(Calendar.DAY_OF_MONTH, -1);
//            min = cla.getTime();
//        }
        TimeParser p = new TimeParser();
        StringBuilder sb = new StringBuilder();
        DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        Date min = null;
        Date max = null;
        try {
            min = p.parse(minTime).get(0);
            max = p.parse(maxTime).get(0);
        } catch (ParseException e) {
            // TODO Auto-generated catch block
            LOGGER.severe(e.getMessage());
        }
        sb.append("&CQL_FILTER=");
        if(min != null && max != null){
            sb.append("time%20DURING%20");
            sb.append(formatter.format(min));
            sb.append("/");
            sb.append(formatter.format(max));
            LOGGER.info("Time Interval added to CQL filter");
            if(!bboxMap.isEmpty()){
                sb.append("%20AND%20(");
                sb.append(concatCqlBBOXFilters(bboxMap));
                sb.append(")");
            }
            
        }
        else{
            sb.append("");
            LOGGER.info("The CQL filter is empty...");
        }
        String cqlFilter = sb.toString();
        LOGGER.fine("The full CQL filter is " + cqlFilter);
        return cqlFilter;
    }
    
    private static String concatCqlBBOXFilters(Map<String,BoundingBox> bboxMap){
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for(String el : bboxMap.keySet()){
            if(!first){
                sb.append("%20OR%20");
            }
            first = false;
            sb.append(buildCqlBBOXFilter(bboxMap.get(el)));
        }
        LOGGER.info("BBOX filters added to CQL filter");
        return sb.toString();
    }
    
    private static String buildCqlBBOXFilter(BoundingBox bbox){
      //BBOX(wkb_geometry,9.887190592840616,37.981477602075785,10.310190592840616,38.38117760207579)
        StringBuilder sb = new StringBuilder();
        sb.append("BBOX(");
        sb.append(geomName);
        sb.append(",");
        sb.append(bbox.getMinX());
        sb.append(",");
        sb.append(bbox.getMinY());
        sb.append(",");
        sb.append(bbox.getMaxX());
        sb.append(",");
        sb.append(bbox.getMaxY());
        sb.append(")");
        return sb.toString();
    }

}

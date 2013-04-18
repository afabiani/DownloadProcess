/*
 *  fra2015
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
package it.geosolutions.mariss.wps.ppio;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.logging.Logger;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;
import org.geoserver.wps.ppio.BinaryPPIO;
import org.geotools.util.logging.Logging;

/**
 * @author DamianoG
 * 
 */
public class OutputResourcesPPIO extends BinaryPPIO {

    static final Logger LOGGER = Logging.getLogger(OutputResourcesPPIO.class);

    /**
     * @param externalType
     * @param internalType
     * @param mimeType
     */
    protected OutputResourcesPPIO() {
        super(ZipOutputStream.class, OutputResource.class, "application/zip");
    }

    @Override
    public Object decode(InputStream input) throws Exception {
        return null;
    }

    @Override
    public void encode(Object value, OutputStream os) throws Exception{

        ZipOutputStream zos = null;
        try {
            OutputResource or = (OutputResource) value;

            zos = new ZipOutputStream(os);
            zos.setMethod(ZipOutputStream.DEFLATED);
            zos.setLevel(Deflater.DEFAULT_COMPRESSION);

            Iterator<File> iter = or.getDeletableResourcesIterator();
            while (iter.hasNext()) {

                File tmp = iter.next();
                if (!tmp.exists() || !tmp.canRead() || !tmp.canWrite()) {
                    LOGGER.warning("Skip Deletable file '" + tmp.getName()
                            + "' some problems occurred...");
                    continue;
                }

                addToZip(tmp, zos);

                if (!tmp.delete()) {
                    LOGGER.warning("File '" + tmp.getName() + "' cannot be deleted...");
                }
            }
            iter = null;

            Iterator<File> iter2 = or.getUndeletableResourcesIterator();
            while (iter2.hasNext()) {

                File tmp = iter2.next();
                if (!tmp.exists() || !tmp.canRead() || !tmp.canWrite()) {
                    LOGGER.warning("Skip Undeletable file '" + tmp.getName()
                            + "' some problems occurred...");
                    continue;
                }
                
                addToZip(tmp, zos);
                
            }
        } finally {
            try {
                zos.close();
            } catch (IOException e) {
                LOGGER.severe(e.getMessage());
            }
        }
    }

    @Override
    public String getFileExtension() {
        return "zip";
    }

    private static void addToZip(File f, ZipOutputStream zos) {

        FileInputStream in = null;
        try {
            in = new FileInputStream(f);
            zos.putNextEntry(new ZipEntry(f.getName()));
            IOUtils.copy(in, zos);
            zos.closeEntry();
        } catch (IOException e) {
            LOGGER.severe(e.getMessage());
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

}

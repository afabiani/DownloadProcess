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
package it.geosolutions.mariss.wps.ppio;

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author DamianoG
 *
 */
public class OutputResource {

    private List<File> delOutputList;
    private List<File> undelOutputList;
    
    public OutputResource(){
        
        delOutputList = new ArrayList<File>();
        undelOutputList = new ArrayList<File>();
    }
    
    public void addDeletableResource(File f){
        delOutputList.add(f);
    }
    
    public void addUndeletableResource(File f){
        undelOutputList.add(f);
    }
    
    public Iterator<File> getDeletableResourcesIterator(){
        
        return delOutputList.iterator();
    }
    
    public Iterator<File> getUndeletableResourcesIterator(){
        
        return undelOutputList.iterator();
    }
}

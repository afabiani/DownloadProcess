<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
 xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
 xmlns="http://www.opengis.net/sld"
 xmlns:ogc="http://www.opengis.net/ogc"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- a Named Layer is the basic building block of an SLD document -->
  <NamedLayer>
    <Name>GlidersTracks</Name>
    <UserStyle>
    <!-- Styles can have names, titles and abstracts -->
      <Title>Glider Track</Title>
      <Abstract>Track style</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->
      <!-- A FeatureTypeStyle for rendering lines -->
      <FeatureTypeStyle>
        <Rule>
          <Name>CurrentTrack</Name>
          <Title>Current Track</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>CurrentTrack</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>glider_name</ogc:PropertyName>
            </Label>
            <LabelPlacement>
              <LinePlacement />
            </LabelPlacement>

            <!-- Font>
              <CssParameter name="font-family">Times New Roman</CssParameter>
              <CssParameter name="font-style">Normal</CssParameter>
              <CssParameter name="font-size">14</CssParameter>
            </Font -->
            <Halo>
              <Radius>
                <ogc:Literal>2</ogc:Literal>
              </Radius>
              <Fill>
                <CssParameter name="fill">#FFFFFF</CssParameter>
                <CssParameter name="fill-opacity">0.85</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
            </Fill>
            
            <VendorOption name="followLine">true</VendorOption>
            <VendorOption name="maxAngleDelta">90</VendorOption>
            <VendorOption name="maxDisplacement">400</VendorOption>
            <VendorOption name="repeat">150</VendorOption>
          </TextSymbolizer>
          
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">
               <ogc:Function name="Recode">
               <ogc:Function name="strTrim">
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                </ogc:Function>

             <!-- Map of input to output values -->
             <ogc:Literal>elettra</ogc:Literal>
             <ogc:Literal>#F8FEA3</ogc:Literal>
    
             <ogc:Literal>jade</ogc:Literal>
             <ogc:Literal>#F9EA4E</ogc:Literal>
                  
             <ogc:Literal>greta</ogc:Literal>
             <ogc:Literal>#DE0000</ogc:Literal>
    
             <ogc:Literal>laura</ogc:Literal>
             <ogc:Literal>#E87522</ogc:Literal>
    
             <ogc:Literal>natalie</ogc:Literal>
             <ogc:Literal>#B47AAF</ogc:Literal>
    
             <ogc:Literal>sophie</ogc:Literal>
             <ogc:Literal>#716c46</ogc:Literal>
    
             <ogc:Literal>zoe</ogc:Literal>                 
             <ogc:Literal>#5DB480</ogc:Literal>
             <!--ogc:Literal>#E9E884</ogc:Literal-->
       
             <ogc:Literal>noa</ogc:Literal>
             <ogc:Literal>#7777ff</ogc:Literal>
            
    
            
       </ogc:Function>
              
              
              </CssParameter>
              <CssParameter name="stroke-dasharray">5 2</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        
        <Rule>
          <Name>OldTracks</Name>
          <Title>Old Tracks</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>OldTracks</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>

          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>glider_name</ogc:PropertyName>
            </Label>
            <LabelPlacement>
              <LinePlacement />
            </LabelPlacement>

            <!-- Font>
              <CssParameter name="font-family">Times New Roman</CssParameter>
              <CssParameter name="font-style">Normal</CssParameter>
              <CssParameter name="font-size">14</CssParameter>
            </Font -->
            <Halo>
              <Radius>
                <ogc:Literal>2</ogc:Literal>
              </Radius>
              <Fill>
                <CssParameter name="fill">#FFFFFF</CssParameter>
                <CssParameter name="fill-opacity">0.85</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
            </Fill>
            
            <VendorOption name="followLine">true</VendorOption>
            <VendorOption name="maxAngleDelta">90</VendorOption>
            <VendorOption name="maxDisplacement">400</VendorOption>
            <VendorOption name="repeat">150</VendorOption>
          </TextSymbolizer>
          
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">
                <ogc:Function name="Recode">
               <ogc:Function name="strTrim">
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                </ogc:Function>

             <!-- Map of input to output values -->
             <ogc:Literal>elettra</ogc:Literal>
             <ogc:Literal>#F8FEA3</ogc:Literal>
    
             <ogc:Literal>jade</ogc:Literal>
             <ogc:Literal>#F9EA4E</ogc:Literal>
                  
             <ogc:Literal>greta</ogc:Literal>
             <ogc:Literal>#DE0000</ogc:Literal>
    
             <ogc:Literal>laura</ogc:Literal>
             <ogc:Literal>#E87522</ogc:Literal>
    
             <ogc:Literal>natalie</ogc:Literal>
             <ogc:Literal>#B47AAF</ogc:Literal>
    
             <ogc:Literal>sophie</ogc:Literal>
             <ogc:Literal>#716c46</ogc:Literal>
    
             <ogc:Literal>zoe</ogc:Literal>
             <ogc:Literal>#5DB480</ogc:Literal>
             <!--ogc:Literal>#E9E884</ogc:Literal-->
       
             <ogc:Literal>noa</ogc:Literal>
             <ogc:Literal>#7777ff</ogc:Literal>
            
    
            
       </ogc:Function>
              </CssParameter>
            </Stroke>
          </LineSymbolizer>
          <PointSymbolizer>
            <Geometry>
               <!-- End Point empty Circle -->
              <ogc:Function name="endPoint">
                <ogc:PropertyName>the_geom</ogc:PropertyName>
              </ogc:Function>
            </Geometry>
            <Graphic>
              <Mark>
                <WellKnownName>square</WellKnownName>
                    <Stroke>
              <CssParameter name="Stroke">
                <ogc:Function name="Recode">
               <ogc:Function name="strTrim">
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                </ogc:Function>

             <!-- Map of input to output values -->
             <ogc:Literal>elettra</ogc:Literal>
             <ogc:Literal>#F8FEA3</ogc:Literal>
    
             <ogc:Literal>jade</ogc:Literal>
             <ogc:Literal>#F9EA4E</ogc:Literal>
                  
             <ogc:Literal>greta</ogc:Literal>
             <ogc:Literal>#DE0000</ogc:Literal>
    
             <ogc:Literal>laura</ogc:Literal>
             <ogc:Literal>#E87522</ogc:Literal>
    
             <ogc:Literal>natalie</ogc:Literal>
             <ogc:Literal>#B47AAF</ogc:Literal>
    
             <ogc:Literal>sophie</ogc:Literal>
             <ogc:Literal>#716c46</ogc:Literal>
    
             <ogc:Literal>zoe</ogc:Literal>
             <ogc:Literal>#5DB480</ogc:Literal>
             <!--ogc:Literal>#E9E884</ogc:Literal-->
       
             <ogc:Literal>noa</ogc:Literal>
             <ogc:Literal>#7777ff</ogc:Literal>
            
       </ogc:Function>
              
              
              </CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              
            </Stroke>
            </Mark>
              <Size>10</Size>
            </Graphic>
          </PointSymbolizer>
         </Rule>
       </FeatureTypeStyle>
      
       <FeatureTypeStyle>
         <Rule>
          <PointSymbolizer>
            <!-- end Point - Full circle -->
            <Geometry>
              <ogc:Function name="endPoint">
                <ogc:PropertyName>the_geom</ogc:PropertyName>
              </ogc:Function>
            </Geometry>
            <Graphic>
             <Mark>
                <WellKnownName>circle</WellKnownName>
                           <Fill>
             <CssParameter name="Fill">
                <ogc:Function name="Recode">
                 <ogc:Function name="strTrim">
                     <ogc:PropertyName>glider_name</ogc:PropertyName>
                 </ogc:Function>

             <!-- Map of input to output values -->
               <ogc:Literal>elettra</ogc:Literal>
               <ogc:Literal>#F8FEA3</ogc:Literal>
    
               <ogc:Literal>jade</ogc:Literal>
               <ogc:Literal>#F9EA4E</ogc:Literal>
                  
               <ogc:Literal>greta</ogc:Literal>
               <ogc:Literal>#DE0000</ogc:Literal>
    
               <ogc:Literal>laura</ogc:Literal>
               <ogc:Literal>#E87522</ogc:Literal>
    
               <ogc:Literal>natalie</ogc:Literal>
               <ogc:Literal>#B47AAF</ogc:Literal>
    
               <ogc:Literal>sophie</ogc:Literal>
               <ogc:Literal>#716c46</ogc:Literal>
    
               <ogc:Literal>zoe</ogc:Literal>
               <ogc:Literal>#5DB480</ogc:Literal>
             <!--ogc:Literal>#E9E884</ogc:Literal-->
       
               <ogc:Literal>noa</ogc:Literal>
               <ogc:Literal>#7777ff</ogc:Literal>
            
            
               </ogc:Function>
              
              
            </CssParameter>
            </Fill>
              </Mark>
             
              <Size>7</Size>
            </Graphic>
          </PointSymbolizer>
           
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
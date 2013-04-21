<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
 xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
 xmlns="http://www.opengis.net/sld"
 xmlns:ogc="http://www.opengis.net/ogc"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- a Named Layer is the basic building block of an SLD document -->
  <NamedLayer>
    <Name>gliders_aoi_polygon</Name>
    <UserStyle>
    <!-- Styles can have names, titles and abstracts -->
      <Title>Gliders AOI Polygon</Title>
      <Abstract>A sample style that draws a polygon</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->
      <!-- A FeatureTypeStyle for rendering polygons -->
      <FeatureTypeStyle>
        <Rule>
          <Name>rule1</Name>
          <Title>Gliders Polygon</Title>
          <Abstract>A polygon with a different color</Abstract>
          <PolygonSymbolizer>
            <Fill>
               <CssParameter name="fill">
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
                   
                     <ogc:Literal>noa</ogc:Literal>
                     <ogc:Literal>#7777ff</ogc:Literal>     
                </ogc:Function>
              </CssParameter>
              <CssParameter name="fill-opacity">0.2</CssParameter>
            </Fill>
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
               
                     <ogc:Literal>noa</ogc:Literal>
                     <ogc:Literal>#7777ff</ogc:Literal>    
                </ogc:Function>
              </CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
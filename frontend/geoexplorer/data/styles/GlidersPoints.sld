<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
    xmlns="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>it.geosolutions.GlidersPoints</Name>
    <UserStyle>
    
      <Title>Gliders Points</Title>
      <FeatureTypeStyle>
        <!-- Jade -->
        
        <Rule>
          <Title>Jade</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>jade</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
            
             <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_jade.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
        
        
        <!-- Greta -->
        
        <Rule>
          <Title>Greta</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>greta</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
            
             <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_greta.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
       
        <!-- Elettra -->
        
        <Rule>
          <Title>Elettra</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>elettra</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
                       <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_elettra.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
      
        <!-- laura -->
        
        <Rule>
          <Title>Laura</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>laura</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
             <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_laura.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
      
        <!-- Sophie-->
        
        <Rule>
          <Title>Sophie</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>sophie</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
                      <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_sophie.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
      
        <!-- natalie-->
       
        <Rule>
          <Title>Natalie</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>natalie</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
                      <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_natalie.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
        
      
           <!-- Zoe-->
      
        <Rule>
          <Title>Zoe</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>zoe</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
           <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_zoe.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
         <!-- noa -->
        <Rule>
          <Title>Noa</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>glider_name</ogc:PropertyName>
                 <ogc:Literal>noa</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <!--ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>out_aoi</ogc:PropertyName>
                 <ogc:Literal>false</ogc:Literal>
              </ogc:PropertyIsEqualTo-->
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
           <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider_noa.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
        <!-- out defined aoi-->
        <Rule>
          <Title>Gliders Out AOI</Title>
           <ogc:Filter>
             <ogc:And>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>out_aoi</ogc:PropertyName>
                 <ogc:Literal>true</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:And>
           </ogc:Filter>
          <PointSymbolizer>
           <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/bullet_red.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
              <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
      
       <!--
         <Rule>
          <Name>Points</Name>
           <Title>Points</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
            <PointSymbolizer>
              <Graphic>
               
              <Size>6</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
        
        -->
        <!--
         <Rule>
          <Title>Points</Title>
           <ogc:Filter>
             
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Points</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           
           </ogc:Filter>
          <PointSymbolizer>
           <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/glider1.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>Heading</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
        -->
        <Rule>
          <Title>Aborts</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Aborts</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/Aborts.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
              <Size>16</Size>
             
              </Graphic>
          </PointSymbolizer>
        </Rule>

        
        <Rule>
          <Title>Water Current</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>WaterCurrent</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
          <PointSymbolizer>
            <Graphic>
              <ExternalGraphic>
             <OnlineResource
                  xlink:type="simple"
                xlink:href="./img/gliders/WaterCurrent.png" />
                <Format>image/png</Format>
              </ExternalGraphic>
                         <Size>32</Size>
              <Rotation><ogc:PropertyName>WaterDir_deg</ogc:PropertyName></Rotation>
              </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
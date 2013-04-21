<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
 xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
 xmlns="http://www.opengis.net/sld"
 xmlns:ogc="http://www.opengis.net/ogc"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- a Named Layer is the basic building block of an SLD document -->
  <NamedLayer>
    <Name>GlidersErrorEllipses</Name>
    <UserStyle>
    <!-- Styles can have names, titles and abstracts -->
      <Title>GlidersErrorEllipses</Title>
      <Abstract>Gliders Error Ellipses and Envelopes</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->
      <!-- A FeatureTypeStyle for rendering lines -->
      <FeatureTypeStyle>
        <Rule>
          <Name>GlidersErrorEllipses</Name>
          <Title>Gliders Error Ellipses</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Error Ellipses</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
          
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#BB0000</CssParameter>
              <CssParameter name="fill-opacity">0.7</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>

      <FeatureTypeStyle>
        <Rule>
          <Name>GlidersErrorEllipsesEnvelope</Name>
          <Title>Gliders Error Ellipses Envelope</Title>
           <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                 <ogc:PropertyName>type</ogc:PropertyName>
                 <ogc:Literal>Error Ellipse Envelope</ogc:Literal>
              </ogc:PropertyIsEqualTo>
           </ogc:Filter>
          
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#00FF00</CssParameter>
              <CssParameter name="fill-opacity">0.2</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
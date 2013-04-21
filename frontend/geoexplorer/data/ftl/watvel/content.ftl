<div id="main" class="links">
    <a href="http://geos3.nurc.nato.int/" target="_blank"><img src="http://geos3.nurc.nato.int/MapStore-gliders/theme/app/img/nurc-logo.png" width="60" height="60" Hspace="10" Vspace="5"/></a>
</div>

<#list features as feature>
<table class="featureInfo">
  <caption class="featureInfo">${type.name}</caption>
  <tr>

    <th class="title">Attribute</th><th class="title" colspan=2>Value</th>

  </tr>

<#assign odd = false>
    <#list feature.attributes as attribute>
        <#if !attribute.isGeometry>
            <#if odd>
			<tr class="odd">
			<#else>
			<tr>
			</#if>
			
			<#assign odd = !odd>
            <#setting number_format="0.##">
			<#if attribute.name == 'Band1'>
				<#if attribute.value == 'NaN'>
					<th>Speed</th><td>NaN</td><td>NaN</td>
				<#else>
				    <th>Speed</th><td>${attribute.value?number} [m/s]</td><td>${attribute.value?number * 1.94} [Knots]</td>
				</#if>
			</#if>
			
			<#if attribute.name == 'Band2'>
			    <#if attribute.value == 'NaN'>
					<th>Direction</th><td>NaN</td><td></td>
				<#else>
					<th>Direction</th><td>${(attribute.value?number + 180) % 360} [deg]</td><td></td>
				</#if>
			</#if>
			
			<#if attribute.name != 'Band1' && attribute.name != 'Band2'>
			    <#if attribute.value == 'NaN'>
					<th>${attribute.name}</th><td>NaN</td><td></td>
				<#else>
					<th>${attribute.name}</th><td>${attribute.value}</td><td></td>
				</#if>
			</#if>
			
			</tr>
        </#if>
    </#list>
	</tr>

</table>
<hr />
</#list>
<br/>

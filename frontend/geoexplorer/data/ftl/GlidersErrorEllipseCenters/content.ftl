<div id="main" class="links">
    <a href="http://84.33.199.62/" target="_blank"><img src="http://84.33.199.62/MapStore-gliders/theme/app/img/nurc-logo.png" width="60" height="60" Hspace="10" Vspace="5"/></a>
</div>

<#list features as feature>
<table class="featureInfo">
  <caption class="featureInfo">${type.name}</caption>
  <tr>

    <th class="title">Attribute</th><th class="title">Value</th>

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
					<th >${attribute.name}</th>
				<#if attribute.name == 'description' &&  type.name == 'GlidersErrorEllipseCenters'>
					<td>${attribute.value?replace(";","<br/>")}</td>
				<#else>
                    <td>${attribute.value}</td>
				</#if>
                </tr>
        </#if>
    </#list>
                </tr>

</table>
<hr />
</#list>
<br/>

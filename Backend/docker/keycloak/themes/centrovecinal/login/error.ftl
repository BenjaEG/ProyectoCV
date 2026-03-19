<#import "template.ftl" as layout>

<@layout.registrationLayout; section>

<#if section = "header">
Error

<#elseif section = "form">

<div style="text-align:center;padding:40px">
  <h1>Ocurrió un error</h1>
  <p>${message.summary!}</p>
</div>

</#if>

</@layout.registrationLayout>
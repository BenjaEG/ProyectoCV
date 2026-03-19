<#import "template.ftl" as layout>

<@layout.registrationLayout displayInfo=false; section>

<#if section == "header">
Iniciar Sesión

<#elseif section == "form">

<div class="login-page">
  <div class="login-card">

    <div class="login-card__header">
      <div class="login-card__logo">
        <svg class="login-card__logo-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="16" height="20" x="4" y="2" rx="2"/>
          <path d="M9 22v-4h6v4"/>
        </svg>
      </div>

      <h1 class="login-card__title">Iniciar Sesión</h1>
      <p class="login-card__description">
        Ingresa tus credenciales para acceder al portal
      </p>
    </div>

    <#if message?has_content>
      <div class="login-error">
        ${message.summary}
      </div>
    </#if>

    <form id="kc-form-login"
          class="login-card__form"
          action="${url.loginAction}"
          method="post">

      <div class="login-card__content">
        <div class="field-group">

          <div class="field">
            <label class="field__label">Email</label>
            <input
              class="field__input"
              type="text"
              name="username"
              placeholder="tu@email.com"
              autofocus
              autocomplete="username"
            />
          </div>

          <div class="field">
            <label class="field__label">Contraseña</label>
            <input
              class="field__input"
              type="password"
              name="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

        </div>
      </div>

      <div class="login-card__footer">
        <button class="btn" type="submit">
          Ingresar
        </button>

        <#if realm.registrationAllowed>
        <p class="login-card__footer-text">
          ¿No tienes una cuenta?
          <a href="${url.registrationUrl}" class="login-card__link">
            Registrarse
          </a>
        </p>
        </#if>

      </div>

    </form>

  </div>
</div>

</#if>

</@layout.registrationLayout>
<#import "template.ftl" as layout>

<@layout.registrationLayout displayInfo=false displayMessage=true; section>

<#if section = "header">
Registrarse
<#elseif section = "form">

<div class="login-page">
  <div class="login-card">

    <div class="login-card__header">
      <div class="login-card__logo">
        <svg class="login-card__logo-icon icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="16" height="20" x="4" y="2" rx="2"/>
          <path d="M9 22v-4h6v4"/>
        </svg>
      </div>

      <h1 class="login-card__title">Crear cuenta</h1>
      <p class="login-card__description">
        Completa el formulario para registrarte
      </p>
    </div>

    <#if message?has_content>
      <div class="login-error">
        ${message.summary}
      </div>
    </#if>

    <form id="kc-register-form" class="login-card__form" action="${url.registrationAction}" method="post">

      <div class="login-card__content">

        <input
               id="username"
               name="username"
               type="hidden"
               value="${(register.formData.username!'')}" />

        <div class="field-group">

          <div class="field">
            <label class="field__label">Nombre</label>
            <input class="field__input"
                   id="firstName"
                   name="firstName"
                   type="text"
                   value="${(register.formData.firstName!'')}"
                   required />
          </div>

          <div class="field">
            <label class="field__label">Apellido</label>
            <input class="field__input"
                   id="lastName"
                   name="lastName"
                   type="text"
                   value="${(register.formData.lastName!'')}"
                   required />
          </div>

          <div class="field">
            <label class="field__label">Email</label>
            <input class="field__input"
                   name="email"
                   type="email"
                   value="${(register.formData.email!'')}"
                   required />
          </div>

          <div class="field">
            <label class="field__label">Contraseña</label>
            <input class="field__input"
                   name="password"
                   type="password"
                   required />
          </div>

          <div class="field">
            <label class="field__label">Confirmar contraseña</label>
            <input class="field__input"
                   name="password-confirm"
                   type="password"
                   required />
          </div>

        </div>

      </div>

      <div class="login-card__footer">

        <button class="btn" type="submit">
          Registrarse
        </button>

        <p class="login-card__footer-text">
          ¿Ya tienes una cuenta?
          <a href="${url.loginUrl}" class="login-card__link">
            Iniciar sesión
          </a>
        </p>

      </div>

    </form>

  </div>
</div>

<script>
  (function () {
    const emailInput = document.querySelector('input[name="email"]')
    const usernameInput = document.getElementById('username')

    if (!emailInput || !usernameInput) {
      return
    }

    const syncUsername = () => {
      usernameInput.value = emailInput.value.trim().toLowerCase()
    }

    emailInput.addEventListener('input', syncUsername)
    syncUsername()
  })()
</script>

</#if>

</@layout.registrationLayout>

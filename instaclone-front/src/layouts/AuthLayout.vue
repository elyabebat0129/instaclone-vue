<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8 col-xl-6">
        <div class="text-center mb-4">
          <div class="brand-wordmark muted-copy small mb-2">Projeto Final</div>
          <h1 class="display-6 mb-2">InstaClone</h1>
          <p class="muted-copy mb-0">
            Vamos construir a interface consumindo a API que ja existe no backend.
          </p>
        </div>

        <div class="auth-card">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

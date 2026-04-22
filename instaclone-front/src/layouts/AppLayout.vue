<script setup>
import AppNavigation from '@/components/common/AppNavigation.vue'
</script>

<template>
  <div class="app-shell">
    <div class="container py-3 py-lg-4">
      <div class="row g-4">
        <div class="col-lg-3 d-none d-lg-block">
          <div class="app-panel surface-card app-sidebar">
            <AppNavigation />
          </div>
        </div>

        <div class="col-lg-9">
          <slot />
        </div>
      </div>
    </div>

    <div class="mobile-nav d-lg-none">
      <div class="mobile-nav__inner">
        <AppNavigation mobile />
      </div>
    </div>
  </div>
</template>

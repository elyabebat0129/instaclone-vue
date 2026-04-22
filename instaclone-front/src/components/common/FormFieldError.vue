<script setup>
defineProps({
  errors: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div v-if="errors.length" class="small text-danger mt-2">
    <div v-for="message in errors" :key="message">
      {{ message }}
    </div>
  </div>
</template>

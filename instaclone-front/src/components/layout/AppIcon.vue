<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  filled: {
    type: Boolean,
    default: false,
  },
})

const iconMap = {
  home: {
    regular: 'bi-house-door',
    filled: 'bi-house-door-fill',
  },
  search: {
    regular: 'bi-search',
    filled: 'bi-search',
  },
  plusSquare: {
    regular: 'bi-plus-square',
    filled: 'bi-plus-square-fill',
  },
  person: {
    regular: 'bi-person-circle',
    filled: 'bi-person-circle',
  },
  heart: {
    regular: 'bi-heart',
    filled: 'bi-heart-fill',
  },
  chat: {
    regular: 'bi-chat',
    filled: 'bi-chat-fill',
  },
}

const currentIcon = iconMap[props.name] || iconMap.person
</script>

<template>
  <i :class="['bi', filled ? currentIcon.filled : currentIcon.regular]"></i>
</template>

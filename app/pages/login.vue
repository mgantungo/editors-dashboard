<template>
  <div>
    <Login2FA />
  </div>
</template>

<script setup>
import Login2FA from '~/components/Auth/Login2FA.vue';

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>
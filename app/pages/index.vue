<template>

</template>

<script setup>

const router = useRouter()

onMounted(() => {
  router.replace('/login')
})

// OR even simpler with navigateTo
//navigateTo('/login')
</script>
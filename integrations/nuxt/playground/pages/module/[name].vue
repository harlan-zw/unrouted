<template>
  <div>
    <h1>test</h1>
    <code>
      {{ module }}
    </code>
  </div>
<a href="/">Go back</a>
</template>

<script setup>
const module = ref([])
module.value = await $fetch('http://localhost:3000/__api/modules/' + useRoute().params.name)
</script>

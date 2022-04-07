<script setup lang="ts">
const name: string = useRoute().params.name as string
const module = await $get(`/api/modules/${name}`)
</script>
<template>
  <div>
    <h1>test</h1>
    <code>
      {{ module }}
    </code>
  </div>
<a href="/">Go back</a>
</template>

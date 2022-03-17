<script setup lang="ts">
let modules = await $get('/api/modules')

let post = await $post('/api/contact')

const hi = await $fetch('/api/greeting')

const search = ref('')
const name = ref('')

watchEffect(async () => {
    const value = search.value.toLowerCase()
    modules = await $fetch('/api/modules', { params: { search: value}})
  }
)

const addModule = async () => {
  const res = await $fetch('/api/modules', {
    method: 'POST',
    body: {
      description: 'test',
      name: name.value
    }
  })
  modules = await $fetch('/api/modules')
}

const removeModule = async (m) => {
  await $fetch(`/api/modules/${m.name}`, {
    method: 'DELETE',
  })
  modules = await $fetch('/api/modules')
}
</script>

<template>
<div>
  <h1>Nuxt modules</h1>
  <h2>Add module</h2>
  <form @submit.prevent="addModule">
    <input name="name" type="text" placeholder="module name" v-model="name">
    <button type="submit">Submit</button>
  </form>

  <h2>Search</h2>
  <input type="search" v-model="search">

  <div>
    <ul>
      <li v-for="(m, k) in modules" :key="k"><nuxt-link :to="`/module/${m.name}`">{{ m.name }}</nuxt-link> <button @click="removeModule(m)">delete</button></li>
    </ul>
  </div>
</div>
</template>

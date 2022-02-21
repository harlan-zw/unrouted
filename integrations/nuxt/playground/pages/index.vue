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

<script setup>
const modules = ref([])

modules.value = await $fetch('http://localhost:3000/__api/modules')

const search = ref('')
const name = ref('')

watchEffect(async () => {
    const value = search.value.toLowerCase()
    modules.value = await $fetch('http://localhost:3000/__api/modules?search=' + value)
  }
)

const addModule = async () => {
  await $fetch('http://localhost:3000/__api/modules', {
    method: 'POST',
    body: {
      description: 'test',
      name: name.value
    }
  })
  modules.value = await $fetch('http://localhost:3000/__api/modules')
}

const removeModule = async (m) => {
  await $fetch(`http://localhost:3000/__api/modules/${m.name}`, {
    method: 'DELETE',
  })
  modules.value = await $fetch('http://localhost:3000/__api/modules')
}
</script>

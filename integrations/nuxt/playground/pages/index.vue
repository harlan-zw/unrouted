<script setup lang="ts">
let modules = []
// let modules = await $get('/api/modules')
//
// let post = await $post('/api/contact')
//
// const hi = await $fetch('/api/hello')

const search = ref('')
const name = ref('')

// watchEffect(async () => {
//     const value = search.value.toLowerCase()
//     modules = await $fetch('/api/modules', { params: { search: value}})
//   }
// )

async function addModule() {
  await $post('/api/modules', {
    method: 'POST',
    body: {
      description: 'test',
      name: name.value,
    },
  })
  modules = await $fetch('/api/modules')
}

async function removeModule(m) {
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
      <input v-model="name" name="name" type="text" placeholder="module name">
      <button type="submit">
        Submit
      </button>
    </form>

    <h2>Search</h2>
    <input v-model="search" type="search">

    <div>
      <ul>
        <li v-for="(m, k) in modules" :key="k">
          <nuxt-link :to="`/module/${m.name}`">
            {{ m.name }}
          </nuxt-link> <button @click="removeModule(m)">
            delete
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

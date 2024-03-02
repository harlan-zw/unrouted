<script setup lang="ts">
const route = useRoute()
const message = ref('')
const email = ref('')

function submit() {
  $fetch(`/__api${route.path}`, {
    method: 'POST',
    body: JSON.stringify({
      message: message.value,
      email: email.value,
    }),
  })
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="email" type="email" name="email" placeholder="Email">
    <textarea v-model="message" placeholder="Message" name="message" />
    <button type="submit">
      Send
    </button>
  </form>
</template>

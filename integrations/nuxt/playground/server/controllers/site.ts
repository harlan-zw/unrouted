import { useBody } from 'unrouted'

export function greeting() {
  return 'hello :)'
}

export function submitContactForm() {
  const { email, message } = useBody<{ email: string, message: string }>()
  return {
    email,
    message,
    success: true,
  }
}

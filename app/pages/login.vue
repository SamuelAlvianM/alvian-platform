<template>
  <div class="min-h-screen flex items-center justify-center" style="background:linear-gradient(135deg,#4ED7F1 0%,#A8F1FF 50%,#FFFA8D 100%);">
    <div class="w-full max-w-sm">
      <!-- Logo & Brand -->
      <div class="text-center mb-8">
        <div class="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden" style="background:#0a0a3e;">
          <img v-if="logoExist" :src="logoSrc" alt="logo" class="w-full h-full object-contain" @error="logoExist = false" />
          <span v-else style="font-size:2.5rem;">🍽️</span>
        </div>
        <div class="font-brand text-2xl font-semibold" style="color:#0f2635;">Alvian's Kitchen</div>
        <div class="text-sm mt-1" style="color:#1a4a5c;">Toko Kue & Masakan · Since 1999</div>
      </div>

      <!-- Card Login -->
      <UCard class="shadow-xl">
        <template #header>
          <div class="text-center">
            <h2 class="font-bold text-gray-800 text-lg">Selamat Datang</h2>
            <p class="text-sm text-gray-400 mt-0.5">Masuk untuk mengelola toko</p>
          </div>
        </template>

        <UForm :state="form" class="space-y-4" @submit="login">
          <UFormField label="Username">
            <UInput
              v-model="form.username"
              placeholder="Masukkan username"
              icon="i-heroicons-user"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="Masukkan password"
              icon="i-heroicons-lock-closed"
              class="w-full"
            >
              <template #trailing>
                <button type="button" @click="showPass = !showPass" class="text-gray-400 hover:text-gray-600">
                  <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
          </UFormField>

          <div v-if="errorMsg" class="rounded-lg p-3 text-sm font-medium" style="background:#FEE2E2;color:#991b1b;">
            ⚠️ {{ errorMsg }}
          </div>

          <UButton type="submit" block :loading="loading" size="lg">
            Masuk
          </UButton>
        </UForm>
      </UCard>

      <p class="text-center text-xs mt-6" style="color:#0f4a5c;">
        Platform manajemen internal · v1.0.0
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const logoSrc = '/logo.png'
const logoExist = ref(true)
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({ username: '', password: '' })

async function login() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { ...form } })
    await navigateTo('/')
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Terjadi kesalahan, coba lagi'
  } finally {
    loading.value = false
  }
}
</script>

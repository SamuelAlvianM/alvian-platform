<template>
  <div class="min-h-screen flex items-center justify-center" style="background:linear-gradient(135deg,#4ED7F1 0%,#A8F1FF 50%,#FFFA8D 100%);">
    <div class="w-full max-w-sm">
      <div class="text-center mb-6">
        <div class="text-5xl mb-3">🔐</div>
        <div class="font-brand text-xl font-semibold" style="color:#0f2635;">Ganti Password</div>
        <p class="text-sm mt-1" style="color:#1a4a5c;">Kamu wajib mengganti password sebelum melanjutkan</p>
      </div>

      <UCard class="shadow-xl">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full flex items-center justify-center" style="background:#FFFA8D;">⚠️</span>
            <div>
              <div class="font-bold text-gray-800 text-sm">Password Baru Diperlukan</div>
              <div class="text-xs text-gray-400">Ini adalah langkah keamanan wajib</div>
            </div>
          </div>
        </template>

        <UForm :state="form" class="space-y-4" @submit="gantiPassword">
          <UFormField label="Password Baru" required>
            <UInput
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
              class="w-full"
              autofocus
            >
              <template #trailing>
                <button type="button" @click="showNew = !showNew" class="text-gray-400 hover:text-gray-600">
                  <UIcon :name="showNew ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Konfirmasi Password Baru" required>
            <UInput
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Ulangi password baru"
              class="w-full"
            >
              <template #trailing>
                <button type="button" @click="showConfirm = !showConfirm" class="text-gray-400 hover:text-gray-600">
                  <UIcon :name="showConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
          </UFormField>

          <!-- Strength indicator -->
          <div v-if="form.newPassword" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" class="flex-1 h-1.5 rounded-full transition-all" :style="`background:${strength >= i ? strengthColor : '#e5e7eb'};`" />
            </div>
            <div class="text-xs" :style="`color:${strengthColor};`">{{ strengthLabel }}</div>
          </div>

          <div v-if="errorMsg" class="rounded-lg p-3 text-sm font-medium" style="background:#FEE2E2;color:#991b1b;">
            ⚠️ {{ errorMsg }}
          </div>
          <div v-if="successMsg" class="rounded-lg p-3 text-sm font-medium" style="background:#D1FAE5;color:#065f46;">
            ✅ {{ successMsg }}
          </div>

          <UButton type="submit" block size="lg" :loading="loading">
            Simpan Password Baru
          </UButton>
        </UForm>
      </UCard>

      <p class="text-center text-xs mt-4" style="color:#0f4a5c; opacity:0.7;">
        Password tidak dapat dibatalkan. Hubungi admin jika ada masalah.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showNew = ref(false)
const showConfirm = ref(false)

const form = reactive({ newPassword: '', confirmPassword: '' })

const strength = computed(() => {
  const p = form.newPassword
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
})

const strengthColor = computed(() => ['#ef4444','#f97316','#eab308','#22c55e'][strength.value - 1] ?? '#e5e7eb')
const strengthLabel = computed(() => ['Terlalu pendek','Lemah','Cukup kuat','Kuat! 💪'][strength.value - 1] ?? '')

async function gantiPassword() {
  errorMsg.value = ''
  if (form.newPassword.length < 6) { errorMsg.value = 'Password minimal 6 karakter'; return }
  if (form.newPassword !== form.confirmPassword) { errorMsg.value = 'Konfirmasi password tidak cocok'; return }

  loading.value = true
  try {
    await $fetch('/api/auth/change-password', { method: 'POST', body: { newPassword: form.newPassword } })
    successMsg.value = 'Password berhasil diubah! Mengalihkan...'
    setTimeout(() => navigateTo('/'), 1200)
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Terjadi kesalahan'
  } finally { loading.value = false }
}
</script>

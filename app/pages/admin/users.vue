<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Manajemen User</h1>
        <p class="text-sm text-gray-500 mt-0.5">Tambah dan kelola akun pengguna platform</p>
      </div>
      <UButton icon="i-heroicons-user-plus" @click="openTambah">Tambah User</UButton>
    </div>

    <!-- Tabel -->
    <UCard :ui="{ body: 'p-0' }">
      <div v-if="pending" class="p-12 text-center text-gray-400">Memuat...</div>
      <div v-else-if="!data?.length" class="p-12 text-center text-gray-400">Belum ada user</div>
      <div v-else class="overflow-x-auto"><table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status Password</th>
            <th>Dibuat</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in data" :key="u.id">
            <td>
              <div class="flex items-center gap-2 font-semibold">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background:#FFFA8D;">
                  {{ u.isAdmin ? '👑' : '👤' }}
                </span>
                {{ u.username }}
              </div>
            </td>
            <td>
              <UBadge :label="u.isAdmin ? 'Admin' : 'Staff'" :color="u.isAdmin ? 'sky' : 'neutral'" variant="subtle" />
            </td>
            <td>
              <UBadge
                :label="u.mustChangePassword ? 'Harus Ganti Password' : 'Aktif'"
                :color="u.mustChangePassword ? 'orange' : 'green'"
                variant="subtle"
              />
            </td>
            <td class="text-sm text-gray-400">{{ formatTanggal(u.createdAt) }}</td>
            <td>
              <div class="flex items-center justify-center gap-2">
                <!-- Ganti Password -->
                <UButton
                  size="xs"
                  color="sky"
                  variant="soft"
                  icon="i-heroicons-key"
                  @click="openGantiPass(u)"
                >
                  Ganti Pass
                </UButton>
                <!-- Hapus — tidak bisa hapus admin -->
                <UButton
                  v-if="!u.isAdmin"
                  size="xs"
                  color="red"
                  variant="soft"
                  icon="i-heroicons-trash"
                  @click="hapus(u.id, u.username)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table></div>
    </UCard>

    <!-- Info -->
    <UCard>
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>User baru</strong> wajib ganti password saat pertama login — tidak bisa dilewati.</p>
          <p>Setelah admin <strong>reset password</strong>, user akan diminta ganti password lagi saat login berikutnya.</p>
          <p><strong>Admin (👑)</strong> tidak bisa dihapus.</p>
        </div>
      </div>
    </UCard>

    <!-- ── Modal Tambah User ── -->
    <UModal v-model:open="showTambah" title="Tambah User Baru">
      <template #body>
        <UForm :state="formTambah" class="space-y-4" @submit="tambah">
          <UFormField label="Username" required>
            <UInput v-model="formTambah.username" placeholder="cth: ani, budi, siti..." class="w-full" autofocus />
          </UFormField>
          <UFormField label="Password Sementara" required>
            <UInput v-model="formTambah.password" type="text" placeholder="Min. 6 karakter" class="w-full" />
          </UFormField>
          <div class="rounded-lg p-3 text-sm" style="background:#FFF9E6;border:1.5px solid #FFFA8D;color:#78350f;">
            ⚠️ User baru <strong>wajib ganti password</strong> saat login pertama kali.
          </div>
          <div v-if="errorTambah" class="rounded-lg p-3 text-sm font-medium" style="background:#FEE2E2;color:#991b1b;">
            {{ errorTambah }}
          </div>
          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showTambah = false">Batal</UButton>
            <UButton type="submit" :loading="loadingTambah">Buat User</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- ── Modal Ganti Password ── -->
    <UModal v-model:open="showGantiPass" :title="`🔑 Reset Password — ${targetUser?.username}`">
      <template #body>
        <UForm :state="formPass" class="space-y-4" @submit="gantiPassword">
          <!-- Info user -->
          <div class="flex items-center gap-3 p-3 rounded-xl" style="background:#f0f9ff;border:1.5px solid #A8F1FF;">
            <span class="w-10 h-10 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">
              {{ targetUser?.isAdmin ? '👑' : '👤' }}
            </span>
            <div>
              <div class="font-bold text-gray-800">{{ targetUser?.username }}</div>
              <div class="text-xs text-gray-400">{{ targetUser?.isAdmin ? 'Admin' : 'Staff' }}</div>
            </div>
          </div>

          <UFormField label="Password Baru" required>
            <UInput
              v-model="formPass.newPassword"
              :type="showPass ? 'text' : 'password'"
              placeholder="Min. 6 karakter"
              class="w-full"
              autofocus
            >
              <template #trailing>
                <button type="button" @click="showPass = !showPass" class="text-gray-400 hover:text-gray-600">
                  <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Konfirmasi Password Baru" required>
            <UInput
              v-model="formPass.confirm"
              :type="showPass ? 'text' : 'password'"
              placeholder="Ulangi password baru"
              class="w-full"
            />
          </UFormField>

          <div class="rounded-lg p-3 text-sm" style="background:#FFF9E6;border:1.5px solid #FFFA8D;color:#78350f;">
            ⚠️ Setelah direset, <strong>{{ targetUser?.username }}</strong> akan diminta ganti password saat login berikutnya.
          </div>

          <div v-if="errorPass" class="rounded-lg p-3 text-sm font-medium" style="background:#FEE2E2;color:#991b1b;">
            {{ errorPass }}
          </div>
          <div v-if="successPass" class="rounded-lg p-3 text-sm font-medium" style="background:#D1FAE5;color:#065f46;">
            ✅ {{ successPass }}
          </div>

          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showGantiPass = false">Batal</UButton>
            <UButton type="submit" color="sky" icon="i-heroicons-key" :loading="loadingPass">
              Reset Password
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { formatTanggal } = useFormat()
const { data, pending, refresh } = useFetch('/api/users', { lazy: true })

// ── Tambah User ──
const showTambah = ref(false)
const loadingTambah = ref(false)
const errorTambah = ref('')
const formTambah = reactive({ username: '', password: '' })

function openTambah() {
  Object.assign(formTambah, { username: '', password: '' })
  errorTambah.value = ''
  showTambah.value = true
}

async function tambah() {
  errorTambah.value = ''
  loadingTambah.value = true
  try {
    await $fetch('/api/users', { method: 'POST', body: { ...formTambah } })
    showTambah.value = false
    await refresh()
  } catch (e: any) {
    errorTambah.value = e?.data?.message ?? 'Terjadi kesalahan'
  } finally { loadingTambah.value = false }
}

// ── Ganti Password ──
const showGantiPass = ref(false)
const loadingPass = ref(false)
const errorPass = ref('')
const successPass = ref('')
const showPass = ref(false)
const targetUser = ref<any>(null)
const formPass = reactive({ newPassword: '', confirm: '' })

function openGantiPass(u: any) {
  targetUser.value = u
  Object.assign(formPass, { newPassword: '', confirm: '' })
  errorPass.value = ''
  successPass.value = ''
  showPass.value = false
  showGantiPass.value = true
}

async function gantiPassword() {
  errorPass.value = ''
  successPass.value = ''
  if (formPass.newPassword.length < 6) { errorPass.value = 'Password minimal 6 karakter'; return }
  if (formPass.newPassword !== formPass.confirm) { errorPass.value = 'Konfirmasi password tidak cocok'; return }

  loadingPass.value = true
  try {
    await $fetch(`/api/users/${targetUser.value.id}`, {
      method: 'PATCH',
      body: { newPassword: formPass.newPassword },
    })
    successPass.value = `Password ${targetUser.value.username} berhasil direset!`
    await refresh()
    setTimeout(() => { showGantiPass.value = false }, 1500)
  } catch (e: any) {
    errorPass.value = e?.data?.message ?? 'Terjadi kesalahan'
  } finally { loadingPass.value = false }
}

// ── Hapus User ──
async function hapus(id: number, username: string) {
  if (!confirm(`Hapus user "${username}"?`)) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

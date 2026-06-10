<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Manajemen User</h1>
        <p class="text-sm text-gray-500 mt-0.5">Tambah dan kelola akun pengguna platform</p>
      </div>
      <UButton icon="i-heroicons-user-plus" @click="showModal = true">Tambah User</UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div v-if="pending" class="p-12 text-center text-gray-400">Memuat...</div>
      <div v-else-if="!data?.length" class="p-12 text-center text-gray-400">Belum ada user lain</div>
      <table v-else>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status Password</th>
            <th>Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in data" :key="u.id">
            <td class="font-semibold flex items-center gap-2">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm" style="background:#FFFA8D;">👤</span>
              {{ u.username }}
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
              <UButton
                v-if="!u.isAdmin"
                size="xs" color="red" variant="soft"
                icon="i-heroicons-trash"
                @click="hapus(u.id)"
              />
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Keterangan -->
    <UCard>
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>User baru</strong> wajib ganti password saat pertama kali login — tidak bisa dilewati.</p>
          <p><strong>Admin</strong> tidak bisa dihapus dari halaman ini.</p>
        </div>
      </div>
    </UCard>

    <!-- Modal Tambah User -->
    <UModal v-model:open="showModal" title="Tambah User Baru">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="tambah">
          <UFormField label="Username" required>
            <UInput v-model="form.username" placeholder="cth: ani, budi, siti..." class="w-full" autofocus />
          </UFormField>
          <UFormField label="Password Sementara" required>
            <UInput v-model="form.password" type="text" placeholder="Min. 6 karakter" class="w-full" />
          </UFormField>
          <div class="rounded-lg p-3 text-sm" style="background:#FFF9E6;border:1.5px solid #FFFA8D;color:#78350f;">
            ⚠️ User baru <strong>wajib ganti password</strong> saat pertama kali login. Beritahu mereka password sementara ini.
          </div>
          <div v-if="errorMsg" class="rounded-lg p-3 text-sm font-medium" style="background:#FEE2E2;color:#991b1b;">{{ errorMsg }}</div>
          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton type="submit" :loading="loading">Buat User</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { formatTanggal } = useFormat()
const { data, pending, refresh } = await useFetch('/api/users')

const showModal = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const form = reactive({ username: '', password: '' })

async function tambah() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/users', { method: 'POST', body: { ...form } })
    showModal.value = false
    Object.assign(form, { username: '', password: '' })
    await refresh()
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Terjadi kesalahan'
  } finally { loading.value = false }
}

async function hapus(id: number) {
  if (!confirm('Hapus user ini?')) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

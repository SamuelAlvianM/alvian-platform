<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      style="position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;"
      @click.self="$emit('update:modelValue', false)"
    >
      <div style="position:absolute;inset:0;background:rgba(15,38,53,0.6);backdrop-filter:blur(2px);" @click="$emit('update:modelValue', false)" />
      <div
        class="card"
        style="position:relative;width:100%;padding:1.5rem;max-height:90vh;overflow-y:auto;"
        :style="{ maxWidth: width ?? '520px' }"
      >
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <h3 style="font-size:1.05rem;font-weight:700;color:#1a2332;">{{ title }}</h3>
          <button @click="$emit('update:modelValue', false)" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.25rem;line-height:1;padding:0.25rem;">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; width?: string }>()
defineEmits(['update:modelValue'])
</script>

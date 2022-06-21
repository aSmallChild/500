<template>
  <svg width="0" height="0">
    <defs v-html="def"></defs>
  </svg>
</template>

<script setup>
defineProps({
  def: String
});
</script>
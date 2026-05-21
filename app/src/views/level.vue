<template>
  <div v-if="level">
    <Controls :level="level" />
  </div>
  <div v-else>Level not found!</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getLevelById } from '@/components/levels.js'
import Controls from '@/components/controls.vue'

const route = useRoute()
const level = computed(() => getLevelById(route.params.id))
</script>

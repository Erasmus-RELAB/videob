<template>
  <el-menu
    default-active="activeIndex"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    @select="handleSelect"
  >
    <el-sub-menu index="bs-1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>Navigator One</span>
      </template>
      <el-menu-item-group>
        <template #title><span>Group One</span></template>
        <el-menu-item index="bs-1-1">item one</el-menu-item>
        <el-menu-item index="bs-1-2">item two</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="Group Two">
        <el-menu-item index="bs-1-3">item three</el-menu-item>
      </el-menu-item-group>
      <el-sub-menu index="bs-1-4">
        <template #title><span>item four</span></template>
        <el-menu-item index="bs-1-4-1">item one</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="bs-6">
      <el-icon><icon-menu /></el-icon>
      <template #title>Stat</template>
    </el-menu-item>
    <el-menu-item index="bs-3" disabled>
      <el-icon><document /></el-icon>
      <template #title>Navigator Three</template>
    </el-menu-item>
    <el-menu-item index="bs-4">
      <el-icon><setting /></el-icon>
      <template #title>Navigator Four</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
} from '@element-plus/icons-vue'

const emits = defineEmits(['selected'])
const props = defineProps(['activeIndex','handleSelect'])
const activeIndex = ref('0')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  emits('selected', key);
}

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>


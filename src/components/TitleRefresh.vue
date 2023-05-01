<script setup lang="ts">
//import userService from '../user.service'
import { computed, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";

const dodatnaPolja = ref(false);
  
//
const props = defineProps({
  Name:String,
  colwid:Number,
  button:Boolean,
  prekidac:Boolean,
  content:String
})

</script>

<template>
  <el-col :span="{ colwid }">
    <h5 class="display-5 text-start">
      {{ Name }}
      <el-tooltip v-if="button==true"
        class="item"
        effect="dark"
        :content=props.content
        placement="bottom"
        style="ml: left"
      >
        <el-button
          type="success"
          size="mini"
          circle
          plain
          @click="$emit('refresh')"
          :icon="Refresh"
          class="ml-3"
        ></el-button>
      </el-tooltip>

      <el-tooltip
        v-if="prekidac == true && user.userRole.roleId == 1"
        content="Погледај додатна поља"
        placement="bottom"
      >
        <el-switch
          v-model="dodatnaPolja"
          class="ml-3"
          @change="$emit('promena_vrednosti', dodatnaPolja)"
        >
        </el-switch>
      </el-tooltip>
    </h5>
  </el-col>
</template>

<style scoped></style>

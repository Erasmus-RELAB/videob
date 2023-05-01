<script lang="ts" setup>
import { toggleDark } from '~/composables';
import { computed, ref } from 'vue'
import { emit } from 'process';
import { inject, reactive } from 'vue'
const { GetSettings, GetConfigAxios } = inject('settings');
//import {settings} from '../../settings.js';
import { Refresh, CircleCloseFilled } from "@element-plus/icons-vue";
import Axios from 'axios';

const emits = defineEmits(['selected'])
const props = defineProps(['defaultActiveIndex','handleSelect'])

var settings = reactive({});
settings = GetSettings();

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  emits('selected', key);
}

const activeIndexBaseHeader = ref("bh-1-1");


    function Reset(showNotification=true) {
        let configAxios = GetConfigAxios();
        let axios = Axios.create(configAxios);
        Axios.all(
            [
                axios.get('reset'),
            ])
            .then((response) => {

                if(showNotification)
                    ElNotification.success('Successfully reset data')
            })
            .catch(function (error) {
                ElNotification.error('Failed to reset data ' + error)
            });
    };

</script>

<template>
<!-- @select="props.handleSelect" -->
  <el-menu
  :default-active="activeIndexBaseHeader" 
  mode="horizontal" 
  router="true"
  >
    <el-menu-item index="bh-0" >
      <span style="color:orange">Video</span><span style="color:green">Srt</span>
    </el-menu-item>

    <el-sub-menu  index="bh-1" v-if="settings.Card.CARDNAME">
      <template #title>Configurator</template>
      <el-menu-item index="Config">Proba1Config</el-menu-item>
      <el-menu-item index="ConfigChannels">Proba2ConfigChannels</el-menu-item>
      <el-menu-item index="bh-1-1">All channels</el-menu-item>
      <el-menu-item index="bh-1-2" v-show="false">Channels</el-menu-item>
      <el-menu-item index="bh-1-3">Channel</el-menu-item>
    </el-sub-menu>    

    <el-sub-menu index="bh-2" v-if="settings.Card.CARDNAME">
      <template #title>Statistics</template>
      <el-menu-item index="bh-2-1" v-show="false">Stat 1</el-menu-item>
      <el-menu-item index="bh-2-2">All channels</el-menu-item>
    </el-sub-menu>


    <el-sub-menu index="bh-3" v-if="settings.Card.CARDNAME">
      <template #title>History</template>
      <el-menu-item index="bh-3-1" v-show="false">History - Bar Chart</el-menu-item>
      <el-menu-item index="bh-3-2">Bar Charts</el-menu-item>
      <el-menu-item index="bh-3-3" v-show="false">Reactive Bar Charts</el-menu-item>
    </el-sub-menu>

    <el-menu-item style='margin-left: auto; color:green' index="bh-4">{{settings.Card.CARDNAME}}</el-menu-item>
    <el-menu-item style='color:red'  v-if="settings.Card.CARDNAME" @click="Reset()" index="bh-5">Reset</el-menu-item>

    <!-- <el-menu-item index="bh-5">Config file</el-menu-item>
    <el-menu-item index="bh-6">Stats</el-menu-item> -->
    <!-- <el-menu-item h="full" @click="toggleDark()">
      <button class="border-none w-full bg-transparent cursor-pointer" style="height: var(--ep-menu-item-height);">
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item> -->
  </el-menu>
 
</template>


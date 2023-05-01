<template>
  <!-- navigacija -->
  <el-row >
    <el-col :span="6" > 
      <el-tooltip class="item" content="Prev" placement="bottom" >
        <el-button type="primary" :icon="ArrowLeft" circle plain @click="currentPage = currentPage > 1 ? currentPage - 1 : 1"></el-button>
      </el-tooltip>
      
      <span style="margin:0 20px 0 20px"> {{ currentPage }} / {{ pages }} </span>
      <el-tooltip class="item" content="Next" placement="bottom" >
        <el-button type="primary" :icon="ArrowRight" circle plain @click="currentPage = currentPage < pages ? currentPage + 1 : pages"></el-button>
      </el-tooltip>
    </el-col>

    <el-col :offset="3" :span="6" class="text-center"> 
      <el-tooltip class="item" content="Download" placement="bottom" >
        <el-button type="primary" :icon="Download" circle plain @click="downloadItem"></el-button>
      </el-tooltip>      
    </el-col>

    <el-col :offset="3" :span="6" class="text-right" >
      <el-button type="primary" :icon="Minus" circle plain @click="scale = scale > 0.25 ? scale - 0.25 : 0.25"> </el-button>
      <span style="margin:0 20px 0 20px">{{ scale * 100 }}%</span>
      <el-button type="primary" :icon="Plus" circle plain @click="scale = scale < 2 ? scale + 0.25 : 2"></el-button>
    </el-col>
  </el-row>  

  <el-row style="border-bottom: 1px solid;" class="mb-10" >.</el-row> 

  <el-row >
    <el-col :span="24" class="text-center">  
      <div margin="auto">
        <VuePDF :pdf="pdf" :page="currentPage" :scale="scale" style="display:block" />  
      </div>
    </el-col>
  </el-row> 
</template>

<script setup lang="ts">
import { usePDF, VuePDF } from "@tato30/vue-pdf";
import { ArrowLeft, ArrowRight, Plus, Minus, Download } from "@element-plus/icons-vue";
import { ref, reactive, onMounted,  watch, computed } from "vue";
import {saveAs} from 'file-saver'
import configAxios from '../global.js';
import Axios from 'axios';

var pdfFilePath  = ref("");

const props = defineProps<{
  pdfFile:String,
  pdfFileGuid:String,
  path: String, //"./public/uploads",
}>()

pdfFilePath.value = (props.path + "/" + props.pdfFileGuid);
debugger;
let{ pdf, pages } = usePDF( pdfFilePath.value );

const scale = ref(1);
const currentPage = ref(1);

const downloadItem = ()=>{
  const axios = Axios.create();
  alert(props.pdfFileGuid )
  axios
        .get(pdfFilePath.value, {responseType: 'blob'})
        .then(response => {
            debugger
            saveAs(response.data, props.pdfFile);
        })
}
</script>

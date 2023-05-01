<template>
    <div class="container" id="app">
        <!-- {{ elUploadPath }} <br>
        {{ state.urlpath }}<br>
        {{ state.configAxios.baseURL }}<br> -->
        <!-- :auto-upload="false" -->
        <el-row >
            <el-col :span="24">
                <el-upload
                    drag
                    v-model:file-list="fileList"
                    :action="elUploadPath"
                    :on-success="Uspesno"
                    :on-error="Greska"
                    :limit="1"
                    ref="unosUploader"
                    >
                    <Upload-filled />
                    
                    <div class="el-upload__text">{{eluploadtext}}</div>
                    <template #tip>
                        <div class="el-upload__tip">
                           {{ eluploadtip }}
                        </div>
                    </template>
                </el-upload>
            </el-col>
            <!-- <el-col :span="24" class="mt-3">
                <el-tooltip class="item" effect="dark" content="Upload selected file" placement="bottom">
                    <el-button type="success" :icon=Check plain circle @click="InsertFile()"></el-button>
                </el-tooltip>
            </el-col> -->
        </el-row>
    </div>
</template>
<script setup lang="ts">
    import configAxios from '../../global.js';
    import { ref, reactive, onMounted, computed } from 'vue'
    import {  Upload,   Download, Check } from '@element-plus/icons-vue'
    import  type{UploadInstance, UploadProps, UploadFile, UploadFiles}  from 'element-plus';
    import { inject } from 'vue'
    
    //const { GetConfigAxios } = inject('settings');
    const props =  defineProps({
      eluploadtip: String,
      eluploadtext: String,
      urlpath:String
    })

     const state = reactive({
         //configAxios:{},
         urlpath:props.urlpath,
    //     elUploadPath:{}
     });
    const unosUploader = ref<UploadInstance>()


    const emit = defineEmits(['success', 'error'])
    
    var fileList = ref<UploadUserFile[]>([])

    let elUploadPath = computed(()=>{
        //return state.configAxios.baseURL + state.urlpath
        return configAxios.baseURL + state.urlpath
    });
    onMounted(()=> {
        //state.configAxios = GetConfigAxios();
    });
        //(response,file,fileList)
    const Greska = ()  =>{
            emit('error', unosUploader)
        }
    const Uspesno =  () =>{
        if(fileList.value!.length > 0)
            emit('success', fileList.value[0], unosUploader)
        
        unosUploader.value!.clearFiles();   
    }
    const InsertFile = () => {
        unosUploader.value!.submit();
    }
</script>


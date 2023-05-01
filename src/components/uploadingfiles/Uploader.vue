<template>
    <div class="container" id="app">
        <el-row>
            <el-col :span="24">
                <el-upload
                    drag
                    :action="path"
                    :on-success="Uspesno"
                    :on-error="Greska"
                    :file-list="listaFajlova"
                    :auto-upload="false"
                    ref="unosUploader"
                    >
            <el-icon class="el-icon--upload">
                <slot>
                    
                </slot>
                <!-- <Upload-filled /> -->
            </el-icon>
                    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                    <template #tip>
                        <div class="el-upload__tip">
                           File *.json
                        </div>
                    </template>
                </el-upload>
            </el-col>
            <el-col :span="24" class="mt-3">
                <el-tooltip class="item" effect="dark" content="Снимите извод" placement="bottom">
                    <el-button type="success" icon="el-icon-upload" plain circle @click="InsertIzvod()"></el-button>
                </el-tooltip>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    // import Axios from 'axios';
    import configAxios from '../../global_local.js';
    import * as ElementPlusIconsVue from '@element-plus/icons-vue'
    import {  Upload,   Download, UploadFilled } from '@element-plus/icons-vue'
    export default {
        name:"Uploader",
        data(){
            return {
                listaFajlova:[],
                uplodovanFile:"",
                path:configAxios.baseURL+"configurator/upload_files/"
            }
        },
        methods:{
            Greska(response,file,fileList){
                // console.log(file)
                // console.log(fileList)
                // console.log(response);
                this.$emit('error', this.$refs.unosUploader)
            },
            Uspesno(response,file,fileList){
                // console.log(file)
                // console.log(fileList)
                // console.log(response);
                this.$emit('success', this.$refs.unosUploader)
                this.$refs.unosUploader.clearFiles();                
            },
            InsertIzvod(){
                this.$refs.unosUploader.submit();
            },
        }
    }
</script>


<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
//import URL from 'url';
//import path from 'node:path';



const props = defineProps<{
  fileName : string,
  fileNameGuid : string,
  version : number,
  imageFileGuid: string,

  width: number, //850,   
  videowidth : number,
  path: string, //"./public/uploads",
}>()
 const src = ref({});

onMounted(() => {
});


const modaltitle = computed(() => {
  return props.fileName + "   ver." + props.version;
});
const pathVideo = computed(() => {
  //let p = "E:/Djole/video/FRONTEND/"  + props.path + "/" + props.fileNameGuid
  //string pat = (props.path + "/" + props.fileNameGuid);
  console.log("* "+props.path + "/" + props.fileNameGuid)
  //return new URL('file:///' + props.path + "/" + props.fileNameGuid);
  return (props.path + "/" + props.fileNameGuid);
});
const pathPoster = computed(() => {
  return (props.path + "/" + props.imageFileGuid);
  //return new URL('file:///' + props.path + "/" + props.imageFileGuid);
});
</script>

<template>
    <video :width="props.videowidth" :poster="pathPoster" controls>
      <source :src="pathVideo" type="video/mp4" />
    </video>
</template>

<style scoped>
/* .modal {
  display: block !important;
}
th {
  border-bottom: solid 2px rgb(39, 52, 80) !important;
  color: rgb(39, 52, 80);
} */
</style>

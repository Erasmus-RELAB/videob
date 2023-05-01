<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"

    background-color="#545c64"
    text-color="#fff"
    :active-text-color="activemenucolor"
    router="true"
  >

     <el-menu-item index="/Home">Home</el-menu-item>
    
    <el-menu-item index="/Creator" v-if="isCreator">Creator</el-menu-item>
   
    <el-menu-item index="/MyReview" v-if="isReviewer">My review</el-menu-item>

    <div class="flex-grow"/>
    <el-menu-item>
      <el-link href="https://relab.kg.ac.rs">
        <el-image style="width: 300px; margin:-8px 0 0 0" :src="imgLogoUrl" alt="logo" />
      </el-link>
    </el-menu-item>

    <div class="flex-grow" />
    <!-- <el-menu-item index="1" v-if="state.user" ><span id="spanFirstName" :style="styleNavLogin">{{state.user.firstName}}</span></el-menu-item> -->
    <el-menu-item index="/Logout"  v-if!="isLogged" @click="logout()">Logout <span  :style="styleNavLogin">&nbsp; {{ state.user.firstName}}</span></el-menu-item>
    <el-menu-item index="/Login"  v-if="!isLogged">Login</el-menu-item>
  </el-menu>

</template>

<script lang="ts" setup>
import { debugPort } from 'process';
import { watch, ref, reactive, inject, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import imgLogoUrl from "../assets/logo.png";

const { GetLoggedUser, UpdateLoggedUser } = inject('logged') as any;
//import {share} from '../share.js';
const activemenucolor = computed(()=>{
  if(state.user){
    if(state.user.type == 'REVIEWER') return "#00FFF6";
    if(state.user.type == 'CREATOR') return"#26FF58";
  }
  else{
    return "#ffd04b";
  }
})

const styleNavLogin = reactive({
  color: activemenucolor,
  fontSize: '1.1em',
  fontStyle: 'italic'
})


const router = useRouter()
const route = useRoute();

type State = {
   user: {
    type:string,
    username:string,
    firstName:string
   }
}
let state = reactive<State>({
  user : {
    type : "",
    username : "",
    firstName : ""
  }
});

const isReviewer = computed(()=>{
  return (state.user && state.user.type=='REVIEWER')
})
const isCreator = computed( ()=>{
  return (state.user && state.user.type=='CREATOR')
})
const isAnonimous = computed(()=>{
  return isLogged && !isReviewer && !isCreator
})
const isLogged = computed(()=>{
  return (!!state.user && state.user?.username?.length>1) 
})


watch(() => route.name, () => {
  console.debug(`Navigacija - watch route.name changed to ${String(route.name)}`);
  // Do something here...
  state.user = GetLoggedUser();
  console.debug(`Navigacija - state.user watch ${state.user}`);
  // Optionally you can set immediate: true config for the watcher to run on init
//}, { immediate: true });
});

onMounted(()=> {
  if(!activeIndex.value){
    activeIndex.value = "/Home"
    router.push('/Home');
  }
});

async function logout(){
  debugger;
  console.log("logout")
  UpdateLoggedUser(undefined);
  
  state.user = GetLoggedUser();
  //go to home
  await router.push('/Home');
  console.log("state.user " + JSON.stringify(state.user))
}

const activeIndex = ref('/')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
<style>
.flex-grow {
  flex-grow: 1;
}
.centered {
}
</style>
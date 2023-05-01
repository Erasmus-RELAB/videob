<template>
  <!-- <el-config-provider namespace="ep">
  <div class="common-layout">
    <el-container >
      <el-header><BaseHeader :defaultActiveIndex="0" :handleSelect="handleSelectactiveIndexBaseHeader" /></el-header>
      <el-container>
        <el-aside  width="auto"><BaseSide v-show="false"  :defaultActiveIndex="1" :handleSelect="handleSelectactiveIndexBaseHeader" /> </el-aside>
        <el-container>
          <el-main>
            <component :is='routes[activeIndexBaseHeader]' ></component>
          </el-main>
          <el-footer></el-footer>
        </el-container>
      </el-container>
    </el-container>
    <login v-else></login>
    <router-view/>
  </div>
  </el-config-provider> -->

  <!-- <login v-if="isLogin"></login>
  <navigacija v-else></navigacija> -->
  <!-- <navigacija v-if="isLogin==true"></navigacija>
  <login v-else></login> -->
  <navigacija></navigacija>
  <router-view/>

</template>

<script setup lang="ts">
import userservice from './userservice';
import { ref, computed, reactive, inject } from 'vue'

const { GetLoggedUser } = inject('logged') as any;

const isLogin = computed(()=>{
  debugger;

  let u = GetLoggedUser();
  console.log(u)
  let rez = u?.type?.length > 0;
  console.log(rez)
  return rez;
})

// function login(){
//   Axios.create(configAxios)
//       .post('/api/Users/authenticate',this.details)
//       .then((response) => {
//           userservice.setAuthUser(JSON.stringify(response.data));
//           this.$router.go({name:"Home"});
//       })
//       .catch(function (error) {
//           console.log(error.response);
//           alert(error);
//       });    
// }



const activeIndexBaseHeader = ref("bh-2-1");

function selectedMenuItem(arg){
  activeIndexBaseHeader.value = arg;
}
</script>

<style>


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
th{
    border-bottom: solid 2px rgb(39, 52, 80);
    color: rgb(39, 52, 80) ;
}
</style>


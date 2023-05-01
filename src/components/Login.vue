<script lang="ts" setup>
import Axios from "axios";
import mynotifications from "./MyNotifications"
import { User, Close } from "@element-plus/icons-vue";
import { reactive, inject } from "vue";
import { useRoute, useRouter } from 'vue-router';
import configAxios from '../global';

const { UpdateLoggedUser, GetLoggedUser } = inject("logged") as any;

const route = useRoute();
const router = useRouter()

let user = reactive({
  username: "",
  password: "",
  type: "CREATOR",
});
// let user = reactive({
//   username: "ana",
//   password: "ana",
//   type: "REVIEWER",
// });
        
// let user = reactive({
//   username: "jova",
//   password: "jova",
//   type: "CREATOR",
// });

async function Login() {
  Axios.create(configAxios)
    .post("/checklogin", user)
    .then((response) => {
      UpdateLoggedUser(response.data.user);
      user = GetLoggedUser();
      
      mynotifications.success("Successfully login " + user.username + " as " + user.type);
      if(user.type == "CREATOR")
        router.push('/Creator');
      if(user.type == "REVIEWER")
        router.push('/MyReview');        
    })
    .catch((error) => {
      mynotifications.error("Failed to login data ", error);
    });
}
</script>

<template>
<router-view />
  <div class="common-layout">
    <el-row justify="center">
      <el-card class="box-card mt-5" >
       
        <div class="card-header">
        Login
      </div>
      
        <!-- <el-row>
          <el-col :span="24" class="text-center bg-secondary text-white"> Login </el-col>
        </el-row> -->
        <el-form v-if="user" ref="form" :model="user" label-position="top">
          <el-form-item label="Username">
            <el-input type="text" placeholder="" v-model="user.username"></el-input>
          </el-form-item>

          <el-form-item label="Password">
            <el-input type="password" placeholder="" v-model="user.password"></el-input>
          </el-form-item>

          <el-form-item label="Type of user">
            <el-select v-model="user.type" placeholder="Select" style="width: 100%">
              <el-option label="CREATOR" value="CREATOR" />
              <el-option label="REVIEWER" value="REVIEWER" />
            </el-select>
          </el-form-item>

          

        </el-form>
        
        <el-row>
          <el-col :span="24">
            <el-tooltip content="Login" placement="bottom" effect="light">
              <el-button
                type="success"
                :icon="User"
                plain
                circle
                @click="Login()"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="Cancel" placement="bottom" effect="light">
              <el-button
                type="danger"
                :icon="Close"
                plain
                circle
                @click="
                  user.username = '';
                  user.password = '';
                "
              ></el-button>
            </el-tooltip>
            
          </el-col>
        </el-row>
      </el-card>
    </el-row>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
.box-card {
  width: 480px;
}
</style>

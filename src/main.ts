import { createApp, onMounted, reactive } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory,createWebHashHistory, START_LOCATION } from 'vue-router'
import userservice from './userservice';

//const publicPath = '/dist/';

//import {share} from './share.js'

// import "~/styles/element/index.scss";
//import ElementPlus, { ElIcon } from "element-plus";
//import all element css, uncommented next line
//import "element-plus/dist/index.css";
// or use cdn, uncomment cdn link in `index.html`

import "~/styles/index.scss";
import 'uno.css'

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss"
import 'element-plus/theme-chalk/src/notification.scss'
import {provide, ref, reactive} from 'vue'
import {URL} from '../package.json';

const auth = (to, from, next) => {
    if (userservice.getAuthUser()!=null) {
      return next();
    } else {
      return next("/Login");
    }
  };

  const base = reactive({
    url:""
  })
  onMounted(()=>{
    base.url = import.meta.env.BASE_URL;
  })

export const router = createRouter({
    //history: createWebHistory(import.meta.env.BASE_URL),
    //history: createMemoryHistory(),
    //history: createWebHistory(),
    history: createWebHashHistory(import.meta.env.BASE_URL),
    //base: process.env.BASE_URL,
    base : base.url,
    routes: [
        {
            //base: publicPath,
            path: "/",
            name: "/",
            // beforeEnter:auth,
            component: () => import("./components/Home.vue"),
            alias: '/Home'
        },
        {
            //base: publicPath,
            path: "/Login",
            name: "Login",
            // beforeEnter:auth,
             component: () => import("./components/Login.vue")
        },
        {
            //base: publicPath,
            path: "/Home",
            name: "Home",
            // beforeEnter:auth,
            component: () => import("./components/Home.vue")
        },
        {
            //base: publicPath,
            path: "/Creator",
            name: "Creator",
            beforeEnter:auth,
            component: () => import("./components/Creator.vue")
        },    
        {
            //base: publicPath,
            path: "/MyReview",
            name: "MyReview",
            beforeEnter:auth,
            component: () => import("./components/MyReview.vue")
        }, 
    ]
  })
  router.beforeEach(async (to, from) => {
    // redirect to login page if not logged in and trying to access a restricted page
    // const publicPages = ['/login'];
    // const authRequired = !publicPages.includes(to.path);
    // const auth = useAuthStore();

    // if (authRequired && !auth.user) {
    //     auth.returnUrl = to.fullPath;
    //     return '/Login';
    // }
});

// router.afterEach((to, from, failure) => {
//     // Any kind of navigation failure
//     if (isNavigationFailure(failure)) {
//         console.log("++++++++++++++++++++++++++++")
//        console.log(failure)
//     }
//   })



const app = createApp(App);

const logged = reactive({
    user:{}
})
function UpdateLoggedUser(val:any) : void {
    logged.user = val;
    userservice.setAuthUser(JSON.stringify(val));
}

function GetLoggedUser() {
    logged.user = userservice.getAuthUser();
    return logged.user;
}
// app.provide('settings',{
//     settings,
//     UpdateBaseURL,
//     GetSettings,
//     GetConfigAxios,
// });
app.provide('logged',{
    logged,
    UpdateLoggedUser,
    GetLoggedUser
});

app.use(router);

app.mount("#app");

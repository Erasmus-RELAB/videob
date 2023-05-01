<script setup lang="ts">
import configAxios from "../global";
import { ref, reactive, onMounted, watch, computed } from "vue";
import Axios from "axios";
import mynotifications from "./MyNotifications"
import saveAs from "file-saver";
import { Upload, Check, Document, Plus, CirclePlus, Close, VideoPlay } from "@element-plus/icons-vue";
import TitleRefresh from "./TitleRefresh.vue";
import type { UploadInstance, UploadProps, FormRules } from "element-plus";
//import type { Action } from "element-plus";
import { inject } from "vue";
import { useRouter } from "vue-router";
import  PlayVideo  from "./PlayVideo.vue"
import  PdfViewer  from "./PdfViewer.vue"
import { debugPort } from "process";
const { GetLoggedUser, UpdateLoggedUser } = inject("logged") as any;

const uploadRef = ref<UploadInstance>();
const router = useRouter();
const Form = {
  NEWPROJECT: 0,
  NEWVERSION: 1,
  YTURL: 2,
};

var state = reactive({
  openform: false,
  formtype: 1, //0-add, 1-upd, 2-yturl
  videopanel: {
    open: false,
    fileName: "",
    fileNameGuid: "",
    version: -1,
    imageFileGuid: "",
    width: 850,
    videowidth:800,
    path: 'uploads',
    //path: 'uploads',
    //path: '@/../public/uploads', //@ src folder
    
        
  },
  pdfpanel: {
    open: false,
    pdfFile: "",
    pdfFileGuid: "",
    width: 1200,
    path: "uploads",
  },  
  form: {
    fileName: "",
    imageFile: "",
    keyWords: "",
    selectedProjectName: "",
    projectName: "",
    reviewers: [],
    abstract: "",
    message: "",
    username: "",
    ytUrl: "",
    pdfFile: "",
  },
  base: {
    reviewers: [],
    videoclips4user: [],
    videoclips4creator4history: [],
    fields: [],
  },
  pagetitle: "Upload media - create new or update a project",
});

function cancel() {
  console.log('--------------------------------------------')
   console.log(state.videopanel.path)
  state.form.fileName = "";
  state.form.imageFile = "";
  state.form.keyWords = "";
  state.form.reviewers = [];
  state.form.abstract = "";
  state.form.message = "";
  state.form.projectName = "";
  state.form.selectedProjectName = "";
  state.form.pdfFile = "";
}
async function refreshCBdata() {
  console.log("state.form.username "+state.form.username)
  state.form.username = GetLoggedUser().username;
  let axios = Axios.create(configAxios);

  Axios.all([
    axios.get("allreviewers"),
    axios.get("projects4user/" + state.form.username),
  ])
    .then((response) => {
      state.base.reviewers = response[0].data.allreviewers;
      state.base.videoclips4user = response[1].data.videoclips;
      mynotifications.success("Successfully")
    })
    .catch(function (error) {
      mynotifications.error("Failed to read data", error);
    });
}

async function loadFields() {
  let axios = Axios.create(configAxios);

  Axios.all([
    axios.get("allfields"),
  ])
    .then((response) => {
      state.base.fields = response[0].data.allfields;
      mynotifications.success("Successfully")
    })
    .catch(function (error) {
      mynotifications.error("Failed to read data", error);
    });
}
function loadHistory() {
  let axios = Axios.create(configAxios);
  Axios.all([axios.get("projects4creator/history/" + state.form.username)])
    .then((response) => {
      state.base.videoclips4creator4history = response[0].data.videoclips;
    })
    .catch(function (error) {
      mynotifications.error("Failed to read data", error);
    });
}
onMounted(() => {
  state.form.username = GetLoggedUser().username;

  if(state.form.username){
    refreshCBdata();
    loadHistory();
    loadFields();
  }
  else{
    router.push("/Login")
  }
});

// const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
//         ElMessage.warning("onRemove");
//     }
const handleSuccessVideo: UploadProps["onSuccess"] = (elUploadRef) => {
  mynotifications.success("Submit new video!");

  state.form.fileName = elUploadRef.name;
  console.log(elUploadRef);
};

const handleSuccessImage: UploadProps["onSuccess"] = (elUploadRef) => {
  mynotifications.success("Submit new poster!");

  state.form.imageFile = elUploadRef.name;
  console.log(elUploadRef);
};

const handleSuccessPdf: UploadProps["onSuccess"] = (elUploadRef) => {
  mynotifications.success("Submit new pdf!");

  state.form.pdfFile = elUploadRef.name;
  console.log(elUploadRef);
};

function SaveDataForVideo() {
  if (state.formtype<2 && (!state.form.fileName || state.form.fileName.length == 0)) {
    mynotifications.box("Video file must be uploaded before save!", "Error", "error");
    return;
  }
  if (
    (state.formtype==0 && state.form.projectName?.length == 0) ||
    (state.formtype==1 && state.form.selectedProjectName?.length == 0) ||
    (state.formtype==2 && state.form.selectedProjectName?.length == 0)
  ) {
    mynotifications.box("Project must be defined!", "Error", "error");
    return;
  }
  if (state.formtype==0 && (state.form.keyWords?.length == 0 || state.form.abstract?.length == 0)) {
    mynotifications.box("Key words or/and abstract is empty!", "Error", "error");
    return;
  }
  if (state.formtype==0 && state.form.reviewers.length == 0) {
    mynotifications.box("A reviewer must be defined!", "Error", "error");
    return;
  }
  debugger;
  console.log("state.formtype "+state.formtype)
  if (state.formtype==0) {
    NewVideo();
  } else if(state.formtype ==1) {
    UpdateVideo();
  }
  else if(state.formtype == 2) {
    UpdateYTurl();
  }
}

function Prepare() {
  try {

    if(!state.openform) return;

    console.log("prepare");
    let axios = Axios.create(configAxios);
    Axios.all([axios.get("/creator/prepareproject")])
    .then((response) => {
      console.log("prepared");
    })
    .catch((error) => {
      mynotifications.error("Failed getting data ", error);
    });


  } catch (e) {
    mynotifications.box("Failed to save the file !" + e, "Error", "error");
  }
}
function NewVideo() {
  try {
    state.form.ytUrl = "";
    Axios.create(configAxios)
    .post("/creator/updatenewproject", state.form)
    .then((response) => {
        mynotifications.success(response.data.message);
        refreshCBdata();
        cancel();
        loadHistory();
        loadFields();
        state.openform = false;
    })
    .catch((error) => {
      if(error.response.status == 550){
        mynotifications.box(error.response.data.message, "Error ", error);
      }
      else{
        mynotifications.error("Failed to add new video!", error);
      } 
    });

  } catch (error) {
    mynotifications.error("Failed to add new video!", error);
  }
}
function UpdateVideo() {
  try {
    state.form.ytUrl = "";
    Axios.create(configAxios)
    .post("/creator/updateproject", state.form)
    .then((response) => {
        mynotifications.success(response.data.message);
        cancel();
        loadHistory();
        loadFields();
        state.openform = false;
    })
    .catch((error) => {
      if(error.response.status == 550){
        mynotifications.box(error.response.data.message, "Error ", error);
      }
      else{
        mynotifications.error("Failed to upload the file !", error);
      } 
    })
  } catch (error) {
    mynotifications.error("Failed to upload the file !", error);
  }
}
function UpdateYTurl() {
  try {
    Axios.create(configAxios)
    .post("/creator/updateprojectyturl", state.form)
    .then((response) => {
        mynotifications.success(response.data.message);
        cancel();
        loadHistory();
        loadFields();
        state.openform = false;
    })
    .catch((error) => {
      if(error.response.status == 550){
        mynotifications.box(error.response.data.message, "Error ", error);
      }
      else{
        mynotifications.error("Failed to upload the file !", error);
      } 
    })
  } catch (error) {
    mynotifications.error("Failed to upload the file !", error);
  }
}

const rulesProjectName = reactive<FormRules>({
  projectName: [
    { required: true, message: "Please input name of project", trigger: "blur" },
    { min: 3, message: "Length should be min 3", trigger: "blur" },
  ],
});
const rules = reactive<FormRules>({
  fileName: [{ required: true, message: "Please coose a file", trigger: "blur" }],
  keyWords: [
    { required: true, message: "Please input keywords", trigger: "blur" },
    { min: 3, message: "Length should be min 3", trigger: "blur" },
  ],
  projectName: [
    { required: true, message: "Please input name of project", trigger: "blur" },
    { min: 3, message: "Length should be min 3", trigger: "blur" },
  ],
  abstract: [
    { required: true, message: "Please input abstract", trigger: "blur" },
    { min: 3, message: "Length should be min 30", trigger: "blur" },
  ],

  reviewersprop: [
    {
      required: true,
      message: "Please select at least one reviewer",
      trigger: "change",
    },
  ],
});
const handlePlay = (idx : number, r : any) => {
  //alert("idx="+idx)
  //alert("r="+r.fileNameGuid)
  state.videopanel.open = true;
  state.videopanel.fileNameGuid = r.fileNameGuid;
  state.videopanel.version = r.version;
  state.videopanel.fileName = r.fileName;
  state.videopanel.imageFileGuid = r.imageFileGuid;
};
const handlePdf = (idx : number, r : any) => {
  state.pdfpanel.open = true;
  state.pdfpanel.pdfName = r.pdfName;
  state.pdfpanel.pdfFileGuid = r.pdfFileGuid;
};
const tableCellStyleHistory = ({ row, colany, rowIndex, columnIndex } : any) => {
  let forecolor = "#222222";
  let backgroundcolor = "#eaeaea";

  return { background: backgroundcolor, color: forecolor };
};
const datetimeformater = (row : any, column : number, cellValue : any, index : number) => {
  const dt = new Date(cellValue);
  // const MM = ("0" + (dt.getMonth() + 1)).slice(-2);
  // const dd = ("0" + dt.getDate()).slice(-2);
  // const yyyy = dt.getFullYear();
  // const hh = ("0" + dt.getHours()).slice(-2);
  // const mm = ("0" + dt.getMinutes()).slice(-2);

  //return yyyy + "-" + MM + "-" + dd + " " + hh + ":" + mm;
  return dt.toLocaleDateString('sr-SR');
};
const sortDateTime = (a: any, b: any)=>{
  const x = new Date(a.datetime);
  const y = new Date(b.datetime);
  if(x > y ) return 1;
  else if(x < y) return -1;
  else return 0;
}


const modaltitle = computed(() => {
  return state.videopanel.fileName + "   ver." + state.videopanel.version;
});
const pathVideo = computed(() => {
  return state.videopanel.path + "/" + state.videopanel.fileNameGuid;
});
const pathPoster = computed(() => {
  return state.videopanel.path + "/" + state.videopanel.imageFileGuid;
});
</script>

<template>
  <TitleRefresh colwid="5" button="false" />
  <!-- komandna dugmad -->
  <el-row>
    <el-col :offset="1" :span="22">
      <el-tooltip content="Add a new project" placement="bottom" effect="light">
        <el-button
          :icon="Plus"
          @click="(state.formtype = 0), (state.openform = !state.openform), (Prepare())"
          type="success"
          plain
          circle
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Update a project" placement="bottom" effect="light">
        <el-button
          :icon="CirclePlus"
          @click="
            (state.formtype = 1), (state.openform = !state.openform), (Prepare())
          "
          type="success"
          plain
          circle
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Finally add youtube link" placement="bottom" effect="light">
        <el-button
          :icon="Upload"
          @click="
            (state.formtype = 2), (state.openform = !state.openform), (Prepare())
          "
          type="success"
          plain
          circle
        ></el-button>
      </el-tooltip>      
    </el-col>
  </el-row>
  <hr class="m-5" />
  <el-collapse-transition>
    <div v-if="state.openform">
      <!-- naslovi -->
      <el-row>
        <el-col v-if="state.formtype==0" :offset="6" :span="12" >
          <h4>Fill to create a new project</h4>
        </el-col>
        <el-col v-if="state.formtype==1" :offset="6" :span="12" >
          <h4>Fill to update a project</h4>
        </el-col>
        <el-col v-if="state.formtype==2" :offset="6" :span="12" >
          <h4>Add youtube link></h4>
        </el-col>        
      </el-row>
    
      <!-- uploaderi -->
      <el-row v-if="state.formtype<2">
        <el-col :offset="6" :span="4">
          <Uploader2
            @success="handleSuccessImage"
            @error="mynotifications.error('Error')"
            eluploadtip="File: *.jpg, *png,..."
            eluploadtext="Drop POSTER file here or click to select"
            urlpath="creator/uploadimage/"
          />
        </el-col>
        <el-col :span="4">
          <Uploader2
            @success="handleSuccessPdf"
            @error="mynotifications.error('Error')"
            eluploadtip="File: *.pdf"
            eluploadtext="Drop METADATA file here or click to select"
            urlpath="creator/uploadpdf/"
          />
        </el-col>        
        <el-col :span="4">
          <Uploader2
            @success="handleSuccessVideo"
            @error="mynotifications.error('Error')"
            eluploadtip="File: *.mkv, *mp4,..."
            eluploadtext="*Drop VIDEO file here or click to select"
            urlpath="creator/uploadvideo/"
          />
        </el-col>
      </el-row>

      <!-- kontrole za unos -->
      <el-row>
        <el-col :offset="6" :span="12">
          <el-form :model="state.form" label-width="150px">
            <div v-if="state.formtype<2">
              <el-form-item class="mt-1 mb-1" label="Uploaded image:" prop="imageFile">
                <el-input disabled v-model="state.form.imageFile" />
              </el-form-item>
              <el-form-item class="mb-1" label="Uploaded metadata:" prop="pdfFile">
                <el-input disabled v-model="state.form.pdfFile" />
              </el-form-item>              
              <el-form-item class="mb-5" label="*Uploaded video:" prop="fileName">
                <el-input disabled v-model="state.form.fileName" />
              </el-form-item>              
            </div>

            <el-form-item v-if="state.formtype>0" label="Projects:">
              <el-select
                v-model="state.form.selectedProjectName"
                placeholder="Select"
                style="width: 100%"
              >
                <el-option
                  v-for="item in state.base.videoclips4user"
                  :key="item.fileNameGuid"
                  :label="item.projectName"
                  :value="item.projectName"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Note" prop="abstract" v-if="state.formtype<2">
              <el-input v-model="state.form.message" type="textarea" />
            </el-form-item>
            <div class="common-layout" v-if="state.formtype==0">
              <el-form-item label="Key words:" prop="keyWords">
                <el-input required v-model="state.form.keyWords" />
              </el-form-item>
              <el-form-item label="Project name:" prop="projectName">
                <el-input required v-model="state.form.projectName" />
              </el-form-item>
              <el-form-item label="Abstract:" prop="abstract">
                <el-input v-model="state.form.abstract" type="textarea" />
              </el-form-item>
              <el-form-item label="Reviewers:" prop="reviewersprop">
                <el-select
                  v-model="state.form.reviewers"
                  multiple
                  placeholder="Select"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in state.base.reviewers"
                    :key="item.username"
                    :label="item.firstName + ' ' + item.lastName"
                    :value="item.username"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Fields:" prop="reviewersprop">
                <el-select
                  v-model="state.form.fields"
                  multiple
                  placeholder="Select fields"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in state.base.fields"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>              
            </div>

            <el-form-item label="Youtube link:" prop="ytUrl"  v-if="state.formtype==2">
                <el-input v-model="state.form.ytUrl" />
            </el-form-item>
          </el-form>
        </el-col>

        <!-- komande za snimanje i cancel -->
        <el-col :offset="8" :span="8">
          <el-tooltip
            content="Save data for uploaded video"
            placement="bottom"
            effect="light"
          >
            <el-button
              :icon="Check"
              @click="SaveDataForVideo"
              type="success"
              plain
              circle
            ></el-button>
          </el-tooltip>
          <el-tooltip content="Close" placement="bottom" effect="light">
            <el-button
              :icon="Close"
              @click="
                (state.formtype = 1),
                (state.openform = false),
                cancel()
              "
              type="success"
              plain
              circle
            ></el-button>
          </el-tooltip>
        </el-col>
      </el-row>

      <hr class="m-10"/>
    </div>
  </el-collapse-transition>

  <!-- naslov History -->
  <el-row>
    <el-col :offset="1" :span="22">
      <h4>History</h4>
    </el-col>
  </el-row>

  <!-- History table -->
  <el-row>
    <el-col :offset="1" :span="22">
      <!-- max-height="350" -->
      <el-table
        :data="state.base.videoclips4creator4history"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#bbbbbb' }"
        
      >
        <el-table-column label="States" width="300">
          <template #default="props">
              <div v-for="(item, index) in props.row.messagesR">
                <p >
                  [{{ index + 1 }}]-{{ props.row.statesR[index] }} :
                </p>
              </div>
          </template>
        </el-table-column>

        <el-table-column type="expand" label="Reviewers" width="100">
          <template #default="props">
            <div m="4">
              <div v-for="(item, index) in props.row.messagesR">
                <!-- <h3>{{new Date(props.row.datetime).toLocaleDateString('sr-SR')}} - Reviewer-{{ index + 1 }}:</h3> -->
                <h3>{{new Date(props.row.datetime).toLocaleDateString('sr-SR') +' ' + new Date(props.row.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}} 
                  - {{props.row.nameR}} </h3>

                <p
                  m="t-0 b-2"
                  v-if="props.row.statesR[index] == 'REJECTED'"
                  style="color: crimson"
                >
                  {{ item }}
                </p>
                <p
                  m="t-0 b-2"
                  v-else-if="props.row.statesR[index] == 'ACCEPTED'"
                  style="color: green"
                >
                  {{ item }}
                </p>
                <p m="t-0 b-2" v-else>{{ item }}</p>
              </div>
            </div>
          </template>
        </el-table-column>


        <el-table-column label="Project" width="300" prop="projectName" align="center" sortable />
        <el-table-column label="Version" width="100" prop="version" align="center" sortable />
        <el-table-column label="File" width="300" prop="fileName" align="center" sortable />
        <el-table-column label="Play" width="100" align="center">
          <template #default="scope">
            <el-tooltip content="Show video" placement="bottom" effect="light">
              <el-button
                :icon="VideoPlay"
                circle
                @click="handlePlay(scope.$index, scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="METADATA" width="150" align="center">
          <template #default="scope">
            <el-tooltip content="Show metadata" placement="bottom" effect="light">
              <el-button
                :icon="Document"
                circle
                @click="handlePdf(scope.$index, scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>        

        <el-table-column
          label="Date Time"
          width="200"
          prop="datetime"
          align="center"
          :formatter="datetimeformater"
          :sort-method="sortDateTime"
          sortable
        />
        <el-table-column label="User msg." prop="message" />
      </el-table>
    </el-col>
  </el-row>

  <el-dialog  v-model="state.videopanel.open" :title="modaltitle" :width="state.videopanel.width" destroy-on-close center >
     <PlayVideo v-bind="state.videopanel" ></PlayVideo>
  </el-dialog>

  <el-dialog  v-model='state.pdfpanel.open'  :title="state.pdfpanel.pdfFile" :width="state.pdfpanel.width" destroy-on-close center >
    <PdfViewer v-bind="state.pdfpanel" />
  </el-dialog>

</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

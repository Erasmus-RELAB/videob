<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import Axios from "axios";
import { ElMessage, ElNotification, ElTable } from "element-plus";
import saveAs from "file-saver";
import { VideoPlay, Check, Film, Close, Message, More, Warning, Document } from "@element-plus/icons-vue";
import TitleRefresh from "./TitleRefresh.vue";
import  PlayVideo  from "./PlayVideo.vue"
import  PdfViewer  from "./PdfViewer.vue"
import { inject } from "vue";
import configAxios from "../global.js";
const { GetLoggedUser } = inject("logged");

var state = reactive({
  username: "",

  modal: {
    open: false,
    fileName: "",
    fileNameGuid: "",
    version: -1,
    imageFileGuid: "",

    width: 850,
    videowidth: 800,
    path: "uploads",
  },
  pdfpanel: {
    open: false,
    pdfFile: "",
    pdfFileGuid: "",
    width: 1200,
    path: "uploads",
  },    
  reviewmodal: {
    open: false,
  },  
  reviewform: {
    projectName: "",
    username: "",
    rusername: "",
    version: "",
    message: "",
    state: "",
  },
  messagemodal: {
    open: false,
  },  
  messageform: {
    projectName: "",
    username: "",
    rusername: "",
    version: "",
    message: "",
  },  
  videoclip: {
    fileName: "",
    keyWords: "",
    projectName: "",
    abstract: "",
    username: "",
    creatorName: "",
  },

  base: {
    reviewers: [],
    videoclips4reviewer4review: [],
    videoclips4reviewer4history: [],
  },
  pagetitle: "Review",
  
});

function load4ReviewData(axios) {
  Axios.all([axios.get("projects4reviewer/review/" + state.username)])
    .then((response) => {
      state.base.videoclips4reviewer4review = response[0].data.videoclips;
    })
    .catch(function (error) {
      ElNotification.error("Failed to refresh data " + error);
    });
}
function loadHistoryData(axios) {
  Axios.all([axios.get("projects4reviewer/history/" + state.username)])
    .then((response) => {
      state.base.videoclips4reviewer4history = response[0].data.videoclips;
    })
    .catch(function (error) {
      ElNotification.error("Failed to refresh data " + error);
    });
}
function refresh() {
  debugger
  state.username = GetLoggedUser().username;
  let axios = Axios.create(configAxios);
  load4ReviewData(axios);
  loadHistoryData(axios);
}
onMounted(() => {
  refresh();
});

const modaltitle = computed(() => {
  return state.modal.fileName + "   ver." + state.modal.version;
});
const pathVideo = computed(() => {
  return state.modal.path + "/" + state.modal.fileNameGuid;
});
const pathPoster = computed(() => {
  return state.modal.path + "/" + state.modal.imageFileGuid;
});
const messagemodaltitle = computed(()=>{
  return "Message [" + new Date(state.messageform.datetime).toLocaleDateString("sr-SR") + "]";
});

function SaveMessage() {
  state.username = GetLoggedUser().username;
  let axios = Axios.create(configAxios);

  Axios.all([axios.post("reviewermessage", state.messageform)])
    .then((response) => {
      ElNotification.success("Message saved.");
      state.messagemodal.open = false;
    })
    .catch(function (error) {
      ElNotification.error("Failed to save the message. " + error);
    });
}


const handleMessage = (idx, r) => {
  state.messageform.rusername = state.username;
  state.messageform.username = r.username;
  state.messageform.projectName = r.projectName;
  state.messageform.version = r.version;
  state.messageform.datetime = r.datetime;
  state.messagemodal.open = true;

  //procitaj poruku i ubaci u ovaj messagemodal
  let axios = Axios.create(configAxios);
  Axios.all([axios.post("reviewerlastmessage", state.messageform)])
    .then((response) => {
      ElNotification.success("Successfully done");
      state.messageform.message = response[0].data.message;
    })
    .catch(function (error) {
      ElNotification.error("Failed to refresh data " + error);
    });
};
const handleReviewe = (idx, r ) => {
    state.reviewform.projectName = state.base.videoclips4reviewer4review[idx].projectName;
    state.reviewform.username = state.base.videoclips4reviewer4review[idx].username;
    state.reviewform.rusername = state.username;
    state.reviewform.version = state.base.videoclips4reviewer4review[idx].version;
    state.reviewform.message = "";
    state.reviewform.state = "";

    state.reviewmodal.open = !state.reviewmodal.open
};

const ReviewDone = (newstate : string) => {
  debugger;

  state.username = GetLoggedUser().username;
  let axios = Axios.create(configAxios);

  state.reviewform.state = newstate;

  Axios.all([axios.post("reviewdone", state.reviewform)])
    .then((response) => {
      ElNotification.success("Successfully done");
      refresh();
    })
    .catch(function (error) {
      ElNotification.error("Failed to refresh data " + error);
  });

  state.reviewmodal.open = false;

  refresh();
};

const handlePlay = (idx, r) => {
  //alert("idx="+idx)
  //alert("r="+r.fileNameGuid)
  state.modal.open = true;
  state.modal.fileNameGuid = r.fileNameGuid;
  state.modal.version = r.version;
  state.modal.fileName = r.fileName;
  state.modal.imageFileGuid = r.imageFileGuid;
};
const handlePdf = (idx : number, r : any) => {
  state.pdfpanel.open = true;
  state.pdfpanel.pdfName = r.pdfName;
  state.pdfpanel.pdfFileGuid = r.pdfFileGuid;
};
const tableCellStyleReview = ({ row, col, rowIndex, columnIndex }) => {
  let forecolor = "black";
  let backgroundcolor = "#cae4ff";
  if (rowIndex % 2) backgroundcolor = "#cfefff";

  return { background: backgroundcolor, color: forecolor };
};
const tableCellStyleHistory = ({ row, col, rowIndex, columnIndex }) => {
  let forecolor = "#222222";
  let backgroundcolor = "#eaeaea";

  return { background: backgroundcolor, color: forecolor };
};
const datetimeformater = (row, column, cellValue, index) => {
  const dt = new Date(cellValue);
  // const MM = dt.getMonth() + 1;
  // const dd = dt.getDate();
  // const yyyy = dt.getFullYear();
  // const hh = dt.getHours();
  // const mm = dt.getMinutes();

  // return yyyy + "-" + MM + "-" + dd + " " + hh + ":" + mm;
  return dt.toLocaleDateString('sr-SR');
};
const sortDateTime = (a: any, b: any)=>{
  debugger;
  const x = new Date(a.datetime);
  const y = new Date(b.datetime);
  if(x > y ) return 1;
  else if(x < y) return -1;
  else return 0;
}


</script>

<template>
  <TitleRefresh colwid="5" button="false" />
  <h4>For review</h4>
  <el-row>
    <el-col :offset="1" :span="22">
      <el-table
        :data="state.base.videoclips4reviewer4review"
        style="width: 100%"
        stripe
        :cell-style="tableCellStyleReview"
        :header-cell-style="{ background: '#9999bb' }"
      >
        <el-table-column label="Project" width="300" prop="projectName" align="center" sortable/>
        <el-table-column label="Creator" width="300" prop="creatorName" align="center" sortable/>
        <el-table-column label="Version" width="100" prop="version" align="center" sortable/>
        <el-table-column
          label="Date Time"
          width="200"
          prop="datetime"
          align="center"
          :formatter="datetimeformater"
          :sort-method="sortDateTime"
          sortable          
        />
        <el-table-column label="Play" width="100" align="center">
          <template #default="scope">
            <el-tooltip content="Show video" placement="bottom" effect="light">
              <el-button :icon="VideoPlay" circle @click="handlePlay(scope.$index, scope.row)"></el-button>
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

        <el-table-column label="Review" width="200" align="center">
          <template #default="scope">
            <el-tooltip content="Add review" placement="bottom" effect="light">
              <el-button
                :icon="More"
                circle
                @click="handleReviewe(scope.$index, scope.row)"
              ></el-button>
            </el-tooltip>            
          </template>
        </el-table-column>


        <el-table-column label="User msg." prop="message" />
      </el-table>
    </el-col>
  </el-row>

  <hr />
  <h4>History</h4>

  <!-- History table -->
  <el-row>
    <el-col :offset="1" :span="22">
      <el-table
        :data="state.base.videoclips4reviewer4history"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#bbbbbb' }"
      >
        <el-table-column label="Project" width="300" prop="projectName" align="center" sortable/>
        <el-table-column label="Creator" width="300" prop="creatorName" align="center" sortable/>
        <el-table-column label="Version" width="100" prop="version" align="center" sortable/>
        <el-table-column
          label="Date Time"
          width="200"
          prop="datetime"
          align="center"
          :formatter="datetimeformater"
          :sort-method="sortDateTime"
          sortable
        />
        <el-table-column label="Play" idth="100" align="center">
          <template #default="scope">
            <el-tooltip content="Play video" placement="bottom" effect="light">
              <el-button
                :icon="VideoPlay"
                circle
                @click="handlePlay(scope.$index, scope.row)"
              >
            </el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="METADATA" idth="150" align="center">
          <template #default="scope">
            <el-tooltip content="Show metadata" placement="bottom" effect="light">
              <el-button
                :icon="Document"
                circle
                @click="handlePdf(scope.$index, scope.row)"
              >
            </el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="Message" width="200" align="center">
          <template #default="scope">
            <el-tooltip content="See message" placement="bottom" effect="light">
              <el-button
                :icon="Message"
                circle
                @click="handleMessage(scope.$index, scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="User msg." prop="message" align="center" sortable/>
        <el-table-column label="State" width="100" prop="state" align="center" />
      </el-table>
    </el-col>
  </el-row>

  <el-dialog  v-model='state.modal.open'  :title="modaltitle" :width="state.modal.width" destroy-on-close center >
      <PlayVideo v-bind="state.modal" ></PlayVideo>
  </el-dialog>


  <!--Dialog za Review -->
  <el-dialog  v-model="state.reviewmodal.open" title="Review">
    <el-input :rows="5" type="textarea" v-model="state.reviewform.message" />

    <el-tooltip  content="Add revision"  placement="bottom"  effect="light"  >
      <el-button  :icon="Warning"  @click="ReviewDone('REVISION')"  type="info"  plain  circle ></el-button>
    </el-tooltip>

    <el-tooltip  content="Accept"  placement="bottom"  effect="light"  >
      <el-button  :icon="Check"  @click="ReviewDone('ACCEPTED')"  type="success"  plain  circle ></el-button>
    </el-tooltip>

    <el-tooltip  content="Reject"  placement="bottom" effect="light"  >
      <el-button  :icon="Close" @click="ReviewDone('REJECTED')"  type="danger"  plain  circle ></el-button>
    </el-tooltip>
  </el-dialog>

  <!--Dialog za Message -->
  <el-dialog  v-model="state.messagemodal.open" :title=messagemodaltitle >
    <el-input :rows="5" type="textarea" v-model="state.messageform.message" />
    <el-tooltip  content="Close"  placement="bottom" effect="light"  >
      <el-button  :icon="Close"  @click="state.messagemodal.open = false"  type="info"  plain  circle ></el-button>
   </el-tooltip>

  </el-dialog>

  <el-dialog  v-model='state.pdfpanel.open'  :title="state.pdfpanel.pdfFile" :width="state.pdfpanel.width" destroy-on-close center >
    <PdfViewer v-bind="state.pdfpanel" />
  </el-dialog>

</template>

<style scoped>
.modal {
  display: block !important;
}
th {
  border-bottom: solid 2px rgb(39, 52, 80) !important;
  color: rgb(39, 52, 80);
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
  background-color: yellow;
}
</style>

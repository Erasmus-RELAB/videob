<script setup lang="ts">
import Axios from "axios";
import configAxios from "../global.js";
import { ElMessage, ElNotification } from "element-plus";
import { Search, VideoPlay, Document } from "@element-plus/icons-vue";
import { reactive, onMounted, onUnmounted, computed } from "vue";
import { inject } from "vue";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import PlayVideo from "./PlayVideo.vue";
import PdfViewer from "./PdfViewer.vue";

const { GetLoggedUser, UpdateLoggedUser } = inject("logged") as any;

var interval4refresh: any;
var state: any = reactive({
  mainTitle: "APPROVED VIDEOS",
  videos4carousel: [],
  videos4seachresults: null,
  input4search: "",
  fields: [],
  fields4search: [],
  affiliations: [],
  affiliations4search: [],

  pdfpanelwidth: 1200,
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
  modalPdf: {
    open: false,
    pdfFile: "",
    pdfFileGuid: "",
    path: "uploads",
  },
  slide: {
    fileName: "",
    fileNameGuid: "",
    imageFileGuid: "",
  },
});

function addDays(date:any, days:any) {
  date.setDate(date.getDate() + days);
  return date;
}
function findApprovedVideoFiles() {
  let axios = Axios.create(configAxios);

  Axios.all([axios.get("videos4carousel")])
    .then((response) => {
      state.videos4carousel = response[0].data;

      if(state.videos4carousel.length>=20){
        if( addDays(new Date(), -7) > new Date(state.videos4carousel[0].datetime) ){
          state.mainTitle = "APPROVED VIDEOS - Randomly selected 20. Search for more.";
        }
        else{
          state.mainTitle = "APPROVED VIDEOS - Last 20. Search for more.";
        }
      }


      for (let ob of state.videos4carousel) {
        if (!ob.message || ob.message.length < 2) {
          if (ob.abstract && ob.abstract != "") ob.message = ob.abstract.substring(0, 50);
        }
      }
    })
    .catch(function (error) {
      UpdateLoggedUser(undefined);
      ElNotification.error("Failed to refresh data " + error);
    });
}
function loadFields() {
  let axios = Axios.create(configAxios);

  Axios.all([axios.get("allfields")])
    .then((response) => {
      state.fields = response[0].data.allfields;
    })
    .catch(function (error) {
      ElNotification.error("Failed to read data" + error);
    });
}
function loadAffiliations() {
  let axios = Axios.create(configAxios);

  Axios.all([axios.get("allaffiliations")])
    .then((response) => {
      debugger;
      state.affiliations = response[0].data.allaffiliations;
    })
    .catch(function (error) {
      ElNotification.error("Failed to read data" + error);
    });
}

function SearchVideo() {
  debugger;
  if (
    state.input4search.length == 0 &&
    state.affiliations4search.length == 0 &&
    state.fields4search.length == 0
  ) {
    state.videos4seachresults = null;
    ElMessage.info(
      "In order to perform a search, you need to enter at least some of the data"
    );
    return;
  }
  state.videos4seachresults = [];
  let axios = Axios.create(configAxios);
  Axios.all([
    //axios.get('search/'+state.input4search)
    axios.get("search", {
      params: {
        input4search: state.input4search,
        fields4search: state.fields4search,
        affiliations4search: state.affiliations4search,
      },
    }),
  ])
    .then((response) => {
      state.videos4seachresults = response[0].data;
      debugger;
    })
    .catch(function (error) {
      ElNotification.error("Failed to refresh data " + error);
    });
}

const tableCellStyle = ({ row, col, rowIndex, columnIndex }: any) => {
  let forecolor = "#222222";
  let backgroundcolor = "#eaeaea";
  return { background: backgroundcolor, color: forecolor };
};
const handlePlay = (idx: number, r: any) => {
  //alert("idx="+idx)
  state.modal.open = true;
  state.modal.fileNameGuid = r.fileNameGuid;
  state.modal.version = r.version;
  state.modal.fileName = r.fileName;
  state.modal.imageFileGuid = r.imageFileGuid;
};
const handlePdf = (idx: number, r: any) => {
  state.modalPdf.open = true;
  console.log(idx);
  state.modalPdf.pdfFile = r.pdfFile;
  state.modalPdf.pdfFileGuid = r.pdfFileGuid;
};

onMounted(() => {
  findApprovedVideoFiles();
  loadFields();
  loadAffiliations();
  //clearInterval(interval4refresh)
  //interval4refresh = setInterval(findApprovedVideoFiles, 5000);
});
onUnmounted(() => {
  //clearInterval(interval4refresh)
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
// const mainTitle = computed(() => {
//   if (state.videos4carousel && state.videos4carousel.length >= 20) {
//     return "APPROVED VIDEOS - Last 20. Search for more.";
//   } else return "APPROVED VIDEOS";
// });
</script>

<template>
  <el-row>
    <el-col :offset="2" :span="20">
      <h5>
        {{ state.mainTitle }}
      </h5>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <carousel :itemsToShow="2.2" :wrapAround="true" :transition="500">
        <slide v-for="video in state.videos4carousel" :key="video">
          <div id="sliderdiv1">
            <!-- <div>
              <h2 style="color: #2f5496">{{ video.projectName.toUpperCase() }}</h2>
            </div> -->
            <!-- <div>
                  Creator: <span>{{video.creatorName}}</span>
                </div>
                <div>
                  <span>{{video.affiliation}}</span>
                </div>                 -->
            <!-- <p>
              <el-link :href="video.ytUrl">YouTube video</el-link>
            </p>
            <div>
              <el-link style="margin: 0px" :href="'uploads/' + video.pdfFileGuid"
                >METADATA</el-link
              >
            </div> -->
          </div>

          <div class="carousel__item">
            <!-- <video :key="video" :width="state.videowidth" :poster="pathPoster"  controls> -->
            <video
              :key="video.fileNameGuid"
              :width="580"
              :poster="state.modal.path + '/' + video.imageFileGuid"
              controls
            >
              <source
                :src="state.modal.path + '/' + video.fileNameGuid"
                type="video/mp4"
              />
            </video>
            <div style="width:580px">
              <div style="padding:2em">
                <span>{{ video.abstract }}</span>
              </div>
            </div>
            <div>
              <div>
                <el-link :href="video.ytUrl">YouTube video</el-link>
                <el-link style="margin-left: 3em" :href="'uploads/' + video.pdfFileGuid" >METADATA</el-link >
              </div>
            </div>

          </div>
          <!-- <div id="sliderdiv2">
            <div>
              <span>{{ video.abstract }}</span>
            </div>
          </div> -->
        </slide>
        <template #addons>
          <navigation />
          <pagination />
        </template>
      </carousel>    

    </el-col>
  </el-row>

  <hr class="m-9" />

  <el-row justify="center">
    <h4>Search:</h4>
  </el-row>

  <el-row>
    <el-col :offset="8" :span="8">
      <el-form-item label="Affiliations:" prop="state.affiliations">
        <el-select
          v-model="state.affiliations4search"
          multiple
          placeholder="Select affiliations"
          style="width: 100%"
        >
          <el-option
            v-for="item in state.affiliations"
            :key="item.affiliation"
            :label="item.affiliation"
            :value="item.affiliation"
          />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>

  <el-row>
    <el-col :offset="8" :span="8">
      <el-form-item label="Fields:" prop="state.fields">
        <el-select
          v-model="state.fields4search"
          multiple
          placeholder="Select fields"
          style="width: 100%"
        >
          <el-option
            v-for="item in state.fields"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>

  <el-row>
    <el-col :offset="8" :span="8">
      <el-input
        v-model="state.input4search"
        placeholder="Please input search string"
        v-on:keyup.enter="SearchVideo"
      />
    </el-col>
    <el-col :span="8" align="left">
      <el-tooltip
        class="item"
        effect="dark"
        content="Find"
        placement="top"
        style="ml: left"
      >
        <el-button
          type="success"
          size="mini"
          circle
          plain
          @click="SearchVideo"
          :icon="Search"
          class="ml-1"
        ></el-button>
      </el-tooltip>
    </el-col>
  </el-row>

  <el-row mt-5 v-if="state.videos4seachresults">
    <el-col :offset="1" :span="22">
      Results [{{ state.videos4seachresults.length }}]:
    </el-col>
  </el-row>
  <el-row v-if="state.videos4seachresults && state.videos4seachresults.length > 0">
    <el-col :offset="1" :span="22">
      <el-table
        :data="state.videos4seachresults"
        style="width: 100%"
        stripe
        :cell-style="tableCellStyle"
        :header-cell-style="{ background: '#9999bb' }"
      >


        <el-table-column label="Project" prop="projectName">
          <template #default="scope" >
            <!-- <el-link :href="scope.row.imageFileGuid" @click="test">{{ scope.row.projectName }}</el-link> -->

            <!-- <el-button type='' text @mouseover="test" @click="test">{{ scope.row.projectName }}</el-button> -->
            <el-tooltip raw-content effect="light" placement="top-start" show-after="500">
            <template #content>
              <img :src="state.modal.path + '/' + scope.row.imageFileGuid" />
            </template>            
              <el-button type='' text >{{ scope.row.projectName }}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Project" prop="projectName" /> -->

        <!-- <el-table-column label="Creator" width="300" prop="creatorName" /> -->
        <el-table-column label="Affiliation" width="400" prop="affiliation" />

        <el-table-column label="YouTube" width="300" prop="ytUrl">
          <template #default="scope">
            <el-link :href="scope.row.ytUrl">{{ scope.row.ytUrl }}</el-link>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Version" width="100" prop="version" /> -->
        
        <el-table-column label="Play" width="100">
          <template #default="scope">
            <el-button
              :icon="VideoPlay"
              circle
              plain
              @click="handlePlay(scope.$index, scope.row)"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="METADATA"
          width="300"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <el-button
              :icon="Document"
              circle
              plain
              @click="handlePdf(scope.$index, scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>

  <el-dialog
    v-model="state.modalPdf.open"
    :title="state.modalPdf.pdfFile"
    :width="state.pdfpanelwidth"
    destroy-on-close
    center
  >
    <PdfViewer v-bind="state.modalPdf" />
  </el-dialog>

  <el-dialog
    v-model="state.modal.open"
    :title="modaltitle"
    :width="state.modal.width"
    destroy-on-close
    center
  >
    <PlayVideo v-bind="state.modal"></PlayVideo>
    <!-- <video :key="video" :width="state.videowidth" :poster="pathPoster"  controls>
          <source :src="pathVideo" type="video/mp4">
      </video> -->
  </el-dialog>
</template>

<style scoped>
.carousel__slide {
  padding: 5px;
}

.carousel__viewport {
  perspective: 2000px;
}

.carousel__track {
  transform-style: preserve-3d;
}

.carousel__slide--sliding {
  transition: 0.5s;
}

/* .carousel__slide {
  opacity: 0.9;
  transform: scale(0.9);
} */

/* .carousel__slide--active ~ .carousel__slide {
  transform: scale(0.6);
} */

.carousel__slide--prev {
  opacity: 0.5;
  transform: scale(0.6);
}

.carousel__slide--next {
  opacity: 0.5;
  transform: scale(0.6);
}

.carousel__slide--active {
  opacity: 1;
  transform: scale(1.3);
  padding: 0px;
  margin: 0px;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;  
}


/*#sliderdiv1 {
   display: flex;
  flex-direction: column;
  font-size: 0.8em;
  //border: 1px solid;
  height: 100%;
  width: 20%;
  padding: 0.5em;
  //text-align: left;
  text-align: center;
  justify-content: center;
}
#sliderdiv2 {
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
  font-style: italic;
  height: 100%;
  width: 20%;
  padding: 2em;
  //text-align: left;
  text-align: center;
  justify-content: center;
} */
</style>

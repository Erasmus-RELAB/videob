<template>
  <div class="container">
    <div>
      <h2>File Progress</h2>
      <hr />
      <label
        >File
        <input type="file" v-on:change="handleFileUpload($event)" />
      </label>
      <br />
      <progress max="100" :value.prop="uploadPercentage"></progress>
      <br />
      <button v-on:click="submitFile()">Submit</button>
    </div>
  </div>
</template>

<script>
import Axios from "axios";
import configAxios2 from "../../global_local.js";

export default {
  data() {
    return {
      file: "",
      uploadPercentage: 0,
    };
  },

  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },

    submitFile() {
      /*
					Initialize the form data
				*/
      let formData = new FormData();

     /*
		Add the form data we need to submit
	*/
      formData.append("file", this.file);

	/*
		Make the request to the POST /single-file URL
	*/
      Axios.create(configAxios2)
        .post("/configurator/upload_file/", null, {
          onUploadProgress: function (progressEvent) {
			alert(progressEvent.loaded)
            this.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }.bind(this),
        })
        .then(function () {
			alert(1);
          console.log("SUCCESS!!");
        })
        .catch(function () {
			alert(0);
          console.log("FAILURE!!");
        });
    },
  },
};
</script>

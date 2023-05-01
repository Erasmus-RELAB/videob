<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { usePDF, VuePDF } from "@tato30/vue-pdf";

onMounted(() => {
  const { pdf, pages, info } = usePDF("39.pdf")

  console.log(`Document has ${pages} pages`)
  console.log(`Document info: ${info}`)  
});

</script>

<template>
    <VuePDF :pdf="pdf" />
</template>

<style scoped>

</style>

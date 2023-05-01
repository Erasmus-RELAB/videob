<template>
    <el-table :data="tableData" style="width: 100%" :cell-style="tableCellStyle"  >
      <el-table-column prop="date" label="Date" width="180" />
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column prop="address" label="Address" />
    </el-table>
  </template>
  
  <script lang="ts" setup>
  const tableCellStyle = ({ row,  col,  rowIndex,  columnIndex }) => {
        let forecolor = "black";
        let backgroundcolor = "white";
    
        return{background:backgroundcolor, color:forecolor}
    }    
  const tableData = [
    {
      date: '2016-05-03',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
    },
    {
      date: '2016-05-02',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
    },
    {
      date: '2016-05-04',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
    },
    {
      date: '2016-05-01',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
    },
  ]
  </script>
<style scoped>
.modal {
        display: block !important;
    }
    th {
        border-bottom: solid 2px rgb(39, 52, 80)  !important;
        color:  rgb(39, 52, 80) ;
    } 
</style>

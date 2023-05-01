import { ElMessage, ElMessageBox, ElNotification, Action } from "element-plus";

export default{

  error: (msg="", obj:any = null)=>{
    let mymsg = "Error: ";
    mymsg += msg
    if(obj) mymsg += " " + obj?.toString();
  
    ElMessage({
      showClose: true,
      message: mymsg,
      grouping: true,
      type: "error",
    });  
  },

  success: (msg="", obj:any = null)=>{
    let mymsg = "OK: ";
    mymsg += msg
    if(obj) mymsg += " " + obj?.toString();
  
    ElMessage({
      showClose: true,
      message: mymsg,
      grouping: true,
      type: "success",
    });    
  },

  box: (message:string, title:string, type:any) =>{
      ElMessageBox.alert(message, title, {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: "OK",
      callback: (action: Action) => {
        ElMessage({
          type: type,
          message: `action: ${action}`,
        });
      },
    });
  }


}
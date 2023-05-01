import CryptoJS from 'crypto-js'
import VueEasySession from 'vue-easysession'
var options = {
    persist: true,
    keySession: 'videosrt',
    expireSessionCallback: function () {
        window.location.href = '/'
    }
}
var session = VueEasySession.getInstance(options);

export default{
    getAuthUser:()=>{
        let user=session.get("user");
        if(user!=null){
            user=CryptoJS.AES.decrypt(session.get("user"), "NEPOZNATI I DUGACKI TEKST").toString(CryptoJS.enc.Utf8);
            try{
                user=JSON.parse(user);
            }catch{}
            
        }
        return user;
    
    },
    setAuthUser:(user:string)=>{
        session.start(2*60*60*1000);//sesija je postavljena na dva sati
        session.set("user",CryptoJS.AES.encrypt(user, "NEPOZNATI I DUGACKI TEKST").toString());
        // sessionStorage.setItem("user",CryptoJS.AES.encrypt(user, "Secret Passphrase").toString());
    },
    logOutUser:()=>{
        // sessionStorage.removeItem("user");
        session.remove("user");
    },     
}
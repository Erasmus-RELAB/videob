//import userservice from './user.service.js';
import { Static } from 'vue';
import {URL} from '../package.json';

//ovo sada radi ali bi trebalo jos proveriti
//let token=(userservice.getAuthUser())?`Bearer ${userservice.getAuthUser().token}`:"";

export default {
    //timeout: 1000,
    baseURL: URL,
    headers: {  
        "Content-Type": "application/json"
        //"Authorization":token
    }
}

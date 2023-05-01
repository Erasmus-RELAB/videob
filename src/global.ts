import userservice from './userservice';
import {URL} from '../package.json';

let token=(userservice.getAuthUser())?`Bearer ${userservice.getAuthUser().token}`:"";

export default{
    //timeout: 1000,
    baseURL: URL,
    headers: {  
        "Content-Type": "application/json",
        "Authorization":token
    }
}

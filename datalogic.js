var fs = require('fs');
const path = require('path');
const { get } = require('http');

const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./db/db.db" //sa mesta gde je express.js
    },
    useNullAsDefault: true
});

function searchFiles(dir) {
    debugger
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        fs.stat(fullPath, (err, stat) => {
          if (stat && stat.isDirectory()) {
            searchFiles(fullPath);
          } else {
            console.log(`Found file: ${fullPath}`);
          }
        });
      });
    });
}
  
function getVideos(projectName, username) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .select('*')
        .where({
            username : username,
            projectName : projectName,
        })
    }catch{}
    return rez;
}
function getVideo(projectName, username, version) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .where({
            username : username,
            projectName : projectName,
            version : version
        }).first()   
    }catch{}
    return rez;
}

async function updateVideo(username, projectName, version, fileName, fileNameGuid) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .where({
            username:  username,
            projectName:  projectName,
            version: version
        })
        .update({
            username:  username,
            projectName:  projectName,
            version: version,
            fileName: fileName,
            fileNameGuid:  fileNameGuid,
            datetime : getCurrentDateTime()
        })
    }catch{}
    return rez;
}

function updateNewProject(oldusername, oldprojectname, projectName, keyWords, abstract, message, version) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .update({
            projectName:  projectName,
            keyWords:  keyWords,
            abstract:  abstract,
            message: message,
            version : version,
            datetime : getCurrentDateTime()
        })
        .where({
            username : oldusername,
            projectName : oldprojectname,
        });    
    }catch{}
    return rez;
}
function updateOldProject(oldusername, oldprojectname, message, version) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .update({
            message: message,
            version : version,
            datetime : getCurrentDateTime()
        })
        .where({
            username : oldusername,
            projectName : oldprojectname,
        });    
    }catch{}
    return rez;
}
function getVideoClips4user(username) {
    let rez = {};
    try{
        rez = knex('VideoClip')
        .where({
            'username' : username,
        }).whereNotNull('fileName')
    }catch{}
    return rez;
}
async function getVideoClips4user4MaxVersion(username){
    const videoclips4user = await getVideoClips4user(username);
    const allProjectName4user = [...new Set(videoclips4user.map(item => item.projectName))];
    let found = [];

    for(let i=0; i<allProjectName4user.length; i++){
        let projectName = allProjectName4user[i];
        let allvideos4user4proj = videoclips4user.filter((vc)=>vc.projectName == projectName);    
        let maxversion = Math.max(...allvideos4user4proj.map(o => o.version));

        const video1 = await getVideo(projectName, username, maxversion);
        found.push(video1);
    };
  
    return found;
}
async function getVideoClip4user4project4MaxVersion(username,projectName){
    const videoclips4user = await knex("VideoClip").where({
        'username' : username,
        'projectName' : projectName
    }).whereNotNull('fileName')

    let video1 = undefined;
    try{
        if(videoclips4user){
            let maxversion = Math.max(...videoclips4user.map(o => o.version));
        
            if(isFinite(maxversion)){
                video1 = await getVideo(projectName, username, maxversion);
            }    
        }
    }catch{}

    return video1;
}

// const subquery = knex.select('id').from('accounts');

// knex.select('name').from('users')
//   .whereIn('account_id', subquery)

// knex.select('name').from('users')
//   .whereIn(
//     ['account_id', 'email'], 
//     [
//       [3, 'test3@example.com'], 
//       [4, 'test4@example.com']
//     ]
//   )

async function getVideoClips4review(rusername){
    let found = [];
    try{
        const subqueryR = knex('Review')
        .where({ 'rusername': rusername })
        .whereNotIn('state', ['ACCEPTED','REJECTED'])
        .select('projectName', 'username');

        // sve poruke za odredjenog rev.
        const subqueryM = knex('MessageR').where({ 'rusername': rusername })
        .whereIn(
            ['projectName', 'username'],
            subqueryR
        )
        .select('projectName', 'username', 'version');
          
        let allVideoClipsBezPoruke;
        try{
            allVideoClipsBezPoruke = await knex('VideoClip')
            .whereIn(
                ['projectName', 'username'],
                subqueryR
            )
            .whereNotIn(
                ['projectName', 'username', 'version'],
                subqueryM
            );
        }catch(error){
            console.log(error)
        }

        for(let i=0; i<allVideoClipsBezPoruke.length; i++){
            allVideoClipsBezPoruke[i].creatorName = await getCreatorName(allVideoClipsBezPoruke[i].username);
        }

        return allVideoClipsBezPoruke;
    }
    catch{
    }

    return found;
}

async function getCreatorName(username){
    const userC = await knex("UserCreator").where({username:username}).first();
    return userC.firstName + " " + userC.lastName;
}
async function getCreator(username){
    const userC = await knex("UserCreator").where({username:username}).first();
    return userC;
}
async function getVideoClips4review4MaxVersion(rusername){
    let found = [];
    try{
        let reviews = await getReviews(rusername, "ForReview");
        // prva petlja ide po username 
        for(let p=0; p<reviews.length; p++){
            let vc = await getVideoClip4user4project4MaxVersion(reviews[p].username, reviews[p].projectName)

            //const userC = await knex("UserCreator").where({username:vc.username}).first();
            //vc.creatorName = userC.firstName + " " + userC.lastName;
            vc.creatorName = await getCreatorName(vc.username);
            if(vc) found.push(vc);
        }
    }
    catch{
    }

    return found;
}
async function getVideoClips4revierHistory(rusername ){
    let found = [];
    let toexclude = await getVideoClips4review(rusername);
    let allReviews =  await knex('Review')
    .where({
        'rusername': rusername,
    })
    .whereNot({
        'state':'SUBMITTED'
    })

    try{
        for(let i=0; i<allReviews.length; i++){
            let sveverzije = await knex('VideoClip').where({
                username: allReviews[i].username,
                projectName: allReviews[i].projectName
            });

            for(let j=0; j<sveverzije.length; j++){
                let idx = toexclude.findIndex((excvc)=>excvc.username==sveverzije[j].username && excvc.projectName == sveverzije[j].projectName && excvc.version==sveverzije[j].version)
                if(idx>=0) continue;

                let messageR = await knex("MessageR").where({
                    username:sveverzije[j].username,
                    version:sveverzije[j].version,
                    projectName:sveverzije[j].projectName,
                    rusername:rusername
                }).first();

                let review = await knex("Review").where({
                    username:sveverzije[j].username,
                    projectName:sveverzije[j].projectName,
                    rusername:rusername
                }).first();

                sveverzije[j].creatorName = await getCreatorName(sveverzije[j].username);
                sveverzije[j].messageR = messageR?.message;
                sveverzije[j].state = messageR?.state;

                found.push(sveverzije[j]);
            }
        }
    }
    catch{
    }

    return found;
}
async function getVideoClips4creatorHistory(username){
    let found = [];

    try{
        const vcs = await knex("VideoClip").where({ username : username }).whereNotNull('fileName')
        for(let i=0; i<vcs.length; i++){
            let tekuci = vcs[i];

            let svipregledaci = await knex("Review").where({ username : username, projectName : tekuci.projectName }).select('rusername')

            tekuci.statesR =[];
            tekuci.messagesR =[];
            tekuci.nameR=[];
            let msgR = await knex("MessageR").where({
                username : tekuci.username,
                projectName : tekuci.projectName,
                version : tekuci.version,
            })

            for(let j=0; j<msgR.length; j++){
                tekuci.messagesR.push( msgR[j].message);
                tekuci.statesR.push( msgR[j].state);

                debugger;
                let ur = await knex("UserReviewer").where({username : msgR[j].rusername}).first();
                if(ur)tekuci.nameR = ur.firstName + " " +ur.lastName;


                //iz liste svi pregledaci izbacujemo onog koji je upravo dodat
                //je je neki reviewer odobrio u prethodnoj verziji.
                let index = svipregledaci.findIndex( 
                    pregledac => {   return pregledac.rusername == msgR[j].rusername;   }
                );
                if (index !== -1) {
                    svipregledaci.splice(index, 1);
                }
            }
            //region dodavanje poruke i stanja za one koji jos nisu dali poruke i stanja
            for(let j=0; j<svipregledaci.length; j++){
                // ako je pregledac vec ocenio rad to je za njega poslednja poruka
                let vecodobren;
                let ur;
                try{
                    debugger;
                    ur = await knex("UserReviewer").where({username : svipregledaci[j].rusername}).first();

                    vecodobren = await knex("MessageR").where({
                        username : tekuci.username,
                        projectName : tekuci.projectName,
                        rusername : svipregledaci[j].rusername,
                    }).whereIn('state',["ACCEPTED","REJECTED"]);
                }catch(error){
                    console.log(error)
                }
                if(vecodobren.length == 0){
                    tekuci.messagesR.push(".");
                    tekuci.statesR.push("PENDING");
                    if(ur)tekuci.nameR.push(ur.firstName + " " + ur.lastName);
                }else{
                    tekuci.messagesR.push(vecodobren[0].message);
                    tekuci.statesR.push(vecodobren[0].state);
                    if(ur)tekuci.nameR.push(ur.firstName + " " + ur.lastName);
                }
            }
            //endregion

            found.push(tekuci)
        }
        
    }catch(error){

    }

    return found;
}
async function getMaxVersion(username, projectName){
    let max = -1;
    try{
        const vc = await getVideos(projectName, username);

        const vv = vc.map(object => {
            return object.version;
        });
        max = Math.max(...vv);
    }catch{}
    return max;
}

function getReviews(rusername, type=""){
    let reviews = {};
    try{
        reviews = knex('Review')
        .where({'rusername': rusername});
        
        if(type=="ForHistory"){
            reviews = reviews
            .where({'state':'ACCEPTED'})
            .orWhere({'state':'REJECTED'})
            .orWhere({'state':'REVISION'})
        }
        if(type=="ForReview"){
            reviews = reviews
            .where({'state':'SUBMITTED'})
           
        }
    }
    catch{
    }
    return reviews;
}

function getReview(username, projectName, rusername){
    let review = {};
    try{
        review = knex('Review')
        .where('projectName', projectName)
        .where('username', username)
        .where('rusername', rusername)
        .first();
    }
    catch{
    }
    return review;
}
function addReview(projectName, username, rusername) {
    let rez = {};
    try{
        rez = knex('Review').insert({
            projectName:  projectName,
            username:  username,
            rusername:  rusername,
            datetime : getCurrentDateTime()
        })
    }catch{}
    return rez;
}

function getAllUserCreator() {
    return knex("UserCreator").select("*");
}
function getUserCreator(username, password){
    let user = {};
    user = knex('UserCreator')
        .where('username', username)
        .where('password', password)
        .first();

    return user;
}

function getAllFields() {
    return knex("Field").select("*");
}

function getAllAffiliations() {
    return knex("UserCreator").whereNotNull('affiliation').distinct('affiliation');
}


function getAllUserReviewer() {
    return knex("UserReviewer").select("*");
}

function getUserRewiever(username, password){
    let user = {};
    user = knex('UserReviewer')
        .where('username', username)
        .where('password', password)
        .first();

    return user;
}

function getUser(username, password, type){
    let user= {};
    if(type == "REVIEWER")
        user = getUserRewiever(username, password);
    else if(type == "CREATOR")
        user = getUserCreator(username, password);

    return user;
}

module.exports = {
    knex,
    getReview,
    addReview,
    updateVideo,
    updateNewProject,
    updateOldProject,
    getVideoClips4user,
    getVideoClips4user4MaxVersion,
    getVideoClips4review,
    getVideoClips4review4MaxVersion,
    getVideoClips4revierHistory,
    getVideoClips4creatorHistory,
    getVideos,
    getVideo,
    getAllUserCreator,
    getAllFields,
    getAllAffiliations,
    getAllUserReviewer,
    getUserCreator,
    getUserRewiever,
    getUser,

    isProjectExist,
    checkReviewExistBeforeAddNew,
    prepareFolders,

    readDirectory,
    approvedprojects,
    isProjectApproved,
    isProjectRejected,
    isLastVersionReviewed
}


async function isProjectExist(username, projectName){
    const clip = await getVideos(projectName, username);
    return clip.length > 0
}

async function checkReviewExistBeforeAddNew(username, projectName, rusername){
    const review = await getReview(username, projectName, rusername);
    if(review)
        return "Exist review, project: " + projectName + " user: " + username + " reviewer: " + rusername;
    else
        return "";
}
function prepareFolders(username){
    let rez = true;
    try{
        var dir = './uploads/private/' + username;
        if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        if(!fs.existsSync(dir))
            return "Folder for " + username + " not created."
        }
        dir = './uploads/public/' + username;
        if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        if(!fs.existsSync(dir))
            return "Folder for " + username + " not created."

        }
        
        return "";
    }
    catch{
        return res.status(500).json({ rez });
    }
}

// async function readDirectory(dir) {
//     let rez = [];
//     const files = await fs.promises.readdir(dir);
//     for (const file of files) {
//         const filePath = path.join(dir, file);
//         const stat = await fs.promises.stat(filePath);
//         if (stat.isDirectory()) {
//           await readDirectory(filePath);
//         } else {
//           console.log(filePath);
//           rez.push(filePath);
//         }
//       }

//     return rez;
//   }
function readDirectory(dir,rez) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        readDirectory(filePath,rez);
      } else {
        console.log(filePath);
        rez.push(filePath);
      }
    });
}


async function approvedprojects(maxcnt){
    let result =[];

    let projectUserAPPROVED =[];
    
    let projectUser = await knex('Review').groupBy('projectName', 'username').select('projectName', 'username');
    for(let i=0; i<projectUser.length; i++){
            let brojNeodobrenih = await knex('Review').where({
            projectName : projectUser[i].projectName, 
            username : projectUser[i].username
        })
        .whereNot({state:'ACCEPTED'}).count("username as cnt")

        if(brojNeodobrenih[0].cnt == 0){
            projectUserAPPROVED.push({username:projectUser[i].username, projectName:projectUser[i].projectName})
        }
    }
    
    for(let i=0; i<projectUserAPPROVED.length; i++){
        const maxv = ( await knex('VideoClip').where({
            projectName : projectUserAPPROVED[i].projectName, 
            username :  projectUserAPPROVED[i].username
        }).max('version as maxver') )[0].maxver;

        let found = await knex('VideoClip').where({
            projectName : projectUserAPPROVED[i].projectName, 
            username : projectUserAPPROVED[i].username,
            version : maxv        
        }).first()

        if(found){
            let cr = await getCreator(found.username);
            found.creatorName = cr.firstName + " " + cr.lastName;
            found.affiliation = cr.affiliation;
            result.push(found);
        }

        if(result.length >= maxcnt)break;
    }
    
    return result;
}

async function isProjectApproved(username, projectName){

    let notAccepted = await knex('Review').where({
        projectName:projectName, 
        username:username
    })
    .whereNot({state:'ACCEPTED'});


    if(notAccepted.length == 0){
        return true;
    }
    else{
        return false;
    }
}

async function isProjectRejected(username, projectName){

    let notAccepted = await knex('Review').where({
        projectName:projectName, 
        username:username
    })
    .where({state:'REJECTED'});

    if(notAccepted.length > 0){
        return true;
    }
    else{
        return false;
    }
}

async function isLastVersionReviewed(username, projectName){

    let maxversion = ( await knex('VideoClip').where({
        projectName : projectName, 
        username : username
    }).max('version as maxver') )[0].maxver;
    
    let brojOcekivanihOdgovora = ( await knex('Review').where({
        projectName : projectName, 
        username : username,
    }).count('rusername as cnt') )[0].cnt;

    let brojOdgovora = ( await knex('MessageR').where({
        projectName : projectName, 
        username : username,
        version : maxversion
    }).count('rusername as cnt') )[0].cnt;

    if(brojOdgovora < brojOcekivanihOdgovora)
        return false;
    else
        return true;
}


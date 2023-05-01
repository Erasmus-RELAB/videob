const express = require("express");
const app = express();
const multer = require("multer");
const datalogic = require("./datalogic.js");
const uniqueFilename = require("unique-filename");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const path = require('path');

var fsextra = require("fs-extra");
var session = {
  username : "",
  projectName : "",
  fileName : "",
  fileNameGuid : "",
};

let uploadPath = "./uploads"
let port = 3333;
if (process.argv.length > 2 && process.argv[2]) {
  port = process.argv[2];
}
if (process.argv.length > 3 && process.argv[3]) {
  uploadPath = process.argv[3];
}

//const cors = require("cors");
var cors = require('cors');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: '*'
}));
//app.use(cors({origin: 'http://localhost:3030'}));
//app.use(cors());
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84prott676",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, //2 hour
    resave: false,
  })
);

app.use(cookieParser());
//serving public file
//app.use(express.static(__dirname));


//region From Reviewer
app.get("/projects4reviewer/review/:username", async (req, res) => {
  console.log("projects4reviewer " + req.params.username);
  const videoclips = await datalogic.getVideoClips4review(
    req.params.username
  );
  if (!videoclips) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (videoclips.length == 0) {
    return res.status(200).json({ message: "Not found project." });
  } else {
    return res.status(200).json({ videoclips });
  }
});

app.get("/projects4reviewer/history/:username", async (req, res) => {
  console.log("projects4reviewer " + req.params.username);
  const videoclips = await datalogic.getVideoClips4revierHistory( req.params.username );

  if (!videoclips) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (videoclips.length == 0) {
    return res.status(200).json({ message: "Not found project." });
  } else {
    return res.status(200).json({ videoclips });
  }
});

app.post("/reviewdone",async (req, res, next) => {

  console.log("username " + req.body.username); 
  const rev = await datalogic.knex("Review").where({
    username : req.body.username,
    projectName : req.body.projectName,
    rusername: req.body.rusername
  }).update({
    state :  req.body.state,
    datetime : getCurrentDateTime()
  }).catch(console.error);
  ;

  const rev2 = await datalogic.knex("MessageR")
  .insert({
    username : req.body.username,
    projectName : req.body.projectName,
    rusername: req.body.rusername,
    version: req.body.version,
    datetime : getCurrentDateTime(),
    state : req.body.state,
    message : req.body.message
  }).catch(console.error);;

  if (rev && rev2) {
    return res.status(200).json({ rev });
  } else {
    return res.status(400).json({ message: "Not done review." });
  }  
})

app.post("/reviewermessage", async (req, res, next)=>{
  try{
      // sta ako poruka postoji onda update
      let br = await datalogic.knex("messageR").where({
        rusername:req.body.rusername,
        username:req.body.username,
        projectName:req.body.projectName,
        version:req.body.version,
      }).count("username as cnt");
      if(br[0].cnt == 0){
        //insert
        let result = await datalogic.knex("messageR").insert({
          rusername:req.body.rusername,
          username:req.body.username,
          projectName:req.body.projectName,
          version:req.body.version,
          message:req.body.message,
          datetime: getCurrentDateTime()
        });

        return res.status(200).json(result); 
      } else {
        //update
        let result =  await datalogic.knex("messageR")
          .where({
            rusername:req.body.rusername,
            username:req.body.username,
            projectName:req.body.projectName,
            version:req.body.version,
          })
          .update({
          message : req.body.message,
          datetime : getCurrentDateTime()
        }).catch(console.error);;
        return res.status(200).json(result); 
      }
  }catch(error){
    return res.status(500).json({ message: error });
  }
})
app.post("/reviewerlastmessage", async (req, res, next)=>{
  try{
      let message = await datalogic.knex("messageR").where({
        rusername:req.body.rusername,
        username:req.body.username,
        projectName:req.body.projectName,
        version:req.body.version,
      }).first().select('message');
      return res.status(200).json(message); 
  }catch(error){
    return res.status(500).json({ message: error });
  }

})
//endregion

//region Home
function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

app.get("/videos4carousel", async (req, res) => {
  try{
    let result = await datalogic.approvedprojects();
    if(result.length > 20){
      result.sort((x,y)=>{
        let dateX = x.datetime ? new Date(x.datetime) : new Date('1980-1-1');
        let dateY = y.datetime ? new Date(y.datetime) : new Date('1980-1-1');
        return dateY-dateX
      });
      
      console.log("sortiranje uradjeno");
      console.log("addDays(new Date(), -5)  " + addDays(new Date(), -5));
      console.log("result[0].datetime  " + result[0].datetime);
      console.log("new Date(result[0].datetime)  " + new Date(result[0].datetime));
      console.log("addDays(new Date(), -5) > result[0].datetime " + (addDays(new Date(), -5) > new Date(result[0].datetime)))
      if( addDays(new Date(), -7) > new Date(result[0].datetime) ){
        result = shuffle(result);
      }

      result = result.slice(0,20);
    }

    return res
      .status(200)
      .json(result);  
  }catch(error){
    return res
      .status(500)
      .json({ message: error });
  }  
});

//app.get("/search/:searchstr", async (req, res) => {
  app.get("/search", async (req, res) => {
  try{
     console.log('/search');
     //console.log('req.query ' + JSON.stringify(req.query));
    function isSimilarWords(element, index, array){
      for(let k=0; k<words.length; k++){
        let el = "" + element.toLowerCase();
        if(el.startsWith( words[k].toLowerCase() ))
          return true;
      }
    }
    function isContainPart(rowData, queryData){
      console.log('rowData: ' + rowData);
      console.log('queryData: ' + queryData);
      if(!rowData || !queryData){
        return true;
      }
      let setRowData = new Set(rowData);
      let setQueryData = new Set(queryData);
      console.log('setRowData.size ' + setRowData.size);
      console.log('setQueryData.size ' + setQueryData.size);
      let intersection = new Set([...setRowData].filter(x => setQueryData.has(x)));
      console.log('intersection.size ' + intersection.size);
      console.log('intersection && intersection.size > 0 ' + (intersection && (intersection.size > 0) ) );
      return intersection && (intersection.size > 0)
    }

    //const search = req.params.searchstr;

    let affiliations = req.query.affiliations4search;
    let fields = req.query.fields4search;
    let words = req.query.input4search.split(/[;,\s]/);
    
    let result = [];
    let appproj = await datalogic.approvedprojects();

    // filtiranje po oblastima
    appproj = appproj.filter(x=>
      !x.field 
      || isContainPart(x.field.split(','), fields)
    )
    // filtriranje po afilijaciji
    appproj = appproj.filter(x=>
      !x.affiliation 
      || isContainPart([x.affiliation], affiliations)
    )
    
    
    // pretraga po svim ostalim stringovima
    for(let i=0; i<appproj.length; i++){
      let nizstr = appproj[i].projectName.split(" ");
      nizstr.push(...appproj[i].abstract.split(" "));
      nizstr.push(...appproj[i].keyWords.split(/[;,\s]/));
      nizstr.push(...appproj[i].creatorName.split(" "));
      try{
        //console.log(words);
        if(nizstr.some(isSimilarWords))
          result.push(appproj[i]);
      }catch(ex){
        console.log(ex)
      }
    }

    console.log("-----result----");
    console.log(result);

    return res
      .status(200)
      .json(result);  
  }catch(error){
    return res
      .status(500)
      .json({ message: error });
  }
});
//endregion

//region Login/Logout
app.post("/checklogin", async (req, res, next) => {
  console.log("username " + req.body.username);
  const user = await datalogic.getUser(
    req.body.username,
    req.body.password,
    req.body.type,
  );
  if (user) {
    user.type = req.body.type;
    user.sessionid = req.session.id;
    session = req.session;
    session.username = req.body.username;
    return res.status(200).json({ user });
  } else {
    return res.status(400).json({ message: "Not exist user." });
  }
});
// app.post("/checksession", async (req,res,next) => {
//   const clientSessionId = req.body.sessionid;
//   if (req.session.id == clientSessionId) {
//       res.status(204).json({ samesession:true });
//   } else {
//       res.status(401).json({ samesession:false });
//   }
// });

app.post("/logout", async (req, res, next) => {
  req.session.destroy();
  res.redirect("/Home");
});
//endregion

//region From Creator
app.get("/allreviewers", async (req, res) => {
  const allreviewers = await datalogic.getAllUserReviewer();
  if (!allreviewers) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (allreviewers.length == 0) {
    return res.status(400).json({ message: "Not found reviewers." });
  } else {
    return res.status(200).json({ allreviewers });
  }
});
app.get("/allfields", async (req, res) => {
  console.log("allfields")
  const allfields = await datalogic.getAllFields();
  if (!allfields) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (allfields.length == 0) {
    return res.status(400).json({ message: "Not found allfields." });
  } else {
    return res.status(200).json({ allfields });
  }
});
app.get("/allaffiliations", async (req, res) => {
  console.log("allaffiliations")
  const allaffiliations = await datalogic.getAllAffiliations();
  //console.log(JSON.stringify(allaffiliations))

  if (!allaffiliations) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (allaffiliations.length == 0) {
    return res.status(400).json({ message: "Not found allaffiliations." });
  } else {
    return res.status(200).json({ allaffiliations });
  }
});
app.get("/projects4user/:username", async (req, res) => {
  console.log("projects4user " + req.params.username);
  const videoclips = await datalogic.getVideoClips4user4MaxVersion( req.params.username );
  if (!videoclips) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (videoclips.length == 0) {
    return res.status(200).json({ message: "Not found project." });
  } else {
    return res.status(200).json({ videoclips });
  }
});

define_randomProjectName = ()=>{
  let randomProjectName = uniqueFilename(uploadPath);
  randomProjectName= path.parse(randomProjectName).base;
  session.randomProjectName = randomProjectName;
}
app.get("/creator/prepareproject", async (req, res, next) => {
  console.log("prepareproject")
  if(!session){
    return res
      .status(500)
      .json({ message: "Session broken."});
  }
  try{
    define_randomProjectName();
    return res
      .status(200)
      .json({ message: "OK" });    
  }catch{
    return res
    .status(500)
    .json({ message: "Problem preparing new video." });
  }
});
app.post("/creator/updatenewproject", async (req, res, next) => {
  console.log("creator/updatenewproject");
  const isexist = await datalogic.isProjectExist( req.body.username, req.body.projectName );
  if (isexist) {
    console.log("Pokusaj dodavanja novog projekta sa istim imenom!!")
    return res.status(550).json({ message: "Pokusaj dodavanja novog projekta sa istim imenom" });
  }
  // provere za Review
  for (let i = 0; i < req.body.reviewers?.length; i++) {
    let rusername = req.body.reviewers[i];
    errormessage = await datalogic.checkReviewExistBeforeAddNew(
      req.body.username,
      req.body.projectName,
      rusername
    );
    if (errormessage) return res.status(400).json({ message: errormessage });
  }

  //console.log('req.body.fields ' + req.body.fields);
  //console.log(req.body.fields.join(','));

  //azuriranje onog koji je dodat kao novi i kopiranje poslednjeg sa novom verzijom
  rez = await datalogic.knex("VideoClip")
  .where({
     projectName: session.projectName,
     username: session.username,
     version: 0,      
  })
  .update({
         projectName: req.body.projectName, //menja se ime projekta
         keyWords:  req.body.keyWords,
         abstract:  req.body.abstract,
         message: req.body.message,
         field: req.body.fields,
         datetime : getCurrentDateTime()
    }).catch(console.error);

    if (rez) {
      for (let i = 0; i < req.body.reviewers.length; i++) {
        let rusername = req.body.reviewers[i];

        let rez2 = await datalogic.addReview(
          req.body.projectName,
          req.body.username,
          rusername
        );
        if (!rez2) {
          return res
            .status(500)
            .json({ message: "Problem in datalogic.addReview." });
        }
      }

    return res
      .status(200)
      .json({ message: "The creator has successfully added a new video." });

    } 
    else {
      return res
        .status(500)
        .json({ message: "Problem in datalogic.addVideo." });
    }

});
app.post("/creator/updateproject", async (req, res, next) => {
  if(!session){
    return res
      .status(500)
      .json({ message: "Session broken."});
  }
  errormessage = await ! datalogic.isProjectExist(
    session.username,
    req.body.selectedProjectName
  );
  if (errormessage) return res.status(400).json({ message: errormessage });
  if(!req.body.selectedProjectName)return res.status(400).json({ message: "Project must be selected." });

  const isfinishedrevied = await datalogic.isLastVersionReviewed(req.body.username, req.body.selectedProjectName);
  if(!isfinishedrevied) return res.status(550).json({ message: "The last version has not been reviewed yet. You cannot add a new version before that." });
  
  let version = ( await datalogic.knex('VideoClip').where({
    projectName : req.body.selectedProjectName, 
    username : req.body.username
  }).max('version as maxver') )[0].maxver;

  try {
    let lastVideo = await datalogic.getVideo( req.body.selectedProjectName,  req.body.username,  version );

    //proveri da li vec ima sva stanja reviewed
    const isapproved = await datalogic.isProjectApproved(req.body.username, req.body.selectedProjectName);
    const isrejected = await datalogic.isProjectRejected(req.body.username, req.body.selectedProjectName);
    if(isapproved)
    {
      console.log("pokusaj izmene projekta koji je odobren ili vec odbijen")
      return res
        .status(550)
        .json({ message: "The project has been APPROVED yet."});
    }else if(isrejected)
    {
      return res
        .status(550)
        .json({ message: "The project has been REJECTED yet."});
    }

    version++;
    //azuriranje onog koji je dodat kao novi i kopiranje poslednjeg sa novom verzijom
    rez = await datalogic.knex("VideoClip")
    .where({
      projectName: session.projectName,
      username: session.username,
      version: 0,      
    })
    .update({
          projectName: lastVideo.projectName,
          username: lastVideo.username,
          version: version,
          fileName: lastVideo.filename,
          keyWords: lastVideo.keyWords,
          abstract: lastVideo.abstract,
          fileNameGuid: lastVideo.fileNameGuid,
          message: req.body.message,
          imageFile: lastVideo.imageFile,
          imageFileGuid: lastVideo.imageFileGuid,
          pdfFile: lastVideo.pdfFile,
          pdfFileGuid: lastVideo.pdfFileGuid,
          datetime : getCurrentDateTime()
        })
        .catch(console.error);

    if (!rez) {
      return res
        .status(500)
        .json({ message: "Problem in datalogic.addVideo." });
    }
    return res
      .status(200)
      .json({ message: "Successfully update project." });
  } 
  catch(error) {
    return res
      .status(500)
      .json({ message: "Exception in block for adding new record."  + error});
  }
});
app.post("/creator/updateprojectyturl", async (req, res, next) => {
  console.log("update url " + req.body.ytUrl);
  if(!session){
    return res
      .status(500)
      .json({ message: "Session broken."});
  }
  errormessage = await ! datalogic.isProjectExist(
    session.username,
    req.body.selectedProjectName
  );
  if (errormessage) return res.status(400).json({ message: errormessage });
  if(!req.body.selectedProjectName)return res.status(400).json({ message: "Project must be selected." });

  const isfinishedrevied = await datalogic.isLastVersionReviewed(req.body.username, req.body.selectedProjectName);
  if(!isfinishedrevied) return res.status(550).json({ message: "The last version has not been reviewed yet. You cannot add a new version before that." });
  
  let version = ( await datalogic.knex('VideoClip').where({
    projectName : req.body.selectedProjectName, 
    username : req.body.username
  }).max('version as maxver') )[0].maxver;

  try {
    let lastVideo = await datalogic.getVideo( req.body.selectedProjectName,  req.body.username,  version );

    //proveri da li vec ima sva stanja reviewed
    const isapproved = await datalogic.isProjectApproved(req.body.username, req.body.selectedProjectName);
    const isrejected = await datalogic.isProjectRejected(req.body.username, req.body.selectedProjectName);
    if(!isapproved)
    {
      console.log("pokusaj dodavanja linka za projekat koji nje odobren")
      return res
        .status(550)
        .json({ message: "The project has NOT APPROVED yet."});
    }else if(isrejected)
    {
      return res
        .status(550)
        .json({ message: "The project has been REJECTED yet."});
    }

    //azuriranje onog koji je dodat kao novi i kopiranje poslednjeg sa novom verzijom
    rez = await datalogic.knex("VideoClip")
    .where({
      projectName: lastVideo.projectName,
      username: lastVideo.username,
      version: lastVideo.version,      
    })
    .update({
          ytUrl: req.body.ytUrl,
    })
    .catch(console.error);

    if (!rez) {
      return res
        .status(500)
        .json({ message: "Problem in update." });
    }
    return res
      .status(200)
      .json({ message: "Successfully update project." });
  } 
  catch(error) {
    return res
      .status(500)
      .json({ message: "Exception in block for adding new record."  + error});
  }
});



app.get("/projects4creator/history/:username", async (req, res) => {
  console.log("projects4creator/history " + req.params.username);
  const videoclips = await datalogic.getVideoClips4creatorHistory( req.params.username );
  console.log("videoclips.length " + videoclips.length);

  if (!videoclips) {
    return res.status(400).json({ message: "Not exist db connection." });
  } else if (videoclips.length == 0) {
    return res.status(200).json({ message: "Not found project." });
  } else {
    return res.status(200).json({ videoclips });
  }
});
//endregion

//region  Uploader
const storagevideo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: async function (req, file, cb) {
    if(! session.randomProjectName ) define_randomProjectName();
    session.projectName = session.randomProjectName;
    session.fileName = file.originalname;
    session.fileNameGuid = session.projectName + "." + getFileExtension(file.originalname);

    cb(null, session.fileNameGuid);
    try{
      if(session?.username){
        let vc = await datalogic.knex("VideoClip").where({
          username : session.username, 
          projectName : session.projectName,
          version : 0
        });
  
        if(vc.length==0){
          await datalogic.knex("VideoClip").insert({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            fileName : session.fileName,
            fileNameGuid : session.fileNameGuid,
          });
        }else{
          await datalogic.knex("VideoClip")
          .where({
            username:session.username, 
            projectName: session.projectName,
            version : 0
          })
          .update({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            fileName : session.fileName,
            fileNameGuid : session.fileNameGuid,
          });
        }
      }
    }
    catch(error){
      console.log("session.username" + session.username + "error " + error)
    }

  },
});
const storageimage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: async function (req, file, cb) {
    if(! session.randomProjectName ) define_randomProjectName();
    session.projectName = session.randomProjectName;
    session.imageFile = file.originalname;
    session.imageFileGuid = session.projectName + "." + getFileExtension(file.originalname);

    cb(null, session.imageFileGuid);
    try{
      if(session?.username){
        let vc = await datalogic.knex("VideoClip").where({
          username : session.username, 
          projectName : session.projectName,
          version : 0
        });
  
        if(vc.length==0){
          await datalogic.knex("VideoClip").insert({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            imageFile : session.imageFile,
            imageFileGuid : session.imageFileGuid,
          });
        }else{
          await datalogic.knex("VideoClip")
          .where({
            username:session.username, 
            projectName: session.projectName,
            version : 0
          })
          .update({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            imageFile : session.imageFile,
            imageFileGuid : session.imageFileGuid,
          });
        }
      }
    }catch(error){
      console.log(error)
    }
  },
});
const storagepdf = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: async function (req, file, cb) {
    if(!session.randomProjectName ) define_randomProjectName();
    session.projectName = session.randomProjectName;
    session.pdfFile = file.originalname;
    session.pdfFileGuid = session.projectName + "." + getFileExtension(file.originalname);
    

    cb(null, session.pdfFileGuid);
    try{
      if(session?.username){
        let vc = await datalogic.knex("VideoClip").where({
          username : session.username, 
          projectName : session.projectName,
          version : 0
        });
  
        if(vc.length==0){
          await datalogic.knex("VideoClip").insert({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            pdfFile : session.pdfFile,
            pdfFileGuid : session.pdfFileGuid,
          });
        }else{
          await datalogic.knex("VideoClip")
          .where({
            username:session.username, 
            projectName: session.projectName,
            version : 0
          })
          .update({
            username : session.username, 
            projectName : session.projectName,
            version : 0,
            pdfFile : session.pdfFile,
            pdfFileGuid : session.pdfFileGuid,
          });
        }
      }
    }catch(error){
      console.log(error)
    }
  },
});
function getFileExtension(fileName) {
  return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
}
var uploadvideo = multer({
  storage: storagevideo,
  // limits: {
  //   fileSize: 10000000 //bytes
  // },
  fileFilter(req, file, cb) {
    // We are providing a regular expression
    // which accepts only jpg,jpeg and png
    if (!file.originalname.match(/\.(mkv|mp4|avi)$/)) {
      return cb(new Error("Upload an video"));
    }
    cb(undefined, true);
  },
});
var uploadimage = multer({
  storage: storageimage,
  // limits: {
  //   fileSize: 10000000 //bytes
  // },
  fileFilter(req, file, cb) {
    // We are providing a regular expression
    // which accepts only jpg,jpeg and png
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
      return cb(new Error("Upload an image"));
    }
    cb(undefined, true);
  },
});
var uploadpdf = multer({
  storage: storagepdf,
  // limits: {
  //   fileSize: 10000000 //bytes
  // },
  fileFilter(req, file, cb) {
    // We are providing a regular expression
    // which accepts only jpg,jpeg and png
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error("Upload an pdf"));
    }
    cb(undefined, true);
  },
});

app.post("/creator/uploadvideo", uploadvideo.single("file"), (req, res, next) => {
  res.set("content-type", "application/json");
  res.status(200).end();
});

app.post("/creator/uploadimage", uploadimage.single("file"), (req, res, next) => {
  res.set("content-type", "application/json");
  res.status(200).end();
});

app.post("/creator/uploadpdf", uploadpdf.single("file"), (req, res, next) => {
  res.set("content-type", "application/json");
  res.status(200).end();
});

// #endregion


// x = new Date() // lokalno vreme je x
// y = x.toUTCString() //snima se y
// z = new Date(y) // cita se y a kokristi se z
getCurrentDateTime = () => {
  var date = new Date();
  return date.toUTCString();
}


app.listen(port, () => {
  console.log('current folder:' + process.cwd());
  console.log('uploadPath:' + uploadPath);
  console.log(`App listening at http://localhost:${port}`);
});

var express = require("express");
var router = express.Router();
var ObjectId = require("mongodb").ObjectID;
var User = require("../model/user");
var LearningMap = require("../model/learningMap");
var Resource = require("../model/resource");
var LearningPathways = require("../model/learningPathways");
var progress = require('../model/progress');
var ResourceGroup = require('../model/resourcegroup');
var Authenticator = require("../middleware/authenticator");

router.get("/teacher/:id", Authenticator.ensureAuthenticated, async (req, res) => {
  var pathwayId = req.params.id;
  var pathways= await LearningPathways.getLearningPathwaysByPathwayId(pathwayId);
  var rsrIds=pathways.map(item => item.resourceId);
  var grpIds=pathways.map(item => item.groupId);
  var rsrList = {};
  //console.log("OMKAR AND AKSHAT");
  for(let i=0;i<grpIds.length;i++)
  {
    rsrList[i] = await Resource.getResourceByResourceId(rsrIds[i]);  //Because using Resource.getResourceListByResourceId(rsrIds) wasn't giving rsrList in proper order
  }
  res.render("NAteacher",{
      layout: "layoutDiscussions",
      user: req.user,
      username: req.user.username,
      r_id: req.params.id,
      resourceList : rsrList, 
      resourceIds : rsrIds,
      groupIds : grpIds,
      dtype: "path"
    });
});

router.get("/:id", Authenticator.ensureAuthenticated, async (req, res) => {
  var pathwayId = req.params.id;
  var pathways= await LearningPathways.getLearningPathwaysByPathwayId(pathwayId);
  var rsrIds=pathways.map(item => item.resourceId);
  var grpIds=pathways.map(item => item.groupId);
  var rsrList = {};
  //console.log("OMKAR AND AKSHAT");
  for(let i=0;i<grpIds.length;i++)
  {
    rsrList[i] = await Resource.getResourceByResourceId(rsrIds[i]);  //Because using Resource.getResourceListByResourceId(rsrIds) wasn't giving rsrList in proper order
  }

  progress.collection.findOne({ 'user_id' : req.user.id, 'pathway_id' : req.params.id}, function(err,progress) {
    if(err) throw err;
    console.log(progress);
    res.render("narrativeArc", {
      layout: "layoutNarrativeArc",
      user: req.user,
      username: req.user.username,
      id : req.params.id,
      resourceList : rsrList, 
      resourceIds : rsrIds,
      groupIds : grpIds,
      Conversation_ID: req.user.id, 
      progress : progress
    });
});
  
  
});

  router.post("/setUserProgress",  Authenticator.ensureAuthenticated, async (req, res) => { 
    //console.log(req.body.user_progress)
    //console.log(req.body.data)
    //console.log(req.body)
    console.log("OMKAR AND AKSHAT");
    var GotProgress = req.body;
    console.log(GotProgress.user_id);
    
    progress.findOne({ 'user_id' : ObjectId(GotProgress.user_id), 'pathway_id' : GotProgress.pathway_id}, function(err,Prog) {

    if(Prog) {
      console.log('here');
      progress.collection.updateOne(
      { _id : ObjectId(Prog._id)},
      {
        $set : 
        {
          'user_id' : GotProgress.user_id,
          'pathway_id' : GotProgress.pathway_id,
          'collection_id' : GotProgress.collection_id,
          'resource_ids' : GotProgress.resource_ids,
          'current_gp_id' : GotProgress.current_gp_id,
          'current_resource_id' : GotProgress.current_resource_id,
          'quizzes' : GotProgress.quizzes
        }
      },
      async( err,res) => {
        if(err) throw err;
          console.log('progress has been updated');
    });
    }

    else {

    var UserProgress = new progress({
    //  var UserProgress = {
      user_id : GotProgress.user_id,
      pathway_id: GotProgress.pathway_id,
      collection_id: GotProgress.collection_id,
      resource_ids: GotProgress.resource_ids,
      current_gp_id: GotProgress.current_gp_id,
      current_resource_id: GotProgress.current_resource_id,
      quizzes: GotProgress.quizzes

    });

    console.log(GotProgress);
    
    //console.log(GotProgress.Coversation_id);
    
    progress.collection.insertOne(UserProgress, async (err, res) => {
      if (err) throw err;
      
      console.log("1 document inserted");
    
      //req.flash('success_msg', 'You are now registered and can login');
      //res.redirect('login');
      console.log(res);
      await User.findByIdAndUpdate(GotProgress.user_id, {"$addToSet" : { "progress": res.insertedId }});
    });
    
    //var user_id = req.user.id;
    console.log(UserProgress.id);
    //console.log(user.id);
    
    // User.collection.updateOne(
    //   { _id : ObjectId(GotProgress.user_id)},
    //   {
    //     $set : {"progress" : UserProgress.id}
    //   },
    //   function( err,res) {
    //     if(err) throw err;
    //       console.log('user has been updated with the progress');
    // });
    }
    
    //console.log(user.progress);

    });
    res.send({data: 1});
  });


module.exports = router;

const {dbCollections}=require("../config/db")
const {userCollection}=dbCollections || {};
const webpush=require("web-push");

// subscribe for notification
const subscribe=async (req,res)=>{
  try{
    const {sub}=req.body || {};
    const {email}=req.user || {};
    console.log(sub,email);
    const result=await userCollection.updateOne({email: email},{$set: {subscription: sub}});
    res.send(result);
  }catch(err){
    console.error("Notification: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}


const sendNotification=async(req,res)=>{
  try{
    const user=await userCollection.findOne({email: "test@gmail.com"});
    // webpush.generateVAPIDKeys(
    //   "mailto:support@mezbashop.com",
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    console.log(user);
    
    const payload={
      title: "Test notification",
      body: "Helllllo"
    }
    webpush.sendNotification(user.subscription, JSON.stringify(payload));
    res.send("Notification sent")
  }catch(err){
    console.error("Notification: ", err);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}

module.exports={subscribe,sendNotification}
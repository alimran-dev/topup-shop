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


const sendNotification = async (req, res) => {
  try {
    const user = await userCollection.findOne({email: "test@gmail.com"});
    
    if (!user || !user.subscription) {
      return res.status(404).send({ success: false, error: "User or subscription not found" });
    }

    const payload = {
      title: "Test notification",
      body: "Hello from MezbaShop"
    };

    await webpush.sendNotification(
      user.subscription, 
      JSON.stringify(payload)
    );
    
    res.send({ success: true, message: "Notification sent" });
  } catch (err) {
    console.error("Notification error: ", err);
    res.status(500).send({ success: false, error: err.message });
  }
}

module.exports={subscribe,sendNotification}
const { dbCollections } = require("../config/db");
const {
  deviceIdCollections,
  bkashTrxCollection,
  nagadTrxCollection,
  paymentMethodSummaryCollection,
} = dbCollections;

const balanceCalculate = async (provider, category, amount, balance) => {
  try {
    const summary = await paymentMethodSummaryCollection.findOne({
      doc: "summary",
    });
    const { bkashAgentBalance,bkashMerchantBalance, bkashPersonalBalance, nagadPersonalBalance, nagadAgentBalance } = summary || {};

    let updatedDoc = {};
    let isVerified = true;

    if(provider === "bkash" && category === "personal"){
      const diff = Math.abs(bkashPersonalBalance + amount - balance);
      if(diff>1){
        isVerified = false;
      }else {
        updatedDoc = {
          bkashPersonalBalance: balance,
        }
      }
    }else if(provider === "bkash" && category === "merchant"){
      const diff = Math.abs(bkashMerchantBalance + amount - balance);
      if(diff>1){
        isVerified = false;
      }else {
        updatedDoc = {
          bkashMerchantBalance: balance,
        }
      }
    }else if(provider === "bkash" && category === "agent"){
      const diff = Math.abs(bkashAgentBalance + amount - balance);
      if(diff>Math.abs(amount)*0.005){
        isVerified = false;
      }else {
        updatedDoc = {
          bkashAgentBalance: balance,
        }
      }
    }else if(provider === "nagad" && category === "agent"){
      const diff = Math.abs(nagadAgentBalance + amount - balance);
      if(diff>1){
        isVerified = false;
      }else {
        updatedDoc = {
          nagadAgentBalance: balance,
        }
      }
    }else if(provider === "nagad" && category === "personal"){
      const diff = Math.abs(nagadPersonalBalance + amount - balance);
      if(diff>1){
        isVerified = false;
      }else {
        updatedDoc = {
          nagadPersonalBalance: balance,
        }
      }
    }
    await paymentMethodSummaryCollection.updateOne({ doc: "summary" }, {$set: updatedDoc});
    return isVerified; // Valid sms sent
  } catch (err) {
    console.error("Error: ", err.message);
    return false; // Error occurred, treat as invalid sms
  }
};

const smsSender = async (req, res) => {
  try {
    const { from, message, deviceID } = req.body;
    const deviceCount = await deviceIdCollections.countDocuments({
      deviceID,
    });
    if (deviceCount <= 0) {
      return res.send({ message: "not valid device" });
    }
    const newTrx = {
      provider: "",
      category: "",
      amount: 0,
      trxID: "",
      isVerified: true,
      time: new Date(),
    };
    let result = {};
    let adjustOk = true;

    let willInsert = false;

    if (from === "bKash"){
      newTrx.provider = "bkash";

      // bkash agent
      if(message.includes("Cash Out") && message.includes("from") && message.includes("successful")){
        // agent cash out from user
        const msgSplit = message.split(" ");
        newTrx.category = "agent";
        newTrx.amount = parseFloat(msgSplit[3].replace(/,/,""));
        newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/,""));
        willInsert = true;
        newTrx.isVerified = await balanceCalculate("bkash", "agent", newTrx.amount, balance);

      } else if(message.includes("Cash In") && message.includes("to") && message.includes("successful")){
        // agent cash in to user
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash", "agent",amount*-1, balance);
      } else if(message.includes("B2B Transfer") && message.includes("to") && message.includes("successful")){
        // B2B transfer to user
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash", "agent", amount*-1, balance);
      }else if(message.includes("received") && message.includes("Commission")){
        // agent commission receive
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[4].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash", "agent", amount, balance);
      }

      // bkash personal
      if(message.includes("Cash In") && message.includes("from") && message.includes("successful")){
        // personal cash in from user
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        willInsert = true;
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.category = "personal";
        newTrx.isVerified = await balanceCalculate("bkash", "personal", amount, balance);
      }else if(message.includes("Cash Out") && message.includes("to") && message.includes("successful")){
        // personal cash out to agent
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash", "personal", amount*-1, balance);
      }else if(message.includes("Send Money") && message.includes("to") && message.includes("successful")){
        // send money to user
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash", "personal", amount*-1, balance);
      }else if(message.includes("Payment") && message.includes("to") && message.includes("successful")){
        // make payment from personal
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        await balanceCalculate("bkash","personal", amount*-1, balance);
      }


      // bkash merchant
      if(message.includes("received payment") && message.includes("from")){
        // receive payment from personal
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[5].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        willInsert = true;
        newTrx.category = "merchant";
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.isVerified = await balanceCalculate("bkash", "merchant", amount, balance);
      }else if(message.includes("received") && message.includes("from")){
        // recieve payment from merchant
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[4].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TrxID")+1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance")+2].replace(/,/,""));
        willInsert = true;
        newTrx.category = "merchant";
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.isVerified = await balanceCalculate("bkash", "merchant", amount, balance);
      }
    } else if(from === "NAGAD"){
      newTrx.provider = "nagad";

      // nagad agent
      if(message.includes("Cash Out Received")){
        // agent cash out receive
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const comm = parseFloat(msgSplit[msgSplit.indexOf("Comm:")+2].replace(/,/,""));
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+2].replace(/,/,""));
        willInsert = true;
        newTrx.category = "agent";
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.isVerified = await balanceCalculate("nagad", "agent", amount+comm, balance);
      }else if(message.includes("Cash In Successful")){
        // agent cash in to user
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const comm = parseFloat(msgSplit[msgSplit.indexOf("Comm:")+2].replace(/,/,""));
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+2].replace(/,/,""));
        await balanceCalculate("nagad", "agent", (amount*-1)+comm, balance);
      }else if(message.includes("B2B Received.")){
        // agent b2b receive
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+2].replace(/,/,""));
        await balanceCalculate("nagad", "agent", amount, balance);
      }else if(message.includes("B2B Transfer Successful")){
        // agent b2b transfer to other
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+2].replace(/,/,""));
        await balanceCalculate("nagad", "agent", amount*-1, balance);
      }


      // nagad personal
      if(message.includes("Money Received")){
        // personal receive money
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+2].replace(/,/,""));
        willInsert = true;
        newTrx.category = "personal";
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.isVerified = await balanceCalculate("nagad", "personal", amount, balance);
      }else if(message.includes("Cash In Received")){
        // personal cash in from user
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(msgSplit[msgSplit.indexOf("Amount:")+2].replace(/,/,""));
        const trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(msgSplit[msgSplit.indexOf("Balance:")+1].replace(/,/,""));
        
        willInsert = true;
        newTrx.category = "personal";
        newTrx.amount = amount;
        newTrx.trxID = trxID;
        newTrx.isVerified = await balanceCalculate("nagad", "personal", amount, balance);
      }
    }
    // console.log(newTrx);
    if (willInsert && newTrx.provider === "bkash" && newTrx.category.length > 0) {
      result = await bkashTrxCollection.insertOne(newTrx);
    } else if (willInsert && newTrx.provider === "nagad" && newTrx.category.length > 0) {
      result = await nagadTrxCollection.insertOne(newTrx);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { smsSender };

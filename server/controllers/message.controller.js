const { dbCollections } = require("../config/db");
const {
  deviceIdCollections,
  bkashTrxCollection,
  nagadTrxCollection,
  paymentMethodSummaryCollection,
} = dbCollections;

const balanceCalculate = async (provider, amount, balance) => {
  try {
    const summary = await paymentMethodSummaryCollection.findOne({
      doc: "summary",
    });
    const { bkashBalance, nagadBalance } = summary || {};

    const update = { $inc: {} };
    if (provider === "bkash") {
      update.$inc = { bkashBalance: amount };
      const diff = Math.abs(bkashBalance + amount - balance);
      if (diff > 1) {
        return false; // Fake sms sent
      }
    } else if (provider === "nagad") {
      update.$inc = { nagadBalance: amount };
      const diff = Math.abs(nagadBalance + amount - balance);
      if (diff > 1) {
        return false; // Fake sms sent
      }
    } else {
      throw new Error("Invalid provider");
    }
    await paymentMethodSummaryCollection.updateOne({ doc: "summary" }, update);
    return true; // Valid sms sent
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
    if (from === "bKash") {
      newTrx.provider = "bkash";
      // positive cases
      // agent user cash out
      if (
        message.includes("Cash Out") &&
        message.includes("from") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        newTrx.category = "agent";
        newTrx.amount = parseFloat(msgSplit[3].replace(/,/, ""));
        newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate(newTrx.provider, newTrx.amount, balance);
        // agent b2b receive and receive send money personal
      } else if (
        message.includes("received") &&
        message.includes("from") &&
        !message.includes("Cashback") &&
        !message.includes("Commission")
      ) {
        const msgSplit = message.split(" ");
        newTrx.category = "personal";
        newTrx.amount = parseFloat(msgSplit[4].replace(/,/, ""));
        newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate("bkash", newTrx.amount, balance);
        // personal cash in
      } else if (
        message.includes("Cash In") &&
        message.includes("from") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        newTrx.category = "personal";
        newTrx.amount = parseFloat(msgSplit[3].replace(/,/, ""));
        newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        adjustOk = balanceCalculate("bkash", newTrx.amount, balance);
        // agent cashback
      } else if (message.includes("received Cashback")) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(
          msgSplit[msgSplit.indexOf("Cashback") + 2].replace(/,/, "")
        );
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate("bkash", amount, balance);
        // agent commission
      } else if (
        message.includes("received") &&
        message.includes("Commission")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[4].replace(/,/, ""));
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate("bkash", amount, balance);
      }

      // negative balance cases
      // agent cash in
      if (
        message.includes("Cash In") &&
        message.includes("to") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/, ""));
        const fee = parseFloat(
          msgSplit[msgSplit.indexOf("Fee") + 2].replace(/,/, "")
        );
        const total = (amount + fee) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate("bkash", total, balance);
        // agent b2b send
      } else if (
        message.includes("B2B Transfer") &&
        message.includes("to") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/, ""));
        const fee = parseFloat(
          msgSplit[msgSplit.indexOf("Fee") + 2].replace(/,/, "")
        );
        const total = (amount + fee) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        // balanceCalculate("bkash", total, balance);
        // personal cash out
      } else if (
        message.includes("Cash Out") &&
        message.includes("to") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/, ""));
        const fee = parseFloat(
          msgSplit[msgSplit.indexOf("Fee") + 2].replace(/,/, "")
        );
        const total = (amount + fee) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        balanceCalculate("bkash", total, balance);
        // personal send money
      } else if (
        message.includes("Send Money") &&
        message.includes("to") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[3].replace(/,/, ""));
        const fee = parseFloat(
          msgSplit[msgSplit.indexOf("Fee") + 2].replace(/,/, "")
        );
        const total = (amount + fee) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        balanceCalculate("bkash", total, balance);
        // personal make payment
      } else if (
        message.includes("Payment") &&
        message.includes("to") &&
        message.includes("successful")
      ) {
        const msgSplit = message.split(" ");
        const amount = parseFloat(msgSplit[2].replace(/,/, ""));
        const fee = parseFloat(
          msgSplit[msgSplit.indexOf("Fee") + 2].replace(/,/, "")
        );
        const total = (amount + fee) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance") + 2].replace(/,/, "")
        );
        balanceCalculate("bkash", total, balance);
      }
    } else if (from === "NAGAD") {
      newTrx.provider = "nagad";
      // positive cases
      // agent cash out
      if (message.includes("Cash Out Received")) {
        const msgSplit = message.split(/ |\n/);
        newTrx.category = "agent";
        newTrx.amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const comm = parseFloat(
          msgSplit[msgSplit.indexOf("Comm:") + 2].replace(/,/, "")
        );
        const total = newTrx.amount + comm;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        adjustOk = balanceCalculate("nagad", total, balance);
        // personal receive money
      } else if (message.includes("Money Received.")) {
        const msgSplit = message.split(/ |\n/);
        newTrx.category = "personal";
        newTrx.amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        adjustOk = balanceCalculate("nagad", newTrx.amount, balance);
        // personal cash in receive
      } else if (message.includes("Cash In Received.")) {
        const msgSplit = message.split(/ |\n/);
        newTrx.category = "personal";
        newTrx.amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amt:Tk") + 1].replace(/,/, "")
        );
        newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 1].replace(/,/, "")
        );
        adjustOk = balanceCalculate("nagad", newTrx.amount, balance);
        // agent b2b receive
      } else if (message.includes("B2B Received")) {
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        balanceCalculate("nagad", amount, balance);
      }

      // negative cases
      // agent cash in
      if (message.includes("Cash In Successful")) {
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        const comm = parseFloat(
          msgSplit[msgSplit.indexOf("Comm:") + 2].replace(/,/, "")
        );
        const total = (amount - comm) * -1;
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        balanceCalculate("nagad", total, balance);
        // agent b2b sent
      } else if (message.includes("B2B Transfer Successful")) {
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        balanceCalculate("nagad", amount, balance);
        // personal mobile recharge
      } else if (message.includes("Mobile Recharge Request Received")) {
        const msgSplit = message.split(/ |\n/);
        const amount = parseFloat(
          msgSplit[msgSplit.indexOf("Amount:") + 2].replace(/,/, "")
        );
        const balance = parseFloat(
          msgSplit[msgSplit.indexOf("Balance:") + 2].replace(/,/, "")
        );
        balanceCalculate("nagad", amount, balance);
      }
    }
    // console.log(newTrx);
    if (adjustOk && newTrx.provider === "bkash" && newTrx.category.length > 0) {
      result = await bkashTrxCollection.insertOne(newTrx);
    } else if (adjustOk && newTrx.provider === "nagad" && newTrx.category.length > 0) {
      result = await nagadTrxCollection.insertOne(newTrx);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { smsSender };

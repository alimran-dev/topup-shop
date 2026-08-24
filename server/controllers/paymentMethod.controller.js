const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { axiosBkash } = require("../utils/axiosBkash");
const {
  NORMAL_ROLE,
  getAudience,
  isMethodAvailable,
  getReceivedAmount,
} = require("../utils/paymentMethod");
const paymentMethodCollection = dbCollections.paymentMethodCollection;
const paymentMethodSummaryCollection =
  dbCollections.paymentMethodSummaryCollection;
const { transactionCollection, userCollection, subscriptionTypeCollection } =
  dbCollections || {};
require("dotenv").config();

// allowedRoles entries: "normal" and/or existing subscription-type ids.
// Returns { ok: true, roles: null } for blank (everyone), { ok: true,
// roles: [...] } for a valid list, { ok: false } otherwise.
const validateRoles = async (roles) => {
  if (!Array.isArray(roles) || !roles.length) return { ok: true, roles: null };
  const list = [...new Set(roles)];
  if (list.some((r) => typeof r !== "string" || !r.trim())) return { ok: false };
  const typeIds = [];
  for (const r of list) {
    if (r === NORMAL_ROLE) continue;
    if (!ObjectId.isValid(r)) return { ok: false };
    typeIds.push(new ObjectId(r));
  }
  if (!typeIds.length) return { ok: true, roles: list };
  const typeDocs = await subscriptionTypeCollection
    .find({ _id: { $in: typeIds } })
    .project({ _id: 1 })
    .toArray();
  const found = new Set(typeDocs.map((t) => t._id.toString()));
  if (!typeIds.every((id) => found.has(id.toString()))) return { ok: false };
  return { ok: true, roles: list };
};

// Daily-hours field: 0-23 integer, or blank (""/null/undefined) = unbounded.
const validateHour = (h) =>
  h === "" || h == null || (Number.isInteger(Number(h)) && Number(h) >= 0 && Number(h) <= 23);

const getMethods = async (req, res) => {
  try {
    const { role } = req.user;
    const {amount, from} = req.query || {};
    const amountValue = parseFloat(amount);
    let filter = {};
    if (role === "user") {
      filter = { status: "active"};
      if(amountValue){
        filter.minLimit = {$lte: amountValue};
        filter.maxLimit = {$gte: amountValue};
      }
      if(from==="direct"){
        filter.isDirect = true;
      }else{
        filter.isDirect = false;
      }
    }
    const result = await paymentMethodCollection
      .find(filter)
      .project({ lastTime: 0, expires_in: 0, id_token: 0, refresh_token: 0 })
      .toArray();

    // Completed transactions for these methods — one query, JS sums for
    // today's total (admin cards) and received-since-reset (limit counter).
    const methodIds = result.map((method) => method._id.toString());
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const txns = methodIds.length
      ? await transactionCollection
          .find({ methodID: { $in: methodIds }, status: "completed" })
          .project({ methodID: 1, amount: 1, time: 1 })
          .toArray()
      : [];

    const enriched = result.map((method) => {
      const idStr = method._id.toString();
      const resetAt = method.receivedResetAt
        ? new Date(method.receivedResetAt).getTime()
        : null;
      let totalAmount = 0;
      let received = 0;
      for (const t of txns) {
        if (t.methodID !== idStr) continue;
        const tTime = new Date(t.time).getTime();
        if (tTime >= startOfDay) totalAmount += t.amount;
        if (!resetAt || tTime >= resetAt) received += t.amount;
      }
      return {
        ...method,
        totalAmount,
        received,
        limitHit:
          method.receivingLimit != null && received >= method.receivingLimit,
      };
    });

    if (role === "user") {
      // Customer view: hide methods the viewer cannot use right now —
      // role gating (allowedRoles vs active tiers), daily-hours window,
      // and auto-inactive by receiving limit. All computed, never written.
      const audience = await getAudience(req.user?.email);
      res.send(
        enriched.filter((m) => isMethodAvailable(m, audience, m.received))
      );
    } else {
      // Admin view: everything, with limit state attached for the UI.
      res.send(enriched);
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getTodaysAdminAdd=async(req,res)=>{
  try{
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const result = await transactionCollection.aggregate([
      {
        $match: {
          method: "Manual Admin",
          status: "completed",
          time: {$gte: startOfDay},
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: {$sum: "$amount"},
        }
      }
    ]).toArray();
    res.send(result[0]);
  }catch(err){
    console.error("getTodaysAdminAdd: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}

const bkashCreatePayment = async (req, res) => {
  try {
    const { email, amount } = req.body || {};
    const token = req.token;
    const paymentMethod = await paymentMethodCollection.findOne({
      type: "auto",
    });
    if (!paymentMethod) {
      return res.send({ success: false, message: "Payment method not found" });
    }
    // Same availability gate as the manual methods: status + roles + daily
    // hours + receiving limit (computed). Blocks e.g. a limit-hit bKash.
    // The gate runs BEFORE the pending-transaction cleanup below — a blocked
    // request must not destroy the user's pending record.
    const audience = await getAudience(email);
    const received = await getReceivedAmount(
      paymentMethod._id?.toString(),
      paymentMethod.receivedResetAt
    );
    if (!isMethodAvailable(paymentMethod, audience, received)) {
      return res.send({ success: false, message: "Payment method is not available" });
    }
    const pendingCount = await transactionCollection.countDocuments({
      email,
      status: "pending",
    });
    if (pendingCount) {
      await transactionCollection.deleteOne({
        email: email,
        status: "pending",
      });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    const { bonus, special_bonus, fee } = paymentMethod || {};
    const toPay = Math.ceil(amount + (amount * fee) / 100);
    let willAdd = parseFloat((amount + (amount * bonus) / 100).toFixed(2));
    if (amount % 5 === 0) {
      willAdd = parseFloat(
        (amount + (amount * special_bonus) / 100).toFixed(2)
      );
    }
    const invNumber = require("crypto").randomUUID().split("-")[4];
    const { data } = await axiosBkash.post(
      "/tokenized/checkout/create",
      {
        mode: "0011",
        payerReference: `${email}`,
        callbackURL: `${process.env.SERVER_DOMAIN}/payment/bkash/callback`,
        amount: toPay,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
        },
      }
    );
    // console.log("api data", data);
    const transaction = {
      method: "Bkash Payment",
      amount: parseInt(amount),
      bonus: amount % 5 === 0 ? special_bonus : bonus,
      fee,
      toPay,
      willAdd,
      number: "",
      email,
      previousBalance: parseFloat(user.balance.toFixed(2)),
      attempt: 0,
      trxID: "",
      time: new Date(),
      paymentID: data?.paymentID,
      status: "pending",
      methodID: paymentMethod._id?.toString(),
    };
    const trxInsertResult = await transactionCollection.insertOne(transaction);
    if (trxInsertResult.insertedId) {
      res.send({ success: true, url: data.bkashURL });
    } else {
      res.send({ success: false, message: "Failed to create transaction" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const bkashCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query || {};
    const token = req.token || "";
    if (status === "cancel" || status === "failure") {
      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
      );
    }
    if (status === "success") {
      const { data } = await axiosBkash.post(
        "/tokenized/checkout/execute",
        { paymentID },
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": process.env.BKASH_APP_KEY,
          },
          timeout: 5000,
        }
      );
      console.log("status--", status, "execute payment--", data);
      if (data?.transactionStatus === "Completed") {
        const transaction = await transactionCollection.findOne({
          paymentID: paymentID,
          status: "pending",
        });
        const updateTrx = { trxID: data?.trxID, status: "completed" };
        const updateUser = {
          balance: parseFloat(
            transaction?.previousBalance + transaction?.willAdd
          ),
        };
        const trxUpdateResult = await transactionCollection.updateOne(
          { paymentID: paymentID },
          { $set: updateTrx }
        );
        const userUpdateResult = await userCollection.updateOne(
          { email: transaction.email },
          { $set: updateUser }
        );
        if (trxUpdateResult.modifiedCount && userUpdateResult.modifiedCount) {
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
          );
        } else {
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
          );
        }
      }
    }
    console.log("status--", status);
    return res.redirect(
      `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=failure`
    );
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addMethod = async (req, res) => {
  try {
    const {
      provider,
      category,
      bonus,
      specialBonus: special_bonus,
      fee,
      number,
      status,
      balanceVerify,
      minLimit,
      maxLimit,
      isDirect,
      allowedRoles,
      receivingLimit,
      activeStartHour,
      activeEndHour
    } = req.body;
    const rolesCheck = await validateRoles(allowedRoles);
    if (!rolesCheck.ok) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid allowed roles" });
    }
    if (
      !validateHour(activeStartHour) ||
      !validateHour(activeEndHour)
    ) {
      return res
        .status(400)
        .send({ success: false, message: "Active hours must be 0-23 or blank" });
    }
    // Same numeric check as updateMethod — NaN would silently disable the
    // limit, a negative value would make the method permanently unavailable.
    let limitValue;
    if (receivingLimit !== "" && receivingLimit != null) {
      limitValue = parseFloat(receivingLimit);
      if (!isFinite(limitValue) || limitValue < 0) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid receiving limit" });
      }
    }
    const newMethod = {
      type: "manual",
      provider,
      category,
      bonus: parseFloat(bonus),
      special_bonus: parseFloat(special_bonus),
      fee: parseFloat(fee),
      minLimit: parseInt(minLimit),
      maxLimit: parseInt(maxLimit),
      number,
      balanceVerify,
      isDirect,
      status,
      // Optional new gates — absent = everyone / unlimited / always
      ...(rolesCheck.roles && { allowedRoles: rolesCheck.roles }),
      ...(limitValue !== undefined && { receivingLimit: limitValue }),
      ...(activeStartHour !== "" && activeStartHour != null && {
        activeStartHour: parseInt(activeStartHour),
      }),
      ...(activeEndHour !== "" && activeEndHour != null && {
        activeEndHour: parseInt(activeEndHour),
      }),
    };
    const result = await paymentMethodCollection.insertOne(newMethod);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateMethod = async (req, res) => {
  try {
    const { id } = req.query;
    const { bonus, special_bonus, fee, number, status, balanceVerify, minLimit, maxLimit, isDirect, allowedRoles, receivingLimit, activeStartHour, activeEndHour } = req.body;
    // console.log(req.body);
    const updatedMethod = {
      $set: {
        bonus: parseFloat(bonus),
        special_bonus: parseFloat(special_bonus),
        fee: parseFloat(fee),
        minLimit: parseInt(minLimit),
        maxLimit: parseInt(maxLimit),
        balanceVerify,
        isDirect,
        status,
      },
      $unset: {},
    };
    if (number) {
      updatedMethod.$set.number = number;
    }
    // Optional gates — blank clears the field (everyone / unlimited / always)
    if (Array.isArray(allowedRoles)) {
      const rolesCheck = await validateRoles(allowedRoles);
      if (!rolesCheck.ok) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid allowed roles" });
      }
      if (rolesCheck.roles) {
        updatedMethod.$set.allowedRoles = rolesCheck.roles;
      } else {
        updatedMethod.$unset.allowedRoles = "";
      }
    }
    if (receivingLimit !== undefined) {
      if (receivingLimit === "" || receivingLimit == null) {
        updatedMethod.$unset.receivingLimit = "";
      } else {
        const v = parseFloat(receivingLimit);
        if (!isFinite(v) || v < 0) {
          return res
            .status(400)
            .send({ success: false, message: "Invalid receiving limit" });
        }
        updatedMethod.$set.receivingLimit = v;
      }
    }
    if (activeStartHour !== undefined) {
      if (!validateHour(activeStartHour)) {
        return res
          .status(400)
          .send({ success: false, message: "Active hours must be 0-23 or blank" });
      }
      if (activeStartHour === "" || activeStartHour == null) {
        updatedMethod.$unset.activeStartHour = "";
      } else {
        updatedMethod.$set.activeStartHour = parseInt(activeStartHour);
      }
    }
    if (activeEndHour !== undefined) {
      if (!validateHour(activeEndHour)) {
        return res
          .status(400)
          .send({ success: false, message: "Active hours must be 0-23 or blank" });
      }
      if (activeEndHour === "" || activeEndHour == null) {
        updatedMethod.$unset.activeEndHour = "";
      } else {
        updatedMethod.$set.activeEndHour = parseInt(activeEndHour);
      }
    }
    if (!Object.keys(updatedMethod.$unset).length) {
      delete updatedMethod.$unset;
    }
    const filter = { _id: new ObjectId(id) };
    const result = await paymentMethodCollection.updateOne(
      filter,
      updatedMethod,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteMethod = async (req, res) => {
  try {
    const { id } = req.query;
    const filter = { _id: new ObjectId(id), type: "manual" };
    const result = await paymentMethodCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const methodSummary = async (req, res) => {
  try {
    const result = await paymentMethodSummaryCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const methodReset = async (req, res) => {
  try {
    const { method, id } = req.query;
    let doc;
    if (method === "bkash") {
      doc = { bkash: 0 };
    } else if (method === "nagad") {
      doc = { nagad: 0 };
    }
    const updatedDoc = {
      $set: doc,
    };
    const filter = { _id: new ObjectId(id) };
    const result = await paymentMethodSummaryCollection.updateOne(
      filter,
      updatedDoc,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// Admin reset of the receiving-limit counter. Moves the received baseline to
// now — the method is instantly under its limit again (computed model, no
// status write needed). receivedResetAt is stored per method doc.
const resetReceivingLimit = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid id" });
    }
    const result = await paymentMethodCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { receivedResetAt: new Date() } }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { bkashPersonal, bkashAgent, bkashMerchant, nagadPersonal, nagadAgent } = req.body;
    // if (!bkash && !nagad) {
    //   return res.send({
    //     success: false,
    //     message: "Invalid request. Provide a value",
    //   });
    // }
    const updatedDoc = {
      $set: {
        bkashPersonalBalance: bkashPersonal,
        bkashAgentBalance: bkashAgent,
        bkashMerchantBalance: bkashMerchant,
        nagadPersonalBalance: nagadPersonal,
        nagadAgentBalance: nagadAgent,
      },
    };
    const result = await paymentMethodSummaryCollection.updateOne(
      { doc: "summary" },
      updatedDoc,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getMethods,
  getTodaysAdminAdd,
  addMethod,
  bkashCreatePayment,
  bkashCallback,
  updateMethod,
  deleteMethod,
  methodSummary,
  methodReset,
  adjustBalance,
  resetReceivingLimit,
};

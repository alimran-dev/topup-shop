const { cookieOption } = require("../utils/cookieOption");
const { dbCollections } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { transporter } = require("../config/nodemailer");
const { ObjectId } = require("mongodb");
const { CONSTANTS } = require("../utils/constants");
const { axiosCloudflare } = require("../utils/axiosTurnstile");
const {
  userCollection,
  orderCollection,
  transactionCollection,
  coinSettingCollection,
  coinHistoryCollection,
  referHistoryCollection,
} = dbCollections || {};
require("dotenv").config();

const countSpentMonth = async (email) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pipeline = [
    {
      $match: {
        email,
        updateTime: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$price" },
      },
    },
  ];
  const orderStats = await orderCollection.aggregate(pipeline).toArray();
  const totalSpent = orderStats.length > 0 ? orderStats[0].totalSpent : 0;
  // console.log(totalSpent);
  return totalSpent;
};

const userProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const filter = { email };
    // console.log("user email in cookie: ", email);
    const result = await userCollection.findOne(filter, {
      projection: { password: 0, reset: 0, verify: 0 },
    });
    if (result?.isBanned) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ error: "User Blocked" });
    }
    if (result) {
      result.spent = await countSpentMonth(email);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const { referID } = req.query.state
      ? JSON.parse(req.query.state)
      : null || {};
    if (user?.email) {
      const userInDb = await userCollection.findOne({ email: user.email });
      if (!userInDb) {
        let attempt = 0;
        let isExist;
        let newReferID;
        while (attempt < 15) {
          const hash = crypto
            .createHash("sha256")
            .update(user.email + Date.now())
            .digest("hex");
          newReferID = Buffer.from(hash, "hex")
            .toString("base64")
            .replace(/[+/=]/g, "")
            .substring(0, 8);
          isExist = await userCollection.findOne({ referID: newReferID });
          if (!isExist) {
            break;
          }
        }
        if (isExist) {
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/login?success=false`
          );
        }
        const newUser = {
          email: user.email,
          password: "loginWithGoogle",
          isVerified: true,
          referID: newReferID,
          name: user.name,
          phone: "",
          photo: user.photo,
          role: "user",
          isBanned: false,
          balance: 0,
          coins: 0,
          spent: 0,
          orders: 0,
        };
        if (referID) {
          const referredBy = await userCollection.findOne({ referID: referID });
          if (!referredBy || !referredBy.isVerified) {
            return res.redirect(
              `${process.env.FRONTEND_DOMAIN}/login?success=false`
            );
          }
          newUser.referredBy = referredBy.email;
          const coinSettings = await coinSettingCollection.findOne({
            type: "settings",
          });
          if (!coinSettings) {
            return res.redirect(
              `${process.env.FRONTEND_DOMAIN}/login?success=false`
            );
          }
          const coinHistoryReferFrom = {
            email: referredBy.email,
            name: "Refer Bonus",
            status: "success",
            amount: coinSettings.referFrom,
            createdAt: new Date(),
          };
          const coinHistoryReferTo = {
            email: user.email,
            name: "Refer Bonus",
            status: "success",
            amount: coinSettings.referTo,
            createdAt: new Date(),
          };
          const coinHistoryInsert = await coinHistoryCollection.insertMany([
            coinHistoryReferFrom,
            coinHistoryReferTo,
          ]);
          if (coinHistoryInsert.insertedCount !== 2) {
            return res.redirect(
              `${process.env.FRONTEND_DOMAIN}/login?success=false`
            );
          }
          const referHistory = {
            referredBy: referredBy.email,
            referredTo: user.email,
            coinReferFrom: coinSettings.referFrom,
            coinReferTo: coinSettings.referTo,
            coinHistoryIDs: coinHistoryInsert.insertedIds,
            status: "success",
            createdAt: new Date(),
          };
          await referHistoryCollection.insertOne(referHistory);
          await userCollection.updateOne(
            { _id: referredBy._id },
            { $set: { coins: referredBy.coins + coinSettings.referFrom } }
          );
          newUser.coins = coinSettings.referTo;
        }
        const insertNewUser = await userCollection.insertOne(newUser);
        if (insertNewUser.insertedId) {
          const token = jwt.sign(
            { email: user.email, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "31d",
            }
          );
          res.cookie(
            "access-token",
            token,
            cookieOption(1000 * 60 * 60 * 24 * 30)
          );
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/login?success=true`
          );
        }
        return res.redirect(
          `${process.env.FRONTEND_DOMAIN}/login?success=false`
        );
      } else {
        await userCollection.updateOne(
          { email: user.email },
          { $set: { name: user.name, photo: user.photo, isVerified: true } }
        );
        const token = jwt.sign(
          { email: userInDb.email, role: userInDb.role },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "31d",
          }
        );
        res.cookie(
          "access-token",
          token,
          cookieOption(1000 * 60 * 60 * 24 * 30)
        );
        return res.redirect(
          `${process.env.FRONTEND_DOMAIN}/login?success=true`
        );
      }
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.redirect(`${process.env.FRONTEND_DOMAIN}/login?success=false`);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body || {};
    if (!email || !password || !turnstileToken) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid request" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.send({ success: false, message: "Wrong Password" });
    }
    const {data} = await axiosCloudflare.post("/turnstile/v0/siteverify",{secret: process.env.TURNSTILE_SECRET, response: turnstileToken, remoteip: req?.ip});
    // console.log(data);
    if(data?.success !== true){
      return res.send({ success: false, message: "Captcha verification failed" });
    }
    user.spent = await countSpentMonth(email);
    const { password: pass, reset, verify, ...userDataResponse } = user || {};
    const token = jwt.sign(
      { email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "31d",
      }
    );
    res.cookie("access-token", token, cookieOption(1000 * 60 * 60 * 24 * 30));
    res.send(userDataResponse);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const newUser = async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };
    if(!user.email || !user.password || !user?.turnstileToken) {
      return res.send({ success: false, message: "Invalid Request" });
    }
    const {data} = await axiosCloudflare.post("/turnstile/v0/siteverify",{secret: process.env.TURNSTILE_SECRET, response: user?.turnstileToken, remoteip: req?.ip});
    // console.log(data);
    if(data?.success !== true){
      return res.send({ success: false, message: "Captcha verification failed" });
    }
    const userInDb = await userCollection.findOne(query);
    if (userInDb) {
      return res.send({ userExist: true, newUser: false });
    }
    const hashPassword = await bcrypt.hash(user.password, 10);
    let attempt = 0;
    let isExist;
    let referID;
    while (attempt < 15) {
      const hash = crypto
        .createHash("sha256")
        .update(user.email + Date.now())
        .digest("hex");
      referID = Buffer.from(hash, "hex")
        .toString("base64")
        .replace(/[+/=]/g, "")
        .substring(0, 8);
      isExist = await userCollection.findOne({ referID: referID });
      if (!isExist) {
        break;
      }
    }
    if (isExist) {
      return res.send({
        success: false,
        message: "Failed to generate refer ID",
      });
    }
    const newUser = {
      email: user.email,
      referID: referID,
      password: hashPassword,
      isVerified: false,
      name: user.name,
      phone: user.phone,
      photo: user.photo,
      role: "user",
      isBanned: false,
      balance: 0,
      coins: 0,
      spent: 0,
      orders: 0,
    };
    if (user.referID) {
      const referredBy = await userCollection.findOne({
        referID: user.referID,
      });
      if (!referredBy || !referredBy.isVerified) {
        return res.send({ success: false, message: "Refer id is not valid" });
      }
      newUser.referredBy = referredBy.email;
      const coinSettings = await coinSettingCollection.findOne({
        type: "settings",
      });
      if (!coinSettings) {
        return res.send({ success: false, message: "Coin Settings not found" });
      }
      const coinHistoryReferFrom = {
        email: referredBy.email,
        name: "Refer Bonus",
        status: "pending",
        amount: coinSettings.referFrom,
        createdAt: new Date(),
      };
      const coinHistoryReferTo = {
        email: user.email,
        name: "Refer Bonus",
        status: "pending",
        amount: coinSettings.referTo,
        createdAt: new Date(),
      };
      const coinHistoryInsert = await coinHistoryCollection.insertMany([
        coinHistoryReferFrom,
        coinHistoryReferTo,
      ]);
      if (coinHistoryInsert.insertedCount !== 2) {
        return res.send({
          success: false,
          message: "Refer coin history insert failed",
        });
      }
      const referHistory = {
        referredBy: referredBy.email,
        referredTo: user.email,
        coinReferFrom: coinSettings.referFrom,
        coinReferTo: coinSettings.referTo,
        coinHistoryIDs: [
          coinHistoryInsert?.insertedIds[0]?.toString(),
          coinHistoryInsert?.insertedIds[1]?.toString(),
        ],
        status: "pending",
        createdAt: new Date(),
      };
      await referHistoryCollection.insertOne(referHistory);
    }
    // console.log(newUser);
    const result = await userCollection.insertOne(newUser);
    if (result.insertedId) {
      const tokenData = { email: user?.email, role: "user" };
      const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "31d",
      });
      const { password, ...userData } = newUser || {};
      res.cookie("access-token", token, cookieOption(1000 * 60 * 60 * 24 * 30));
      res.send({ ...result, ...userData });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.query || {};
    const user = await userCollection.findOne({ email: email });
    if (email && !otp && !newPassword) {
      if (user) {
        const time = new Date();
        const resetTimeDB = user.reset?.time?.getTime();
        const resetTimeDuration = (time.getTime() - resetTimeDB) / 1000;
        if (resetTimeDB && resetTimeDuration < 30) {
          return res.send({
            success: false,
            message: "Please wait 30 second and try again",
          });
        }
        const randomNumber = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        // console.log("OTP", randomNumber);
        const genOTP = await bcrypt.hash(randomNumber, 10);
        const resetObj = { otp: genOTP, time };
        const result = await userCollection.updateOne(
          { _id: user._id },
          { $set: { reset: resetObj } }
        );
        if (result.modifiedCount) {
          const mailInfo = await transporter.sendMail({
            from: `"Mezba Shop" <no-reply@${CONSTANTS.domain}>`,
            to: email,
            subject: "Reset Mezba Shop Password",
            text: `Your OTP to reset the password is: ${randomNumber}. This is valid for 5 minutes.`,
          });
          // console.log(mailInfo);
          return res.send({ success: true, message: "OTP sent" });
        }
      } else {
        return res.send({ success: false, message: "User not found" });
      }
    } else if (email && otp && !newPassword) {
      const isOtpCorrect = await bcrypt.compare(
        otp.toString(),
        user?.reset?.otp
      );
      console.log("isotpcorrect", isOtpCorrect);
      const now = new Date().getTime();
      const prevTime = user?.reset?.time?.getTime();
      const duration = (now - prevTime) / 1000;
      if (!isOtpCorrect) {
        return res.send({ success: false, message: "Incorrect OTP" });
      }
      if (duration > 300) {
        return res.send({ success: false, message: "OTP Expired. Try again." });
      }
      return res.send({ success: true, message: "Correct OTP" });
    } else if (email && otp && newPassword) {
      const isOtpCorrect = await bcrypt.compare(
        otp.toString(),
        user?.reset?.otp
      );
      const now = new Date().getTime();
      const prevTime = user?.reset?.time?.getTime();
      const duration = (now - prevTime) / 1000;
      if (!isOtpCorrect) {
        return res.send({ success: false, message: "Incorrect OTP" });
      }
      if (duration > 300) {
        return res.send({ success: false, message: "OTP Expired. Try again." });
      }
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      const result = await userCollection.updateOne(
        { _id: user._id },
        { $set: { password: newPasswordHash } }
      );
      res.send({ ...result, success: true });
    } else {
      res.send({ success: false, message: "Invalid request" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = req.user || {};
    const { email, oldPassword, newPassword } = req.body || {};
    // console.log(user, email);
    if (user?.email !== email) {
      return res.send({ success: false, message: "Unauthorized User" });
    }
    const userInDb = await userCollection.findOne({ email: email });
    if (!userInDb) {
      return res.send({ success: false, message: "User not found" });
    }
    const isCorrectPassword = await bcrypt.compare(
      oldPassword?.toString(),
      userInDb?.password
    );
    if (!isCorrectPassword) {
      return res.send({ success: false, message: "Incorrect Old password" });
    }
    if (newPassword?.toString().length < 6) {
      return res.send({
        success: false,
        message: "Password must be at least 6 digit",
      });
    }
    const newPasswordHash = await bcrypt.hash(newPassword.toString(), 10);
    const result = await userCollection.updateOne(
      { _id: userInDb._id },
      { $set: { password: newPasswordHash } }
    );
    if (result.modifiedCount) {
      return res.send({
        success: true,
        message: "Password changed successfully",
      });
    }
    res.send({ success: false, message: "Something went wrong" });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, photo } = req.body;
    const emailDecoded = req.user?.email;
    if (email !== emailDecoded) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const updateUser = {
      $set: {},
    };
    if (name) {
      updateUser.$set.name = name;
    }
    if (phone) {
      updateUser.$set.phone = phone;
    }
    if (photo) {
      updateUser.$set.photo = photo;
    }
    const isUpdated = await userCollection.updateOne(
      { email: email },
      updateUser
    );
    if (isUpdated.modifiedCount > 0) {
      const user = await userCollection.findOne({ email: email });
      user.spent = await countSpentMonth(email);
      res.send(user);
    } else {
      res.status(501).send({ error: "Internal server Error" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page, limit, search, sortBy } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    // console.log(pageInt, limitInt);
    let filter = {};
    if (search) {
      filter = { email: { $regex: new RegExp(search, "i") } };
    }
    const sort = {};
    if(sortBy==="newest") {
      sort._id = -1;
    } else if(sortBy==="oldest") {
      sort._id = 1;
    } else if(sortBy==="coinLowToHigh") {
      sort.coins = 1;
    } else if(sortBy==="coinHighToLow") {
      sort.coins = -1;
    } else if(sortBy==="balanceLowToHigh") {
      sort.balance = 1;
    } else if(sortBy==="balanceHighToLow") {
      sort.balance = -1;
    }
    const totalUsers = await userCollection.countDocuments(filter);
    const result = await userCollection
      .find(filter, { sort })
      .project({ password: 0, referID: 0,referredBy: 0, reset: 0, verify: 0 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ users: result, totalUsers });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = req.user || {};
    const { email, otp } = req.body || {};
    if (user?.email !== email) {
      return res.send({ success: false, message: "Unauthorized user" });
    }
    const userInDb = await userCollection.findOne({ email: email });
    if (!userInDb) {
      return res.send({ success: false, message: "User not found" });
    }
    const now = new Date().getTime();
    const lastOTPsent = userInDb?.verify?.time;
    const lastOTPsentDuration = (now - lastOTPsent?.getTime()) / 1000;
    if (lastOTPsent && now - lastOTPsentDuration <= 30) {
      return res.send({ success: false, message: "Please wait 30 seconds" });
    }
    if (email && !otp) {
      const randomNumber = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      // console.log("OTP", randomNumber);
      const genOTP = await bcrypt.hash(randomNumber, 10);
      const verifyObj = { otp: genOTP, time: new Date() };
      const result = await userCollection.updateOne(
        { _id: userInDb._id },
        { $set: { verify: verifyObj } }
      );
      if (result.modifiedCount) {
        const mailInfo = await transporter.sendMail({
          from: `"Mezba Shop" <no-reply@${CONSTANTS.domain}>`,
          to: email,
          subject: "Verify Mezba Shop Account",
          text: `Your OTP for account verification is: ${randomNumber}. OTP is valid for 5 minutes.`,
        });
        // console.log(mailInfo);
        return res.send({ success: true, message: "OTP sent successfull" });
      }
    }
    if (email && otp) {
      const isOtpCorrect = await bcrypt.compare(
        otp?.toString(),
        userInDb?.verify?.otp
      );
      if (!isOtpCorrect) {
        return res.send({ success: false, message: "Incorrect OTP" });
      }
      const now = new Date();
      const lastOTPsent = userInDb?.verify?.time;
      const duration = (now.getTime() - lastOTPsent?.getTime()) / 1000;
      if (lastOTPsent && duration > 300) {
        return res.send({ success: false, message: "OTP Expired. Try again." });
      }
      if (userInDb.referredBy) {
        const referHistory = await referHistoryCollection.findOne({
          referredTo: userInDb.email,
        });
        if (!referHistory) {
          return res.send({
            success: false,
            message: "Refer history not found",
          });
        }
        await referHistoryCollection.updateOne(
          { _id: referHistory._id },
          { $set: { status: "success" } }
        );
        await coinHistoryCollection.updateOne(
          { _id: new ObjectId(referHistory.coinHistoryIDs[0]) },
          { $set: { status: "success" } }
        );
        await coinHistoryCollection.updateOne(
          { _id: new ObjectId(referHistory.coinHistoryIDs[1]) },
          { $set: { status: "success" } }
        );
        await userCollection.updateOne(
          { email: referHistory.referredBy },
          { $inc: { coins: referHistory.coinReferFrom } }
        );
        await userCollection.updateOne(
          { email: referHistory.referredTo },
          { $inc: { coins: referHistory.coinReferTo } }
        );
      }
      const result = await userCollection.updateOne(
        { _id: userInDb._id },
        { $set: { isVerified: true } }
      );
      if (result.modifiedCount) {
        return res.send({ success: true, message: "User email verified" });
      }
    }
    res.send({ success: false, message: "Something went wrong" });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isBanned, email } = req.body;
    const updatedUser = {
      $set: {
        isBanned: isBanned,
      },
    };
    const result = await userCollection.updateOne(
      { email: email },
      updatedUser
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUserBalance = async (req, res) => {
  try {
    const { email, addBalance } = req.body;
    const addBalanceInt = parseFloat(addBalance);
    if (!addBalanceInt || isNaN(addBalanceInt)) {
      return res.status(400).send({ error: "Not Possible" });
    }
    const user = await userCollection.findOne({ email: email });
    if (user?.balance + addBalanceInt < 0) {
      return res.status(400).send({ error: "Not enough balance" });
    }
    const transaction = {
      method: "Manual Admin",
      amount: addBalanceInt,
      bonus: 0,
      fee: 0,
      toPay: addBalanceInt,
      willAdd: addBalanceInt,
      number: "",
      email,
      attempt: 0,
      trxID: "",
      time: new Date(),
      status: "completed",
    };
    await transactionCollection.insertOne(transaction);
    const result = await userCollection.updateOne(
      { email: email },
      { $inc: { balance: addBalanceInt } }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const allReferHistory = async (req, res) => {
  try {
    const { email: emailInToken, role } = req.user || {};
    const { page, limit, referredBy, referredTo } = req.query || {};
    // console.log("allReferHistory: ",page,limit,referredBy,referredTo);
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    if (isNaN(pageInt) || isNaN(limitInt)) {
      return res.send({ message: "Invalid page or limit value" });
    }
    if (role === "user" && referredBy !== emailInToken) {
      return res.send({ success: false, message: "Invalid user email" });
    }
    const filter = {$or: [{referredBy: { $regex: new RegExp(referredBy, "i") }},{referredTo: { $regex: new RegExp(referredTo, "i") }}]};
    const totalRef=await referHistoryCollection.countDocuments(filter);
    const result = await referHistoryCollection.find(filter,{sort: {createdAt: -1}}).skip((pageInt-1)*limitInt).limit(limitInt).toArray();
    res.send({history: result, totalRef});
  } catch (err) {
    console.error("allReferHistory: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const genRefer = async (email) => {
  let attempt = 0;
  let isExist;
  let referID;
  while (attempt < 15) {
    const hash = crypto
      .createHash("sha256")
      .update(email + Date.now())
      .digest("hex");
    referID = Buffer.from(hash, "hex")
      .toString("base64")
      .replace(/[+/=]/g, "")
      .substring(0, 8);
    isExist = await userCollection.findOne({ referID: referID });
    if (!isExist) {
      break;
    }
  }
  if (isExist) {
    return null;
  }
  return referID;
};

const tempReferIDGen = async (req, res) => {
  try {
    const users = await userCollection.find().toArray();
    const updatePromises = users.map(async (user) => {
      const referID = await genRefer(user.email);
      if (referID) {
        await userCollection.updateOne(
          { _id: user._id },
          { $set: { referID } }
        );
        return true;
      } else {
        return false;
      }
    });
    const result = await Promise.all(updatePromises);
    const successUpdates = result.filter((res) => res).length;
    res.send({ updateCount: successUpdates, totalCount: users.length });
  } catch (err) {
    console.error("tempReferIDGen: ", err.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  userProfile,
  googleCallback,
  loginUser,
  newUser,
  forgetPassword,
  changePassword,
  updateUser,
  getAllUser,
  verifyUser,
  updateUserStatus,
  updateUserBalance,
  tempReferIDGen,
  allReferHistory
};

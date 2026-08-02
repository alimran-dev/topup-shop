const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");

const serviceCollection = dbCollections.serviceCollection;

// Helper: Recursively collect all descendant service IDs for cascade delete
const getAllDescendantIds = async (parentId) => {
  const ids = [];
  const children = await serviceCollection
    .find({ parentServiceId: new ObjectId(parentId) })
    .project({ _id: 1 })
    .toArray();

  for (const child of children) {
    ids.push(child._id);
    const grandChildIds = await getAllDescendantIds(child._id);
    ids.push(...grandChildIds);
  }
  return ids;
};

// Helper: Walk up the parent chain from a service to check if targetId is an ancestor
const isAncestorOf = async (serviceId, targetId) => {
  let current = await serviceCollection.findOne(
    { _id: new ObjectId(serviceId) },
    { projection: { parentServiceId: 1 } }
  );
  while (current && current.parentServiceId) {
    if (current.parentServiceId.toString() === targetId.toString()) {
      return true;
    }
    current = await serviceCollection.findOne(
      { _id: new ObjectId(current.parentServiceId) },
      { projection: { parentServiceId: 1 } }
    );
  }
  return false;
};

// Helper: Decode redirectUrl in a service document for API response
const decodeRedirectUrl = (doc) => {
  if (doc && doc.redirectUrl) {
    try {
      doc.redirectUrl = decodeURI(doc.redirectUrl);
    } catch {
      // keep as-is if not encoded
    }
  }
  return doc;
};

// GET /services/get?id=
const getService = async (req, res) => {
  try {
    const { id } = req.query;
    // Sort options by serial
    await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      [
        {
          $addFields: {
            options: {
              $sortArray: {
                input: "$options",
                sortBy: { serial: 1 },
              },
            },
          },
        },
      ]
    );

    // Use aggregation to include childCount
    const result = await serviceCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "parentServiceId",
            as: "children",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$children" },
          },
        },
        {
          $project: {
            parentServiceId: 1,
            categoryId: 1,
            title: 1,
            image: 1,
            tutorialText: 1,
            tutorialURL: 1,
            isAuto: 1,
            server: 1,
            serial: 1,
            isActive: 1,
            inputs: 1,
            rules: 1,
            options: 1,
            createdAt: 1,
            childCount: 1,
            notice: 1,
            description: 1,
            redirectUrl: 1,
          },
        },
      ])
      .toArray();

    if (result.length > 0) {
      res.send(decodeRedirectUrl(result[0]));
    } else {
      res.status(404).send({ success: false, error: "Service not found" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services?activeOnly=true
const getAllServices = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === "true") {
      filter.isActive = { $ne: false };
      // Only return top-level services (no parentServiceId) for home page
      filter.parentServiceId = { $exists: false };
    }
    const result = await serviceCollection
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "services",
            let: { parentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$parentServiceId", "$$parentId"] } } },
              ...(activeOnly === "true" ? [{ $match: { isActive: { $ne: false } } }] : []),
            ],
            as: "lookupChildren",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$lookupChildren" },
          },
        },
        {
          $project: {
            categoryId: 1,
            title: 1,
            image: 1,
            serial: 1,
            isAuto: 1,
            server: 1,
            isActive: 1,
            childCount: 1,
            parentServiceId: 1,
            redirectUrl: 1,
          },
        },
        { $sort: { serial: 1 } },
      ])
      .toArray();
    res.send(result.map(decodeRedirectUrl));
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services/children?parentId=
const getChildServices = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) {
      return res
        .status(400)
        .send({ success: false, error: "parentId is required" });
    }
    const result = await serviceCollection
      .aggregate([
        { $match: { parentServiceId: new ObjectId(parentId), isActive: { $ne: false } } },
        {
          $lookup: {
            from: "services",
            let: { parentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$parentServiceId", "$$parentId"] } } },
              { $match: { isActive: { $ne: false } } },
            ],
            as: "activeChildren",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$activeChildren" },
          },
        },
        {
          $project: {
            categoryId: 1,
            title: 1,
            image: 1,
            serial: 1,
            isAuto: 1,
            server: 1,
            isActive: 1,
            childCount: 1,
            parentServiceId: 1,
            redirectUrl: 1,
          },
        },
        { $sort: { serial: 1 } },
      ])
      .toArray();
    res.send(result.map(decodeRedirectUrl));
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services/has-children?id=
const checkHasChildren = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, error: "id is required" });
    }
    const count = await serviceCollection.countDocuments({
      parentServiceId: new ObjectId(id),
    });
    res.send({ hasChildren: count > 0, count });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// POST /services/new
const addSubCategory = async (req, res) => {
  try {
    const {
      title,
      categoryId,
      parentServiceId,
      image,
      tutorialText,
      tutorialURL,
      isAuto,
      server,
      inputs,
      rules,
      notice,
      description,
      redirectUrl,
    } = req.body;
    if (
      title &&
      categoryId &&
      image &&
      tutorialText &&
      tutorialURL &&
      inputs &&
      rules
    ) {
      // Validate parentServiceId if provided
      if (parentServiceId) {
        const parentService = await serviceCollection.findOne({
          _id: new ObjectId(parentServiceId),
        });
        if (!parentService) {
          return res
            .status(400)
            .send({ success: false, error: "Parent service not found" });
        }
        // Validate category matches parent's category
        if (parentService.categoryId.toString() !== categoryId) {
          return res.status(400).send({
            success: false,
            error: "Child service must belong to the same category as its parent",
          });
        }
      }

      const total = await serviceCollection.countDocuments();
      const subCategory = {
        title,
        categoryId: new ObjectId(categoryId),
        image,
        tutorialText,
        tutorialURL,
        isAuto,
        serial: total + 1,
        isActive: true,
        inputs,
        rules,
        options: [],
        createdAt: new Date(),
      };
      if (parentServiceId) {
        subCategory.parentServiceId = new ObjectId(parentServiceId);
      }
      if (isAuto) {
        subCategory.server = server || "default";
      }
      if (notice) {
        subCategory.notice = notice;
      }
      if (description) {
        subCategory.description = description;
      }
      if (redirectUrl) {
        subCategory.redirectUrl = encodeURI(redirectUrl);
      }
      const result = await serviceCollection.insertOne(subCategory);
      res.send(result);
    } else {
      console.log(
        title,
        categoryId,
        image,
        tutorialText,
        tutorialURL,
        inputs,
        rules
      );
      res.status(400).send({ success: false, message: "Invalid request" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// PATCH /services/update
const updateSubCategory = async (req, res) => {
  try {
    const {
      id,
      title,
      categoryId,
      parentServiceId,
      image,
      tutorialText,
      tutorialURL,
      inputs,
      serial,
      rules,
      isActive,
      notice,
      description,
      redirectUrl,
    } = req.body;
    const newSubCategory = { $set: {} };

    if (title) {
      newSubCategory.$set.title = title;
    }
    if (categoryId) {
      newSubCategory.$set.categoryId = new ObjectId(categoryId);
    }
    if (image) {
      newSubCategory.$set.image = image;
    }
    if (tutorialText) {
      newSubCategory.$set.tutorialText = tutorialText;
    }
    if (tutorialURL) {
      newSubCategory.$set.tutorialURL = tutorialURL;
    }
    if (inputs) {
      newSubCategory.$set.inputs = inputs;
    }
    if (rules) {
      newSubCategory.$set.rules = rules;
    }
    if (isActive !== undefined) {
      newSubCategory.$set.isActive = isActive;
    }
    if (notice !== undefined && notice !== "" && notice !== null) {
      newSubCategory.$set.notice = notice;
    }
    if (description !== undefined && description !== "" && description !== null) {
      newSubCategory.$set.description = description;
    }
    if (redirectUrl !== undefined && redirectUrl !== "" && redirectUrl !== null) {
      newSubCategory.$set.redirectUrl = encodeURI(redirectUrl);
    }

    newSubCategory.$set.serial = serial || 0;

    // Prepare the full update document
    const updateDoc = { $set: newSubCategory.$set };

    // Handle clearing of optional fields
    if (notice === "" || notice === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.notice = 1;
    }
    if (description === "" || description === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.description = 1;
    }
    if (redirectUrl === "" || redirectUrl === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.redirectUrl = 1;
    }

    // Handle parentServiceId changes
    if (parentServiceId !== undefined) {
      const currentService = await serviceCollection.findOne({
        _id: new ObjectId(id),
      });

      const currentParentId = currentService?.parentServiceId?.toString() || "";
      const isRemovingParent =
        parentServiceId === null || parentServiceId === "";
      const isChangingToNewParent =
        parentServiceId !== null &&
        parentServiceId !== "" &&
        parentServiceId !== currentParentId;

      if (isRemovingParent && currentParentId) {
        // Remove parent field from document
        updateDoc.$unset = { parentServiceId: 1 };
      } else if (isChangingToNewParent) {
        // Validate and set new parent
        if (parentServiceId === id) {
          return res.status(400).send({
            success: false,
            error: "A service cannot be its own parent",
          });
        }
        const parentService = await serviceCollection.findOne({
          _id: new ObjectId(parentServiceId),
        });
        if (!parentService) {
          return res
            .status(400)
            .send({ success: false, error: "Parent service not found" });
        }
        const isCircular = await isAncestorOf(parentServiceId, id);
        if (isCircular) {
          return res.status(400).send({
            success: false,
            error:
              "Circular reference detected: cannot set a descendant as parent",
          });
        }
        const targetCategoryId = categoryId
          ? new ObjectId(categoryId)
          : currentService.categoryId;
        if (
          parentService.categoryId.toString() !== targetCategoryId.toString()
        ) {
          return res.status(400).send({
            success: false,
            error:
              "Child service must belong to the same category as its parent",
          });
        }
        updateDoc.$set.parentServiceId = new ObjectId(parentServiceId);
      }
    }

    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// DELETE /services/delete?id=
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res
        .status(400)
        .send({ success: false, error: "id is required" });
    }

    // Collect all descendant IDs recursively
    const descendantIds = await getAllDescendantIds(id);

    // Delete all descendants first
    if (descendantIds.length > 0) {
      await serviceCollection.deleteMany({
        _id: { $in: descendantIds },
      });
    }

    // Delete the service itself
    const result = await serviceCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      ...result,
      deletedDescendants: descendantIds.length,
    });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllServices,
  addSubCategory,
  getService,
  updateSubCategory,
  deleteSubCategory,
  getChildServices,
  checkHasChildren,
};
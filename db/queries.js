const { ObjectId } = require('mongodb');

/* =========================
   QUERY 1
========================= */
async function signupUser(db, userData) {
  return await db.collection("users").insertOne({
    email: userData.email,
    passwordHash: userData.passwordHash,
    name: userData.name,
    createdAt: new Date()
  });
}

/* =========================
   QUERY 2
========================= */
async function loginFindUser(db, email) {
  return await db.collection("users").findOne({ email });
}

/* =========================
   QUERY 3
========================= */
async function listUserProjects(db, ownerId) {
  return await db.collection("projects")
    .find({ ownerId, archived: false })
    .sort({ createdAt: -1 })
    .toArray();
}

/* =========================
   QUERY 4
========================= */
async function createProject(db, projectData) {
  return await db.collection("projects").insertOne({
    ...projectData,
    archived: false,
    createdAt: new Date()
  });
}

/* =========================
   QUERY 5
========================= */
async function archiveProject(db, projectId) {
  return await db.collection("projects").updateOne(
    { _id: projectId },
    { $set: { archived: true } }
  );
}

/* =========================
   QUERY 6
========================= */
async function listProjectTasks(db, projectId, status) {
  let filter = { projectId };

  if (status) {
    filter.status = status;
  }

  return await db.collection("tasks")
    .find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .toArray();
}

/* =========================
   QUERY 7
========================= */
async function createTask(db, taskData) {
  return await db.collection("tasks").insertOne({
    ownerId: taskData.ownerId,
    projectId: taskData.projectId,
    title: taskData.title,
    priority: taskData.priority || 1,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    status: "todo",
    createdAt: new Date()
  });
}

/* =========================
   QUERY 8
========================= */
async function updateTaskStatus(db, taskId, newStatus) {
  return await db.collection("tasks").updateOne(
    { _id: taskId },
    { $set: { status: newStatus } }
  );
}

/* =========================
   QUERY 9
========================= */
async function addTaskTag(db, taskId, tag) {
  return await db.collection("tasks").updateOne(
    { _id: taskId },
    { $addToSet: { tags: tag } }
  );
}

/* =========================
   QUERY 10
========================= */
async function removeTaskTag(db, taskId, tag) {
  return await db.collection("tasks").updateOne(
    { _id: taskId },
    { $pull: { tags: tag } }
  );
}

/* =========================
   QUERY 11
========================= */
async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  return await db.collection("tasks").updateOne(
    { _id: taskId, "subtasks.title": subtaskTitle },
    { $set: { "subtasks.$.done": newDone } }
  );
}

/* =========================
   QUERY 12
========================= */
async function deleteTask(db, taskId) {
  return await db.collection("tasks").deleteOne({ _id: taskId });
}

/* =========================
   QUERY 13
========================= */
async function searchNotes(db, ownerId, tags, projectId) {
  let filter = {
    ownerId,
    tags: { $in: tags }
  };

  if (projectId) {
    filter.projectId = projectId;
  }

  return await db.collection("notes")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

/* =========================
   QUERY 14
========================= */
async function projectTaskSummary(db, ownerId) {
const { ObjectId } = require('mongodb');


  return await db.collection("tasks").aggregate([
    { $match: { ownerId: new ObjectId(ownerId) } },

    {
      $group: {
        _id: "$projectId",
        todo: {
          $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] }
        },
        done: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
        },
        total: { $sum: 1 }
      }
    },

    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project"
      }
    },

    { $unwind: "$project" },

    {
      $project: {
        projectName: "$project.name",
        todo: 1,
        inProgress: 1,
        done: 1,
        total: 1
      }
    }
  ]).toArray();
}


/* =========================
   QUERY 15
========================= */
async function recentActivityFeed(db, ownerId) {
  return await db.collection("tasks").aggregate([
    { $match: { ownerId: new ObjectId(ownerId) } },

    { $sort: { createdAt: -1 } },

    { $limit: 10 },

    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project"
      }
    },

    { $unwind: "$project" },

    {
      $project: {
        title: 1,
        status: 1,
        priority: 1,
        createdAt: 1,
        projectId: 1,
        projectName: "$project.name"
      }
    }
  ]).toArray();
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  signupUser,
  loginFindUser,
  listUserProjects,
  createProject,
  archiveProject,
  listProjectTasks,
  createTask,
  updateTaskStatus,
  addTaskTag,
  removeTaskTag,
  toggleSubtask,
  deleteTask,
  searchNotes,
  projectTaskSummary,
  recentActivityFeed
};

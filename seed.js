// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
//
//  Required minimum:
//    - 2 users
//    - 4 projects (split across the users)
//    - 5 tasks (with embedded subtasks and tags arrays)
//    - 5 notes (some attached to projects, some standalone)
//
//  Use the bcrypt module to hash passwords before inserting users.
//  Use ObjectId references for relationships (projectId, ownerId).
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // OPTIONAL: clear existing data so re-seeding is idempotent
  // await db.collection('users').deleteMany({});
  // await db.collection('projects').deleteMany({});
  // await db.collection('tasks').deleteMany({});
  // await db.collection('notes').deleteMany({});

  // =============================================================================
  //  TODO: Insert your seed data below.
  // =============================================================================
// USERS
const passwordHash = await bcrypt.hash('password123', 10);
const u1 = await db.collection('users').insertOne({
  name: "Maryam",
  email: "maryam@test.com",
  password: passwordHash,
  createdAt: new Date()
});
const u2 = await db.collection('users').insertOne({
  name: "Sheikh",
  email: "sheikh@test.com",
  password: passwordHash,
  createdAt: new Date()
});
// PROJECTS
const p1 = await db.collection('projects').insertOne({
  name: "Web App",
  ownerId: u1.insertedId
});
const p2 = await db.collection('projects').insertOne({
  name: "db Project",
  ownerId: u1.insertedId
});
const p3 = await db.collection('projects').insertOne({
  name: "Mobile App",
  ownerId: u2.insertedId
});
const p4 = await db.collection('projects').insertOne({
  name: "AI",
  ownerId: u2.insertedId
});
// TASKS 
await db.collection('tasks').insertMany([
  {
    ownerId: u1.insertedId,
    projectId: p1.insertedId,
    title: "design database schema",
    status: "todo",
    priority: 1,
    tags: ["db", "design"],
    subtasks: [
      { title: "identify entities", done: true },
      { title: "draw ERD", done: false }
    ],
    createdAt: new Date()
  },
  {
    ownerId: u1.insertedId,
    projectId: p1.insertedId,
    title: "Build API",
    status: "in-progress",
    priority: 2,
    tags: ["backend"],
    subtasks: [
      { title: "Setup routes", done: false },
      { title: "Connect DB", done: false }
    ],
    dueDate: new Date("2026-05-01"), 
    createdAt: new Date()
  },
  {
    ownerId: u1.insertedId,
    projectId: p2.insertedId,
    title: "Train model",
    status: "todo",
    priority: 3,
    tags: ["ai"],
    subtasks: [
      { title: "Collect data", done: false }
    ],
    createdAt: new Date()
  },
  {
    ownerId: u2.insertedId,
    projectId: p3.insertedId,
    title: "UI design",
    status: "done",
    priority: 2,
    tags: ["ui", "frontend"],
    subtasks: [
      { title: "Wireframes", done: true }
    ],
    createdAt: new Date()
  },
  {
    ownerId: u2.insertedId,
    projectId: p4.insertedId,
    title: "Literature review",
    status: "todo",
    priority: 1,
    tags: ["research"],
    subtasks: [
      { title: "Find papers", done: false }
    ],
    createdAt: new Date()
  }
]);

// NOTES 
await db.collection('notes').insertMany([
  {
    ownerId: u1.insertedId,
    text: "General productivity note",
    createdAt: new Date()
  },
  {
    ownerId: u1.insertedId,
    projectId: p1.insertedId,
    text: "Schema should support scalability",
    createdAt: new Date()
  },
  {
    ownerId: u2.insertedId,
    projectId: p3.insertedId,
    text: "Use React Native for speed",
    createdAt: new Date()
  },
  {
    ownerId: u2.insertedId,
    text: "Ideas for future apps",
    createdAt: new Date()
  },
  {
    ownerId: u1.insertedId,
    projectId: p2.insertedId,
    text: "AI model needs more training data",
    createdAt: new Date()
  }
]);
console.log("seed done");

  console.log('TODO: implement seed.js');
  process.exit(0);
})();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose.connect("mongodb://localhost:27017/notesDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
});

const Note = require("./Note");

// GET all notes
app.get("/notes", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const notes = await Note.find().skip(skip).limit(limit);
    res.json(notes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// POST a new note
app.post("/notes", async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
  });
  try {
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// DELETE a note by ID
app.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) res.status(404).send("No note found");
    res.status(200).send(`Note deleted`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT update a note by ID
app.put("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!note) res.status(404).send("No note found");
    res.json(note);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// GET search note by title or content
app.get("/notes/search", async (req, res) => {
  const query = req.query.query;
  try {
    const notes = await Note.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

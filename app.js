const express = require("express");
const path = require("node:path");
const multer = require("multer"); // Import multer for file uploads
const app = express();
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not set
// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage }); // Initialize upload middleware

// Set up views and static file serving
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Messages data
const messages = [
  {
    text: "Hi there!",
    user: "Amando",
    added: new Date(),
  },
  {
    text: "Hello World!",
    user: "Charles",
    added: new Date(),
  },
];

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Mini Messageboard", messages });
});

app.get("/new", (req, res) => {
  res.render("form", { title: "Add a New Message", messages });
});

app.post("/new", upload.single("image"), (req, res) => {
  const { messageText, messageUser } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save image if uploaded

  // Add the new message to the messages array
  messages.push({
    text: messageText,
    user: messageUser,
    image: imageUrl, // Include image URL if available
    added: new Date(),
  });

  res.redirect("/");
});

app.get("/message/:id", (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  const message = messages[messageId];
  if (message) {
    res.render("details", { title: "Message Details", message, id: messageId });
  } else {
    res.status(404).send("Message not found.");
  }
});

// Edit a message
app.get("/message/:id/edit", (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  const message = messages[messageId];
  if (message) {
    res.render("edit", { title: "Edit Message", message, id: messageId });
  } else {
    res.status(404).send("Message not found.");
  }
});

app.post("/message/:id/edit", (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  if (messages[messageId]) {
    messages[messageId].text = req.body.messageText;
    res.redirect(`/message/${messageId}`);
  } else {
    res.status(404).send("Message not found.");
  }
});

// Delete a message
app.post("/message/:id/delete", (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  if (messages[messageId]) {
    messages.splice(messageId, 1); // Remove the message
    res.redirect("/");
  } else {
    res.status(404).send("Message not found.");
  }
});

// Like a message
app.post("/message/:id/like", (req, res) => {
  const messageId = parseInt(req.params.id, 10);
  if (messages[messageId]) {
    messages[messageId].likes = (messages[messageId].likes || 0) + 1;
    res.redirect("/");
  } else {
    res.status(404).send("Message not found.");
  }
});

// Route: Render Image Upload Form
app.get("/upload", (req, res) => {
  res.render("upload");
});

// Route: Handle Image Upload
app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;
  res.render("uploaded", { imageUrl });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});

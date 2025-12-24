const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");
const multer = require("multer");
const { spawn } = require("child_process");
const mongoose = require("mongoose");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------- BASIC SETUP ---------------- */

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "sorted-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none"
    }
  })
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

/* ---------------- DB ---------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error(err));

/* ---------------- MODELS ---------------- */

const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const GroupSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId,
  faces: Array
});

const User = mongoose.model("User", UserSchema);
const Group = mongoose.model("Group", GroupSchema);

/* ---------------- AUTH ---------------- */

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  await User.create({ email, password });
  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: "invalid" });
  req.session.userId = user._id;
  res.json({ ok: true });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

function auth(req, res, next) {
  if (!req.session.userId) return res.redirect("/index.html");
  next();
}

/* ---------------- FACE EMBED ---------------- */
// app.post("/face-embed", upload.single("image"), async (req, res) => {
//   try {
//     const imgPath = path.join(__dirname, "tmp.jpg");
//     await fs.writeFile(imgPath, req.file.buffer);

//     const py = spawn("python3", [
//       path.join(__dirname, "face_embed.py"),  // ← YOUR ORIGINAL
//       imgPath
//     ]);

//     let out = "", err = "";
//     py.stdout.on("data", d => out += d.toString());
//     py.stderr.on("data", d => err += d.toString());

//     py.on("close", async code => {
//       await fs.unlink(imgPath);
//       if (code !== 0) {
//         console.error(err);
//         return res.status(500).json({ error: "face embed failed" });
//       }
//       res.json(JSON.parse(out));
//     });
//   } catch (e) {
//     res.status(500).json({ error: "face embed failed" });
//   }
// });


// app.post("/face-embed", upload.single("image"), async (req, res) => {
//   try {
//     const imgPath = path.join(__dirname, "tmp.jpg");
//     await fs.writeFile(imgPath, req.file.buffer);

//     const py = spawn("python3", [
//       path.join(__dirname, "face_embed.py.py"),
//       imgPath
//     ]);

//     let out = "";
//     let err = "";

//     py.stdout.on("data", d => out += d.toString());
//     py.stderr.on("data", d => err += d.toString());

//     py.on("close", async code => {
//       await fs.unlink(imgPath);
//       if (code !== 0) {
//         console.error(err);
//         return res.status(500).json({ error: "face embed failed" });
//       }
//       res.json(JSON.parse(out));
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "face embed failed" });
//   }
// });

// app.post("/face-embed", upload.single("image"), async (req, res) => {
//   try {
//     const faceRes = await fetch('http://localhost:5000/embed', {
//       method: 'POST',
//       headers: { 'Content-Type': 'multipart/form-data' },
//       body: JSON.stringify({ image: req.file.buffer.toString('base64') }) // Simple for now
//     });
    
//     const data = await faceRes.json();
//     if (!faceRes.ok) throw new Error(data.error);
//     res.json(data);
//   } catch (e) {
//     console.error('Face service error:', e);
//     res.status(500).json({ error: "face embed failed" });
//   }
// });

// app.post("/face-embed", upload.single("image"), async (req, res) => {
//   console.log("FACE-EMBED CALLED", req.file?.originalname);
  
//   try {
//     const imgPath = path.join(__dirname, "tmp.jpg");
//     await fs.writeFile(imgPath, req.file.buffer);
//     console.log("IMAGE SAVED TO", imgPath);

//     const py = spawn("python3", [
//       path.join(__dirname, "face_embed.py"), 
//       imgPath
//     ]);

//     let out = "", err = "";
//     py.stdout.on("data", d => {
//       out += d.toString();
//       console.log("PYTHON STDOUT:", d.toString());
//     });
//     py.stderr.on("data", d => {
//       err += d.toString();
//       console.log("PYTHON STDERR:", d.toString());
//     });

//     py.on("close", async code => {
//       console.log("PYTHON EXIT CODE:", code);
//       console.log("PYTHON STDOUT FULL:", out);
//       console.log("PYTHON STDERR FULL:", err);
      
//       await fs.unlink(imgPath).catch(() => {});
      
//       if (code !== 0) {
//         return res.status(500).json({ 
//           error: "face embed failed", 
//           code, out, err 
//         });
//       }
//       res.json(JSON.parse(out));
//     });
//   } catch (e) {
//     console.error("FACE-EMBED ERROR:", e);
//     res.status(500).json({ error: "face embed failed" });
//   }
// });

// app.post("/face-embed", upload.single("image"), async (req, res) => {
//   try {
//     const imgPath = path.join(__dirname, "tmp.jpg");
//     await fs.writeFile(imgPath, req.file.buffer);

//     const py = spawn("python3", [
//       path.join(__dirname, "face_embed.py"), 
//       imgPath
//     ]);

//     let out = "";
//     let err = "";

//     py.stdout.on("data", (d) => out += d.toString());
//     py.stderr.on("data", (d) => err += d.toString());

//     py.on("close", async (code) => {
//       await fs.unlink(imgPath).catch(() => {});
      
//       console.log("Python exit code:", code);
//       console.log("Python stdout:", out.trim());
//       console.log("Python stderr:", err.trim());

//       // FIX: Only parse JSON if exit code 0 AND starts with '{'
//       if (code !== 0 || !out.trim().startsWith('{')) {
//         return res.status(500).json({ 
//           error: "face embed failed", 
//           code, 
//           stderr: err.trim(),
//           stdout: out.trim()
//         });
//       }

//       try {
//         const data = JSON.parse(out.trim());
//         res.json(data);
//       } catch (parseErr) {
//         res.status(500).json({ 
//           error: "invalid json response", 
//           raw: out.trim()
//         });
//       }
//     });
//   } catch (e) {
//     console.error("Face embed error:", e);
//     res.status(500).json({ error: "face embed failed" });
//   }
// });

app.post("/face-embed", upload.single("image"), async (req, res) => {
  const form = new FormData();
  form.append('image', req.file.buffer, req.file.originalname);
  
  const pyRes = await fetch('http://localhost:5000/embed', {
    method: 'POST', body: form
  });
  res.json(await pyRes.json());
});


/* ---------------- GROUPS ---------------- */

app.post("/create-group", auth, async (req, res) => {
  const { name } = req.body;
  await Group.create({ name, owner: req.session.userId, faces: [] });
  res.json({ ok: true });
});

app.post("/add-face", auth, async (req, res) => {
  const { groupId, embedding, personName } = req.body;
  await Group.updateOne(
    { _id: groupId },
    { $push: { faces: { embedding, personName } } }
  );
  res.json({ ok: true });
});

app.get("/groups", auth, async (req, res) => {
  const groups = await Group.find({ owner: req.session.userId });
  res.json(groups);
});

/* ---------------- STATIC ---------------- */

app.use(express.static(path.join(__dirname, "docs")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "index.html"));
});

/* ---------------- START ---------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Running on", PORT);
});

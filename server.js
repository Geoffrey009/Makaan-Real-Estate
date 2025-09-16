import express from "express";

const app = express();

app.get("/", (req, res) => res.send("Hello world"));

app.listen(5000, () => console.log("✅ Server running on 5000"));

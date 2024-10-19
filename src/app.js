import express, { json } from "express";

const app = express();

app.use(json());

app.post("/api", (req, res) => {
  console.log(req.body);
  console.log("hello world");
  res.send("hello world");
});

const PORT = 3000;

console.log("oi");

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;

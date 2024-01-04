import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "admin",
  port: "5432"
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = []; //used in case is no db available, the items will be "stored" in this array

app.get("/", async (req, res) => { //make sure to add always async function in order to use await
  try { //try/catch - do this, else display error.
    const result = await db.query("SELECT * FROM items ORDER BY id ASC"); //await until query is received and then proceed with next step
    items = result.rows;

    const todayDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    res.render("index.ejs", {
      listTitle: "To do list - " + todayDate,
      listItems: items,
    });
  } catch (err) {
    console.log(err)
  };
});

app.post("/add", async (req, res) => { //don't forget async
  const item = req.body.newItem; //add it using body parser
  //items.push({ title: item }); - we could use this if we work without DB and store it in the items array above (in memory)
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]); // insert into items table on title column the "item" value
    res.redirect("/"); //redirect to get where it will retrive all of the new data from db
  } catch (err) {
    console.log(err);
  };
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]); //first updated is the item ($1) and secondly the id ($2)
    res.redirect("/");
  } catch (err) {
    console.log(err);
  };
});

app.post("/delete", async (req, res) => {
  console.log("Request Body:", req.body);
  const id = req.body.deleteItemId;
  console.log("ID:", id);
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    console.log(id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

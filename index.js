import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const port = 3000;

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
let htmlContent;
app.use(express.static("public"));
app.use(urlencodedParser);

async function connectToMongoDB() {
  try {
    // Your MongoDB connection code here
    await mongoose.connect(
      "mongodb+srv://VanVuong:Vuong712219@atlascluster.wlbvsbu.mongodb.net/todoListDB",
      { useNewUrlParser: true }
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongoDB();
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
app.get("/", (req, res) => {
  Item.find()
    .then((data) => {
      res.render("home.ejs", {
        titleListName: "today",
        jobs: data,
        htmlContent: htmlContent,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/:listName", (req, res) => {
  const listName = _.lowerCase(req.params.listName);

  List.findOne({ name: listName })
    .then((results) => {
      if (!results) {
        Item.find()
          .then((data) => {
            const list = new List({
              name: listName,
              items: data,
            });
            list.save();
            res.redirect("/" + listName);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.render("home.ejs", {
          titleListName: results.name,
          jobs: results.items,
          htmlContent: htmlContent,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/", (req, res) => {
  const itemName = req.body.job;
  const listName = req.body.listname;
  if (itemName === "" || null) {
    htmlContent = "<h2 class='mess'> Nhập công việc của bạn </h2>";
    res.redirect("/");
  } else {
    const newItem = new Item({
      name: itemName,
    });
    newItem.save();
    htmlContent = "";
    if (listName === "today") {
      res.redirect("/");
    } else {
      List.findOne({ name: listName })
        .then((findList) => {
          findList.items.push(newItem);
          findList.save();
          res.redirect("/" + listName);
        })
        .catch((err) => {});
    }
  }
});
app.delete("/delete/:listname/:id", (req, res) => {
  const id = req.params.id;
  const listName = req.params.listname;
  console.log(listName);
  if (listName === "today") {
    Item.findByIdAndRemove(id)
      .then((results) => {
        console.log("delete success");
        res.status(200).json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ success: false });
      });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: id } } })
      .then((result) => {
        res.status(200).json({ success: true });
      })
      .catch((err) => {
        res.status(500).json({ success: false });
      });
  }
});
app.listen(port, () => {
  console.log("listening on port " + port);
});

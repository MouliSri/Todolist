const express = require("express");
const bodyparser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();


app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect({mongodbUrl},{useNewUrlParser:true});

const itemsschema = {
  name:String
}

const Item=mongoose.model("Item",itemsschema)

const item1 =new Item({
  name:"welcome to the todolist"
});

const item2 = new Item({
  name:"Hit the + button to add"
})

const item3 = new Item({
 name:"hit this --> to delete"
})

const defaultItems=[item1,item2,item3];

const listschema=({
  name:String,
  items:[itemsschema]
})

const List=mongoose.model("List",listschema);

app.get("/", function(req, res) {

  Item.find({},function(err,founditems){

    if(founditems.length===0){

      Item.insertMany(defaultItems,function(err){
        if (err){
         console.log(err);
       }else
        {
         console.log("sucessfully")
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle:"today" , newlistitems: founditems });
      }
  });


});

app.get("/:customListName",function(req,res)
{
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList)
  {
     if(!err){
       if(foundList){
        res.render("list", { listTitle:foundList.name , newlistitems: foundList.items });
       }
       else{
         console.log("not exist");
         const list =new List({
           name:customListName,
           items:defaultItems
         });
           list.save();
           res.redirect("/"+customListName);
       }
     }
  })


});

app.post("/", function(req,res)
{
  const itemname=req.body.newItem;
  const listname=req.body.list;

  const item=new Item({
    name:itemname
  });
  if(listname==="today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listname},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listname)
  })
}

})
app.post("/delete",function(req,res){
  const itemid=req.body.checkbox;
  const listname=req.body.listname;

if(listname=="today"){
  Item.findByIdAndRemove(itemid,function(err)
{
  if(!err){
  res.redirect("/")
}
});

}
else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}},function(err,foundList)
{
  if(!err){
  res.redirect("/" +listname);
     }

})
}
})

//let port=process.env.PORT;
//IF(port == null || port==""){
//port = 3000;
//}


app.listen(3000, function(req, res) {
  console.log("the server started has started successfully");
})

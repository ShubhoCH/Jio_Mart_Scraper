const mongoose = require("mongoose");
// DATABASE
mongoose.connect("mongodb://localhost:27017/JioMart_Data");

// Schema:
const itemSchema = {
    title: String,
    price: String
};

exports.addToDB = async function(name, data){
    let collectionName = "";
    for(let x of name){
        if(x != " " && x != "&")
            collectionName += x;
    }
    const Item = new mongoose.model(collectionName, itemSchema);
    try{
        const arr = [];
        for(let ele of data){
            const item = new Item({
                title: ele.name,
                price: ele.price
            })
            //await item.save();
            arr.push(item);
        }
        await Item.insertMany(arr);
        console.log("=====Successfully added to Database!=====");
    }catch(err){
        console.log(err);
    }
}
// exports.test = async function(name, data){
//     let collectionName = "";
//     for(let x of name){
//         if(x != " ")
//             collectionName += x;
//     }
//     console.log(collectionName);
//     for(let ele of data){
//         console.log(ele.price);
//     }
//     return collectionName;
// } 
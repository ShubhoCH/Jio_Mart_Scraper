const mongoose = require("mongoose");
// DATABASE
mongoose.connect("mongodb://localhost:27017/JioMart_Test");

// Schema:
const itemSchema = {
    Name: String,
    Brand: String,
    CategoryL1: String,
    CategoryL2: String,
    City: String,
    MRP: String,
    SP: String,
    Image: String,
    DetailPageLink: String
};
const Data = new mongoose.model('JioMart', itemSchema);
exports.addToDB = async function(city, categoryL1, categoryL2, data){
    try{
        const arr = [];
        for(let ele of data){
            const item = new Data({
                Name: ele.name,
                Brand: ele.brand,
                CategoryL1: categoryL1,
                CategoryL2 : categoryL2,
                City: city,
                MRP: ele.MRP,
                SP: ele.SP,
                Image: ele.image,
                DetailPageLink: ele.link
            })
            // await item.save();
            arr.push(item);
        }
        //console.log(arr);
        await Data.insertMany(arr);
        console.log("=====Successfully added to Database!=====");
    }catch(err){
        console.log(err);
    }
}
// exports.dropCollections = async function(collections){
//     mongoose.collection("customers").drop(function(err, delOK) {
//         if (err) throw err;
//         if (delOK) console.log("Collection deleted");
//         db.close();
//     });
// }
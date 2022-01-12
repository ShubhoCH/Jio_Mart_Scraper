const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const db = require(__dirname + '/dbManager');
const cities = require(__dirname + '/cities');

//Increase Event Listner MaxLimit (Just in case needed someday):
const EventEmitter = require('events');
const { mainModule } = require('process');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
// Increase the limit
myEmitter.setMaxListeners(100);

const url = 'https://www.jiomart.com';
const cityDetails = cities.getCities();

async function startScrapping(){
    // Loop through each City for extraction:
    for(const city of cityDetails){
        console.log("Started with city: "+ city.cityName);
        await getItems(city);
        console.log("Done with city: "+ city.cityName);
    }
    console.log("Finished!!!!!");
}

// Get all the Items from the current Page:
async function getItems(city){
    try {
        const categories = [];
        // Make headless: true in production;
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(url);
        await page.click('.delivery_content');
        await page.type('#rel_pincode', city.pincode);
        await page.click('.apply_btn');
        // Get All Categories from the website for the Current City:
        await getCategories(page, categories)
        console.log(categories);
        for(const category of categories){
            let obj = {
                loop: true,
                url: category.categoryLink,
                pageNumber: 1,
                categoryItems: []
            }
            while(obj.loop){
                await page.goto(obj.url);
                await checkPrice(page, obj);
            }
            // Add all the Items in the DataBase:
            console.log("==========> " + category.categoryL2);
            if(obj.categoryItems.length > 0)
                db.addToDB(city.cityName, category.categoryL1, category.categoryL2, obj.categoryItems);
            else
                console.log("Not Enough Items to add in Database!");
        }
        browser.close();
    } catch (e) {
        console.log(e);
    }
}

// Collect all the Name's of Categories along with their Url's
async function getCategories(page, categories) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    //Get All Category with Sub-Category:
    $('.o-menu').each(function() {
        const categoryL1 = $(this).find('a').first().text().trim();
        $(this).find('ul').find('a').each(function(){
            let categoryL2 = $(this).text().trim();
            let categoryLink = $(this).attr('href');
            categories.push({
                categoryL1,
                categoryL2,
                categoryLink
            })
        });
    });
}

// Collect all the name and price of each product for the current category:
async function checkPrice(page, OBJ) {
    try {
        await page.reload();
        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        if($('#product_count').attr('value') === '0'){
            OBJ.loop = false;
            return;
        } 
        $('.col-md-3').each(function() {
            let MRP = $(this).find('.price-box #price').text();
            let temp = "";
            for(let i=0;i<MRP.length;i++)
                if(i>1)
                    temp+=MRP[i];
            MRP=temp;
            let SP = $(this).find('.price-box #final_price').text();
            temp = "";
            for(let i=0;i<SP.length;i++)
                if(i>1)
                    temp+=SP[i];
            SP=temp;
            let name = $(this).find('.clsgetname').text();
            let brand = $(this).find(".drug-varients").text();
            // console.log(brand);
            let image = $(this).find(".product-image-photo").attr('src');
            let link = 'https://www.jiomart.com' + $(this).find(".prod-name").attr('href');
            OBJ.categoryItems.push({
                name,
                brand,
                MRP,
                SP,
                image,
                link
            })
        });
        console.log("Page Number: " + OBJ.pageNumber + "::::::::::::::::::::");
        if($('.pages .next').text() === 'NEXT' && OBJ.pageNumber < 100){
            OBJ.url = $('.next').find("a").attr('href');
            OBJ.pageNumber += 1;
        }
        else
            OBJ.loop = false;
    } catch (e) {
        console.log(e);
    }
}

// Re-extract Data after every Day at 10 o'clock: 
//(for testing use:   */30 * * * * * {every 30 sec})
schedule.scheduleJob('0 0 10 * * *', startScrapping);

//STARTS_HERE:
startScrapping();
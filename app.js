const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const db = require(__dirname + '/dbManager');

const url = 'https://www.jiomart.com';
const categories = [];

// Get All Categories from the website:
async function getCategories(){
    let page = await configureBrowser(url);
    await addCategories(page);
}

// Collect all the Name's of Categories along with their Url's
async function addCategories(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);
    $('.o-menu').each(function() {
        let categoryName = $(this).find('a').first().text();
        let categoryLink = $(this).find('a').first().attr('href');
        categories.push({
            categoryName,
            categoryLink
        })
    });
    // Loop through each category for extraction:
    for(let category of categories){
        getItems(category.categoryLink, category.categoryName);
    }
}

// Get all the Items from the current Page:
async function getItems(link, name){
    console.log("Here");
    let obj = {
        loop: true,
        url: link,
        pageNumber: 1,
        categoryItems: []
    }
    while(obj.loop){
        let page = await configureBrowser(obj.url);
        obj = await checkPrice(page, obj);
    }
    // Add all the Items in the DataBase:
    db.addToDB(name, obj.categoryItems);
}

// Collect all the name and price of each product for the current category:
async function checkPrice(page, OBJ) {
    const Items = [];
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);
    $('.cat-item').each(function() {
        let price = $(this).find('.price-box #final_price').text();
        let name = $(this).find('.clsgetname').text();
        OBJ.categoryItems.push({
            name,
            price
        })
    });
    console.log(OBJ.pageNumber + "::::::::::::::::::::");
    if($('.pages .next').text() === 'NEXT' && OBJ.pageNumber < 100){
        OBJ.url = $('.pages .next').find("a").attr('href');
        OBJ.pageNumber += 1;
    }
    else
        OBJ.loop = false;
    return OBJ;
}

async function configureBrowser(URL) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
    return page;
}

// Re-extract Data after every Day at 10 o'clock: 
//(for testing use:   */30 * * * * * {every 30 sec})
schedule.scheduleJob('0 0 10 * * *', getCategories);

//RUN:
getCategories();
// getItems('https://www.jiomart.com/c/groceries/fruits-vegetables/219/page/1', 'FruitsVegetables', 1);
// getItems('https://www.jiomart.com/c/groceries/dairy-bakery/61', 'DairyBakery', 1);
// getItems('https://www.jiomart.com/c/groceries/premium-fruits/3107', 'PremiumFruits', 1);
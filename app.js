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
    let page = await configureBrowser(link);
    await checkPrice(page, name);
}

// Collect all the name and price of each product for the current category:
async function checkPrice(page, name) {
    const Items = []
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);
    $('.cat-item').each(function() {
        let price = $(this).find('.price-box #final_price').text();
        let name = $(this).find('.clsgetname').text();
        Items.push({
            name,
            price
        })
    });
    // Add all the Items in the DataBase:
    db.addToDB(name, Items);
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
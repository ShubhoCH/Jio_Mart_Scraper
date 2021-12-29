# Jio-Mart Scraper

Scrap all the categories from the Jio-Mart Website!

## Installation

Download the project from github then go to project directory inside the project and type the following command to install all the required dependencies for the project!

```bash
pip i
```

## Usage

#### Please make sure You have MongoDB installed in your system!
In order to start the project type the following bash command:

```bash
node app.js
```
This will start the project and collect all the required data and store them in JioMart_Data Database under different collections for each category named after the category itself!

## Check for Data stored in Database:
Open new CMD window and type:
```bash
monog
```
This will trigger the Mongo Shell. After that type the following commands:
```bash
show dbs
use JioMart_Data
show collections
db.<collection_name_found_from_above_command>.find().pretty()
```
This will show all the retrived data for that perticular collection!
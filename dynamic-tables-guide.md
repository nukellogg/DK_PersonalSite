# How to Update Tables Dynamically

This guide explains how to modify the `js/policy-and-practice-script.js` file to load data for the tables from an external source, such as a Google Sheet or a JSON file.

This will allow you to update the content of the tables without having to change the HTML code of the website.

## 1. Prepare Your Data Source

First, you need a data source that returns data in JSON format. The data should be an array of objects, where each object represents a row in the table.

### Example JSON Data

For the "Op-eds / Blogs" table, the JSON data should look like this:

```json
[
  {
    "title": "This is the title of the first op-ed",
    "url": "https://www.example.com/oped-1",
    "date": "2023-10-26",
    "outlet": "The New York Times",
    "authors": "John Doe"
  },
  {
    "title": "This is the title of the second op-ed",
    "url": "https://www.example.com/oped-2",
    "date": "2023-09-15",
    "outlet": "The Wall Street Journal",
    "authors": "Jane Smith"
  }
]
```

For the simpler tables like "Media, Podcasts, and Public Talks", the JSON data can be simpler:

```json
[
  {
    "title": "Example Podcast 1",
    "url": "#"
  },
  {
    "title": "Example Media Appearance 2",
    "url": "#"
  }
]
```

### Using Google Apps Script

The original website used Google Apps Script to get data from a Google Sheet. This is a good option if you want to manage your data in a spreadsheet.

You can create a Google Apps Script that reads the data from your sheet and returns it in JSON format. You can find many tutorials online on how to do this.

Once you have your script, you will get a URL for it. You will use this URL in the next step.

## 2. Modify the JavaScript File

Next, you need to modify the `js/policy-and-practice-script.js` file to load the data from your data source.

1.  Open the file `js/policy-and-practice-script.js`.
2.  Find the `createTable` function.
3.  Modify the function to use the `ajaxURL` option instead of the `data` option.

Here is the original `createTable` function:

```javascript
function createTable(tableId, data, columns) {
    new Tabulator(tableId, {
        data: data,
        layout: "fitDataFill",
        columns: columns,
    });
}
```

Here is the modified `createTable` function that loads data from a URL:

```javascript
function createTable(tableId, ajaxURL, columns) {
    new Tabulator(tableId, {
        ajaxURL: ajaxURL, // URL to your data source
        layout: "fitDataFill",
        columns: columns,
    });
}
```

Finally, you need to update the calls to the `createTable` function to pass the URL of your data source instead of the placeholder data.

For example, to load the data for the "Op-eds / Blogs" table, you would change this:

```javascript
createTable("#opeds-blogs-table", opedsBlogsData, opedsBlogsColumns);
```

To this:

```javascript
createTable("#opeds-blogs-table", "https://your-google-script-url/exec", opedsBlogsColumns);
```

Replace `"https://your-google-script-url/exec"` with the actual URL of your data source.

You will need to do this for each of the five tables on the page.

By following these steps, you can dynamically load the data for the tables from an external source, making it easy to update the content without changing the website's code.

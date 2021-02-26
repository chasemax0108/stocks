//api key: sandbox_c0s3ubn48v6qv0009hb0
//api documentation: https://iexcloud.io/docs/api/


/*
TODO: Switch to finnhub
- Get API Key
- Rewrite the getInfoFromServer so that it uses the new API correctly
- Rewrite the actual field grabs throughout your HTML functions
*/

const APIADDRESS = "https://finnhub.io/api/v1/";
const APIKEY = "c0s3ubn48v6qv0009hag";

function searchStocks(e) {
    e.preventDefault();
    document.querySelectorAll(".stock-lookup").forEach((a) => a.remove());  
    updateSearchStocks();
}

async function updateSearchStocks() {
    let searchAddress = APIADDRESS + "search?q=" + document.getElementById("search-field").value + "&token=" + APIKEY;
    let searchResponse = await fetch(searchAddress);
    let searchResults = await searchResponse.json();
    let stocks = extractSearchStocks(searchResults);
    queueSearchResults(stocks);
}

function extractSearchStocks(jsonResponse) {
    let allStocks = jsonResponse.result;
    let stocks = [];
    for (i of allStocks) {
        stocks.push(i.symbol);
    }
    return stocks;
}

function queueSearchResults(stockNames) {
    let timeAmount = 0;
    for (let stock of stockNames) {
        setTimeout(() => getSearchResult(stock), timeAmount);
        timeAmount += 100; // delay because otherwise we'll trigger too many requests
        if (timeAmount > 500) break;
    }
}

function getSearchResult(stock) {
    getInfoFromServer("stock/profile2", stock).then((json) => addSearchResult(stock, json));
}

function addSearchResult(stock, json) {
    if (!("name" in json)) return;
    //if (json.name.search(".") != -1) return;
    let resultBox = document.getElementById("search-results");
    let newResult = document.createElement("div");
    newResult.setAttribute("class", "stock-lookup");
    newResult.setAttribute("stock-name", stock);
    resultBox.appendChild(newResult);
    
    let newHTML = "";
    newHTML += '<div class="stock-lookup-header">';
    newHTML += '<h2>' + stock + '</h2>';
    newHTML += '<h3>' + json.name.substr(0, 20) + '</h3>';
    newHTML += '</div>';
    newHTML += '<div class="stock-data">';
    newHTML += getStockDataHTML("Exchanged on: ", json.exchange);
    newHTML += getStockDataHTML("Market cap: ", json.marketCapitalization);
    newHTML += getStockDataHTML("Industry: ", json.finnhubIndustry);
    newHTML += getStockDataHTML("Country: ", json.country);
    newHTML += '</div>';

    newResult.innerHTML = newHTML;

    newResult.addEventListener("click", function() {updatePrimaryStock(this)});
}

function getStockDataHTML(text, data) {
    let html = "";
    html += '<div class="stock-data-item">';
    html += '<p>' + text + data + '</p>';
    html += '</div>';
    return html;
}

async function getInfoFromServer(data, stock) {
    let searchAddress = "";
    if (data == "news") searchAddress = APIADDRESS + "company-news?symbol=" + stock + "&from=2021-01-24&to=2021-02-24&token=" + APIKEY;
    else searchAddress = APIADDRESS + data + "?symbol=" + stock + "&token=" + APIKEY;
    let response = await fetch(searchAddress);
    if (response.ok) return await response.json();
    else return null;
}

async function updatePrimaryStock(stockDiv) {
    let stock = stockDiv.getAttribute("stock-name");
    let stockInfo = await getInfoFromServer("quote", stock);
    let companyInfo = await getInfoFromServer("stock/profile2", stock);
    let news = await getInfoFromServer("news", stock);

    updatePrimaryHTML(stock, stockInfo, news, companyInfo);
}

function updatePrimaryHTML(stock, info, news, companyInfo) {
    if (stock == null || info == null || news == null || companyInfo == null) return;
    let mainDiv = document.getElementById("stock-panel");

    let newHTML = "";
    newHTML += '<div class="stock-info-panel">';
    newHTML += '<div class="logo-price">';
    newHTML += '<img src="';
    if (companyInfo.logo == "") {
        newHTML += "images/stock.png";
    }
    else {
        newHTML += companyInfo.logo;
    }
    newHTML += '">';
    newHTML += '<h2>$' + info.c + '<h2>';
    newHTML += '</div>';
    newHTML += '<div class="stock-info">'
    newHTML += '<div class="stock-header">';
    newHTML += '<h1>' + stock + '</h1>';
    newHTML += '<h2>' + companyInfo.name.substr(0, 30) + '</h2>';
    newHTML += '</div>';
    newHTML += '<div class="stock-data">';
    newHTML += getStockDataHTML("High: ", info.h);
    newHTML += getStockDataHTML("Low: ", info.l);
    newHTML += getStockDataHTML("Open Price: ", info.o);
    newHTML += getStockDataHTML("Exchanged on: ", companyInfo.exchange);
    newHTML += getStockDataHTML("Market cap: ", companyInfo.marketCapitalization);
    newHTML += getStockDataHTML("Industry: ", companyInfo.finnhubIndustry);
    newHTML += getStockDataHTML("Country: ", companyInfo.country);
    newHTML += '</div></div></div>';

    newHTML += '<div class="stock-news-panel">';
    let articleCount = 0;
    for (newsItem of news) {
        newHTML += getArticleHTML(newsItem);
        articleCount ++;
        if (articleCount > 4) break;
    }
    newHTML += '</div>';
    mainDiv.innerHTML = newHTML;
}

function getArticleHTML(newsItem) {
    let html = "";
    html += '<a class="news-article" href="' + newsItem.url + '" target="_blank">';
    html += '<div class="article-image">';
    html += '<img src="' + newsItem.image + '">';
    html += '</div>';
    html += '<div class="headline-summary">'
    html += '<h2>' + newsItem.headline + '</h2>';
    html += '<p>' + newsItem.summary + '</p>';
    html += '</div></a>';
    return html;
}

document.getElementById("search-button").addEventListener("click", function(event) {searchStocks(event)});
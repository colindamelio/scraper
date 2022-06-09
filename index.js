const PORT = process.env.PORT || 8800;
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const sites = require('./data');

const app = express();

const articles = [];

sites.forEach(async (site) => {
	try {
		const response = await fetch(site.url);
		const htmlData = await response.text();
	
		const $ = cheerio.load(htmlData);
	
		$('a:contains("Sports")', htmlData).each(function() {
			const title = $(this).text();
			const url = $(this).attr('href');
			articles.push({
				title,
				url: site.baseUrl + url,
				source: site.name
			})
		})
	}
	catch (error) {
		console.log(error)
	}	
});

app.get('/', (req, res) => {
	res.send(`<h1>Welcome to Sports</h1>`);
})

app.get('/sports', (req, res) => {
	res.json(articles);
});

app.get('/sports/:sourceId', async (req, res) => {

	const { sourceId } = req.params;

	const filteredSources = sites.filter(site => site.name == sourceId)[0].url;
	const filteredbaseUrl = sites.filter(site => site.name == sourceId)[0].baseUrl;
	

	const response = await fetch(filteredSources);
	const htmlData = await response.text();
	const $ = cheerio.load(htmlData);
	const sourcedArticles = [];

	$('a:contains("Sports")', htmlData).each(function() {
		const title = $(this).text();
		const url = $(this).attr('href');
		sourcedArticles.push({
			title,
			url: filteredbaseUrl + url,
			source: sourceId
		})
	})
	res.json(sourcedArticles)
});

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
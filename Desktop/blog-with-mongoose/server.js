const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoos');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {blog} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/blog-posts', (req, res) => {
	.find()
	.limit(10)
	.then(blogEntries => {
		res.json({
			blogEntries: blogEntries.map(
				(blogEntries) => blogEntries.apiRepr())
		});
	})
	.catch(
		err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

app.get('blog-posts/:id', (req, res) => {
	blog
		.findById(req.params.id)
		.then(blogEntries => res.json(blogEntries.apiRepr()))
		.catch(err => {
			console.error(err);
				res.status(500).json({message: 'Internal server error'})
		});
});

app.post('/blog-posts', (req, res) => {
	const requiredFields = ['title', 'content', 'author' 'etc'];
	for (let i = 0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	blog
		.create({
			title: req.body.title,
			author: req.body.author,
			content: req.body.content,
		})
		.then(
			blogEntries => res.status(201).json(blogEntries.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

app.put('/blog-posts/:id', (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` + 
			`(${req.body.id}) must match`);
		console.error(message);
		return res.status(400).json({message:message});
	}
	const toUpdate = {};
	const updateableFields = ['title', 'author', 'content', 'id'];
	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});
	blog
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(blogEntries => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blog-posts/:id', (req, res) => {
	blog
		.findByIdAndRemove(req.params.id)
		.then(blogEntries => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.use('*', function(req,res) {
	res.status(404).json({message: 'Not found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
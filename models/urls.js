var mongoose = require('mongoose');

var UrlSchema = new mongoose.Schema({
	url:{
		type: String,
		unique: true,
		required:true
	},
	id:{
		type: Number,
		required: true
	}
},{
	collection: 'URL'
})

var Url = mongoose.model('Url', UrlSchema);
module.exports = Url;
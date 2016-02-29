var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    horizontal: {type: String, default: ''},
    vertical: {type: String, default: ''},
    horizontal_small: {type: String, default: ''},
    default: {type: String, default: ''}
});

module.exports = mongoose.model('Images', ImageSchema);
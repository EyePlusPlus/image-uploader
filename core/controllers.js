var fs = require('fs');
var Busboy = require('busboy');
var ImageUploader = require(process.cwd() + '/core/ImageUploader').ImageUploader;
var getImage = require(process.cwd() + '/core/ImageUploader').getImage;
var layouts = [['horizontal', 755, 450], ['vertical', 365, 450], ['horizontal_small', 365, 212], ['default', 380, 380]];

module.exports.uploadCtrl = function(req, res) {

    var busboy = new Busboy({headers: req.headers});
    req.body = {};
    busboy.on('file', function(fieldname, file) {
        var imgData = [];
        file.on('data', function(data) {
            imgData.push(data);
        });

        file.on('end', function() {
            var buf = Buffer.concat(imgData);
            var img = new ImageUploader(buf, layouts);

            layouts.forEach(function(ele) {
                var layout = ele[0];
                var url = img.crop(layout, Number.parseInt(req.body[layout+'_X']), Number.parseInt(req.body[layout+'_Y']), function(err, url) {
                    
                    if (err) res.json(err);

                    img.save(layout, url, function(err, galleryUrl) {
                        if (err) res.json(err);

                        if (img.saveCount === 0)
                           res.send('<a href="/gallery/'+galleryUrl+'">View Gallery</a>');
                    });
                });
            });
        });
    });

    busboy.on('field', function(fieldname, val) {
        req.body[fieldname] = val;
    });
    req.pipe(busboy);

};

module.exports.galleryCtrl = function(req, res) {
    getImage(req.params.uri, function(err, img) {
        if (err) res.json(err);

        var rslt = {};
        
        layouts.forEach(function(ele){
            rslt[ele[0]] = img[ele[0]];
        });

        res.render('gallery', {img: rslt});
    });
};

module.exports.indexCtrl = function(req, res) {
    res.render('index', {layouts: layouts});
};
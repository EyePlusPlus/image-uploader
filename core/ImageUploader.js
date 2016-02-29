var inkjet = require('inkjet');
var fs = require('fs');
var clientId = require(process.cwd() + '/config/config').client_id;
var Images = require(process.cwd() + '/model/Image');

function ImageUploader(image, layouts) {
    var self = this;

    this.image = image;

    this.layouts = {};
    layouts.forEach(function(ele) {
        self.layouts[ele[0]] = {width: ele[1], height: ele[2]};
    });
    // this.layouts = {
    //     horizontal: {width: 755, height: 450},
    //     vertical: {width: 365, height: 450},
    //     horizontal_small: {width: 365, height: 212},
    //     default: {width: 380, height: 380}
    // };
    this.saveCount = Object.keys(this.layouts).length;

    var img = new Images();
    
    img.save(function(err, savedImg) {
        if (err) throw err;
        self.uri = savedImg._id;
    });
};

ImageUploader.prototype.crop = function(type, x, y, cb) {
    var self = this;
    var currentWidth = 1024;
    var newWidth = this.layouts[type].width;
    var newHeight = this.layouts[type].height;
    var newImgdata = new Buffer(newWidth * newHeight * 4);
    var idx = 0;
    var decodedData;

    inkjet.decode(this.image, function(err, decoded) {
        decodedData = decoded.data;
    });

    for (var i=0; i < newHeight; i++) {
        var strtIdx = ((y + i) * (currentWidth * 4)) + (x * 4);
        var endIdx = ((newWidth * 4) + (((y + i) * (currentWidth * 4))) + (x * 4)) - 1;
        for (var j = strtIdx; j <= endIdx; j++) {
            newImgdata[idx++] = decodedData[j];
        }
    }

    var options = {
        width: newWidth,
        height: newHeight,
    };

    inkjet.encode(newImgdata, options, function(err, encoded) {
        // return cb(null, fs.writeFileSync(self.uri+'.jpg', new Buffer(encoded.data)));
        return self.upload(new Buffer(encoded.data), cb);
    });
};

ImageUploader.prototype.upload = function(uploadData, cb) {
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "api.imgur.com",
        "path": "/3/upload",
        "headers": {
            "authorization": clientId
        }
    };

    var req = http.request(options, function(res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = JSON.parse(Buffer.concat(chunks).toString());
            
            if (body.success) {
                return cb(null, body.data.link);
            } else {
                return cb(body.data.error);
            }
        });
    });

    req.end(uploadData);
};

ImageUploader.prototype.save = function(type, url, cb) {
    this.saveCount--;
    
    Images.findOne({_id: this.uri}).exec(function(err, img) {
        if (err) cb(err);
        
        img[type] = url;
        
        img.save(function(err) {
            if (err) cb(err)
            return cb(null, img['_id']);
        });
    });
};

module.exports.ImageUploader = ImageUploader;

module.exports.getImage = function(uri, cb) {
    Images.findOne({_id: uri}).exec(function(err, img) {
        if (err) cb(err);
                
        return cb(null, img);
    })
}


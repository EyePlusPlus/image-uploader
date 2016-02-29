var recommendedWidth = 1024;
var recommendedHeight = 1024;
var validForm = true;
var canv = [];

function Canvas(canvId, w, h) {
    var self = this;
    this.canvId = canvId;
    this.canv = document.getElementById(canvId);
    this.ctx = this.canv.getContext('2d');
    this.prevX = 0;
    this.prevY = 0;
    this.startX = 0;
    this.startY = 0;
    this.width = Number.parseInt(w);
    this.height = Number.parseInt(h);
    this.dragFlag = false;
    this.img = '';
    this.canv.addEventListener('mousedown', function(evt) {
        self.prevX = evt.layerX;
        self.prevY = evt.layerY;
        self.dragFlag = true;
    });
    this.canv.addEventListener('mousemove', function(evt) {
        if (self.dragFlag) {
            var newX = Number.parseInt((evt.layerX - self.prevX)/5);
            var newY = Number.parseInt((evt.layerY - self.prevY)/5);

            newX += self.startX; 
            newY += self.startY; 

            if (newX >= 0 && (newX + self.width) <= recommendedWidth) {
                self.startX = newX;
            }

            if (newY >= 0 && (newY + self.height) <= recommendedHeight) {
                self.startY = newY;
            }

            self.draw();
        }
    });

};

Canvas.prototype.draw = function() {
    this.ctx.clearRect(0, 0, recommendedWidth, recommendedWidth);
    this.drawImage();
    this.ctx.strokeRect(this.startX, this.startY, this.width, this.height);
}

Canvas.prototype.drawImage = function() {
    this.ctx.drawImage(this.img, 0, 0,this.img.width, this.img.height)
}

window.onload = function() {
    var c = document.getElementsByTagName('canvas');
    for (var i=0; i < c.length; i++) {
        canv[i] = new Canvas(c[i].id, c[i].dataset.width, c[i].dataset.height);
    }

    document.addEventListener('mouseup', function() {
        canv.forEach(function(c) {
            c.dragFlag = false;
            var attr = c.canvId.split('_canvas');
            document.getElementsByName(attr[0]+'_X')[0].value = c.startX;
            document.getElementsByName(attr[0]+'_Y')[0].value = c.startY;
        });
    });
};

window.formSubmit = function() {
    if (!validForm) {
        alert('The image is not the recommended size!');
    }

    return validForm;
}

window.fileInspector = function(file) {
    var img = new Image();
    img.onload = function() {
        if (this.width != recommendedWidth && this.height != recommendedHeight) {
            validForm = false;
        } else {
            validForm = true;
        }
        canv.forEach(function(c) {
            c.img = img;
            c.draw();
        });
    };
    img.src = URL.createObjectURL(file.files[0]);
}
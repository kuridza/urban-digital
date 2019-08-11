var UrbanDigital = function(element) {
	this.randomColor = function() {
		return ((1<<24)*Math.random()|0).toString(16);
	}
	this.element = element || document.body;
	this.preventRandomize = false;
	this.isAnimate = false;
	this.colors = [];
	this.colorRange = 40;
	this.bad = .05;
	this.background = this.randomColor();
	this.innerColor = this.randomColor();
	this.setShape = function(shape) {
		this.shape = shape;
		if(! shape) return;
		this.shape.reshape(this.width, this.height, this.dSize);
	}
	this.setColors = function(colors) {
		this.colors = colors;
		this.preventRandomizeColor = true;
	}
	this.colorsNumber = function(n) {
		this.colors = Array(n).fill(0);
		this.randomizeColors();
	}
	this.setDotSize = function(size) {
		this.dSize = size;
		this.preventRandomizeSize = true;
	}
	this.setColorRange = function(range) {
		this.colorRange = range;
	}
	this.setBad = function(bad) {
		this.bad = bad;
	}
	this.preventRandomizeBackground = false;
	this.setBackground = function(background) {
		this.background = background;
		this.preventRandomizeBackground = true;
	}
	this.preventRandomizeInner = false;
	this.setInner = function(inner) {
		this.innerColor = inner;
		this.preventRandomizeInner = true;
	}
	this.create = function (width, height) {
		this.width = width || this.element.parentElement.clientWidth;
		this.height = height || this.element.parentElement.scrollHeight;
		var canvas = document.createElement('canvas');
		this.element.appendChild(canvas);
		var self = this;
		canvas.addEventListener('click', function() {
			self.randomizeColors();
			self.randomizeSize();
			self.draw();
		});
		canvas.addEventListener('dblclick', function() {
			if(self.isAnimate) {
				clearInterval(self.isAnimate);
				self.isAnimate = false;
			} else {
				self.animate();
			}				
		});
		canvas.width = this.width;
		canvas.height = this.height;
		this.ctx = canvas.getContext('2d');
	}
	this.resize = function (width, height) {
		this.width = width;
		this.height = height;
		var canvas = this.element.querySelector('canvas');
		canvas.width = width;
		canvas.height = height;
		this.draw();
	}
	this.randomizeColors = function() {
		if(! this.preventRandomizeBackground) this.background = this.randomColor();
		if(! this.preventRandomizeInner) this.innerColor = this.invertColor(this.background);
		if(! this.preventRandomizeColor) {
			var self = this;
			this.colors = this.colors.map(function(e) {
				return self.randomColor();
			});
		}
	}
	this.randomizeSize = function() {
		if(! this.preventRandomizeSize) {
			this.dSize = this.random(5, 10);			
		}
		var w = this.width / this.dSize;
		var h = this.height / this.dSize;
		this.offset = (this.dSize - (this.width % this.dSize)) / 2;
		this.shape && this.shape.reshape(this.width, this.height, this.dSize);
	}
	this.animate = function(ms) {
		ms = ms || 70;
		this.draw();
		this.randomizeColors();
		this.randomizeSize();
		this.isAnimate = setInterval(this.drawDots.bind(null, this), ms);
	}
	this.drawDots = function(ud) {
		var d = ud.dSize;
		if(Math.random() < ud.width / d * .0001) {
			ud.randomizeColors();
			ud.randomizeSize();
		}
		for(var k = 0; k <= ud.width / d; k++) {
			var i = ud.random(0, (ud.width / d) + 1);
			var j = ud.random(0, (ud.height / d) + 1);
			ud.drawDot(ud.ctx, i, j, d)
		}
	}
	this.drawDot = function(ctx, i, j, d) {
		if(this.shape && this.shape.inShape(i + this.offset / this.dSize, j)) {
		   ctx.fillStyle = this.shadeColor(this.innerColor, 40);
		} else {
			ctx.fillStyle = this.shadeColor();
		}			
		ctx.fillRect(i * d - this.offset, j * d - this.offset, d, d);
	}
	this.draw = function(self) {
		this.randomizeColors();
		this.randomizeSize();
		self = self || this;
		var d = self.dSize;
		for(i = 0; i <= self.width / d; i++) {
			for(j = 0; j <= self.height / d; j++) {
				self.drawDot(self.ctx, i, j, d);
			}
		}
	}
	this.redraw = function(microseconds) {
		this.draw();
		var self = this;
		setInterval(function() {
			self.draw();
			self.randomizeColors();
		}, microseconds);
	}
	this.shadeColor = function(color, range) {
		if(! color) {
			if(this.background && this.random(1,5) > 1) {
				color = this.background;
			} else {
				color = this.colors[this.random(0, this.colors.length)];
			}			
		}
		color = Math.random() < this.bad ? this.randomColor() : color;
		range = range || this.colorRange;
		var percent = this.random(-range, range);
		var num = parseInt(color,16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
		return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
	}
	this.random = function(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	this.invertColor = function(hex) {
		var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
			g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
			b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
		return this.padZero(r) + this.padZero(g) + this.padZero(b);
	}
	this.padZero = function(str, len) {
		len = len || 2;
		var zeros = new Array(len).join('0');
		return (zeros + str).slice(-len);
	}
}

var SmileyShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.area = [
			[[ w/ 5, w * 2 / 5],[ h/ 5, h * 2 / 5],],
			[[ w * 3/ 5, w * 4 / 5],[ h/ 5, h * 2 / 5],],
			[[ w / 5, w * 4 / 5],[ h * 3/ 5, h * 4 / 5],],
		];
	}
	this.inShape = function(x, y) {
		var found = false;
		this.area.forEach(function(e) {
			if(x > e[0][0] && x < e[0][1] && y > e[1][0] && y < e[1][1]) {
			   found = true;
			}
		});
		return found;
	}
}
var CircleShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.r = Math.min(w,h);
		this.center = Math.min(w,h)/2;
	}
	this.inShape = function(x, y) {
		return Math.sqrt((x-this.center)*(x-this.center) + (y-this.center)*(y-this.center)) > this.center;
	}
}
var PlayShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.p = [[w / 5, h / 5],[w/5, h *4 /5],[ w*4/5, h/2]];
	}
	this.inShape = function(x, y) {
		return inside([x, y], this.p);
	}
}
var HiveShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.p = [
			[0, h - h * Math.sqrt(2) / 2], [w/2, 0],
			[w, h - h * Math.sqrt(2) / 2],[w, h * Math.sqrt(2) / 2],
			[w/2, h], [0, h * Math.sqrt(2) / 2]				
		];
	}
	this.inShape = function(x, y) {
		return ! inside([x, y], this.p);
	}
}
var RombShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.p = [
			[0, h/2], [w/2, 0], [w, h/2], [w/2, h]		
		];
	}
	this.inShape = function(x, y) {
		return ! inside([x, y], this.p);
	}
}
var CrossShape = function() {
	this.reshape = function(w, h, d) {
		w /= d;
		h /= d;
		this.p = [
			[0, h/3], [w/3, h/3], [w/3, 0],
			[w*2/3, 0], [w*2/3, h/3], [w, h/3],
			[w, h*2/3], [w*2/3, h*2/3], [w*2/3, h],
			[w/3, h], [w/3, h*2/3], [0, h*2/3]
		];
	}
	this.inShape = function(x, y) {
		return inside([x, y], this.p);
	}
}
function inside(point, vs) {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

	var x = point[0], y = point[1];

	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i][0], yi = vs[i][1];
		var xj = vs[j][0], yj = vs[j][1];

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}

	return inside;
};
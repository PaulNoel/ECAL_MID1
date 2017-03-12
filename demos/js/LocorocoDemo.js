// kynd.info 2014

function Ball(r, p, v, static) {
	this.radius = r;
	this.point = p;
	this.vector = v;
	this.maxVec = 8;
	this.numSegment = Math.floor(r / 3 + 2);
	this.boundOffset = [];
	this.boundOffsetBuff = [];
	this.sidePoints = [];
	this.static = static;
	this.path = new Path({
		fillColor: {
			hue: Math.random() * 360,
			saturation: 0,
			brightness: 1
		}
		//blendMode: 'lighter'
	});

	if(!this.static) {
		this.rightEye = new Group();
		this.rightEye.position = this.point + new Point({
				angle: this.point.angle + 210,
				length: 100
			});
		this.rightEye.addChild(new Path.Circle({
			center: [0, 0],
			radius: 20,
			fillColor: "black"
		}));
		this.rightEye.addChild(new Path.Circle({
			center: [0, 0],
			radius: 10,
			fillColor: "white"
		}));
		this.leftEye = new Group();
		this.leftEye.position = this.point + new Point({
				angle: this.point.angle + 150,
				length: 100
			})
		this.leftEye.addChild(new Path.Circle({
			center: [0, 0],
			radius: 20,
			fillColor: "black"
		}));
		this.leftEye.addChild(new Path.Circle({
			center: [0, 0],
			radius: 10,
			fillColor: "white"
		}));
	}

	for (var i = 0; i < this.numSegment; i ++) {
		this.boundOffset.push(this.radius);
		this.boundOffsetBuff.push(this.radius);
		this.path.add(new Point());
		this.sidePoints.push(new Point({
			angle: 360 / this.numSegment * i,
			length: 1
		}));
	}
}

Ball.prototype = {
	iterate: function() {
		if(!this.static) this.checkBorders();
		if (this.vector.length > this.maxVec)
			this.vector.length = this.maxVec;
		this.vector.y += 0.1;
		if(!this.static) {
			this.point += this.vector;
			this.rightEye.position = this.point + new Point({
				angle: this.point.angle + 210,
				length: 100
			});
			this.leftEye.position = this.point + new Point({
				angle: this.point.angle + 150,
				length: 100
			});
		}
		this.updateShape();
	},

	checkBorders: function() {
		var size = view.size;
		if (this.point.x < -this.radius)
			this.point.x = size.width + this.radius;
		if (this.point.x > size.width + this.radius)
			this.point.x = -this.radius;
		if (this.point.y < -this.radius)
			this.point.y = size.height + this.radius;
		if (this.point.y > size.height + this.radius)
			this.point.y = -this.radius;
	},

	updateShape: function() {
		var segments = this.path.segments;
		for (var i = 0; i < this.numSegment; i ++)
			segments[i].point = this.getSidePoint(i);

		this.path.smooth();
		for (var i = 0; i < this.numSegment; i ++) {
			if (this.boundOffset[i] < this.radius / 4)
				this.boundOffset[i] = this.radius / 4;
			var next = (i + 1) % this.numSegment;
			var prev = (i > 0) ? i - 1 : this.numSegment - 1;
			var offset = this.boundOffset[i];
			offset += (this.radius - offset) / 15;
			offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
			this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
		}
	},

	react: function(b) {
		var dist = this.point.getDistance(b.point);
		if (dist < this.radius + b.radius && dist != 0) {
			var overlap = this.radius + b.radius - dist;
			var direc = (this.point - b.point).normalize(overlap * 0.01);
			//if(!this.static) this.vector += direc;
			//if(!b.static) b.vector -= direc;

			if(!this.static) this.calcBounds(b);
			if(!b.static) b.calcBounds(this);
			if(!this.static) this.updateBounds();
			if(!b.static) b.updateBounds();
		}
	},

	getBoundOffset: function(b) {
		var diff = this.point - b;
		var angle = (diff.angle + 180) % 360;
		return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)];
	},

	calcBounds: function(b) {
		for (var i = 0; i < this.numSegment; i ++) {
			var tp = this.getSidePoint(i);
			var bLen = b.getBoundOffset(tp);
			var td = tp.getDistance(b.point);
			if (td < bLen) {
				this.boundOffsetBuff[i] -= (bLen  - td) / 2;
			}
		}
	},

	getSidePoint: function(index) {
		return this.point + this.sidePoints[index] * this.boundOffset[index];
	},

	updateBounds: function() {
		for (var i = 0; i < this.numSegment; i ++)
			this.boundOffset[i] = this.boundOffsetBuff[i];
	}
};

//--------------------- main ---------------------

var balls = [];
var numBalls = 10;
for (var i = 0; i < numBalls; i++) {
	var static = true;
	position += view.center
	if(i == 0) {
		static = false;
	}
	var position = Point.random() * view.size;
	var vector = new Point({
		angle: 360 * Math.random(),
		length: 30
	});
	var radius = static ? 40 : 300;
	balls.push(new Ball(radius, position, vector, static));
}

function onFrame() {
	for (var i = 0; i < balls.length - 1; i++) {
		for (var j = i + 1; j < balls.length; j++) {
			balls[i].react(balls[j]);
		}
	}
	for (var i = 0, l = balls.length; i < l; i++) {
		balls[i].iterate();
	}
}
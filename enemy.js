var Enemy = function (x, y, Hgoing, Vgoing, ID) {
	this.ID = ID
	this.X = x
	this.Y = y
	this.size = 50
	this.src = "assets/enemy.png"
	this.speed = 3
	this.Hgoing = Hgoing
	this.Vgoing = Vgoing
	this.score = 100
}

Enemy.prototype.move = function () {
	if (debug) {
		$("#label" + this.ID).html("ID:" + this.ID + " X:" + this.X + " Y:" + this.Y + " Hgoing:" + this.Hgoing + " Vgoing:" + this.Vgoing)
	}
		
	switch (this.Hgoing) {
		case 0:
			if ($("#" + this.ID).position().left < WIDTH - this.size) {
				$("#" + this.ID).animate({ left: "+=" + this.speed }, 0)
				this.X = this.X + this.speed
			}
			else {
				$("#" + this.ID).animate({ left: "-=" + this.speed }, 0)
				this.Hgoing = 1
				this.X = this.X - this.speed
			}
			break;
		case 1:
			if ($("#" + this.ID).position().left >= 0) {
				$("#" + this.ID).animate({ left: "-=" + this.speed }, 0)
				this.X = this.X - this.speed
			}
			else {
				$("#" + this.ID).animate({ left: "+=" + this.speed }, 0)
				this.Hgoing = 0
				this.X = this.X + this.speed
			}
			break;
		default:
			break;
	}
	
	switch (this.Vgoing) {
		case 0:
			if ($("#" + this.ID).position().top < HEIGHT - this.size) {
				$("#" + this.ID).animate({ top: "+=" + this.speed }, 0)
				this.Y = this.Y + this.speed
			}
			else {
				$("#" + this.ID).animate({ top: "-=" + this.speed }, 0)
				this.Vgoing = 1
				this.Y = this.Y - this.speed
			}
			break;
		case 1:
			if ($("#" + this.ID).position().top >= 0) {
				$("#" + this.ID).animate({ top: "-=" + this.speed }, 0)
				this.Y = this.Y - this.speed
			}
			else {
				$("#" + this.ID).animate({ top: "+=" + this.speed }, 0)
				this.Vgoing = 0
				this.Y = this.Y + this.speed
			}
			break;
		default:
			break;
	}
}
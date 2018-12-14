class BodyBgImage {

	//Class main constructor
	constructor(data) {
		this.Id = data; //Partner ID
		this.htmlBody = document.querySelector('body');
	}

	//Getting body background image based on parter ID
	get bodyBgImg() {
		this.setBodyBgImg(this.Id)
	}

	//Function for setting partners body background image
	setBodyBgImg(partnerID) {

		//Check witch partner ID is on, and add bg img class to the body
		switch (partnerID) {
			case 0:
				this.htmlBody.classList.remove('background-1', 'background-2', 'background-3');
			break;

			case 1:
				this.htmlBody.classList.add('background-1');
			break;

			case 2:
				this.htmlBody.classList.add('background-2');
			break;

			case 3:
				this.htmlBody.classList.add('background-3');
			break;

			default:
				return false;
		}
	}

	//Function for reseting body background image
	resetBodyBackgroundImage() {
		this.htmlBody.classList.remove('background-1', 'background-2', 'background-3');
	}
}

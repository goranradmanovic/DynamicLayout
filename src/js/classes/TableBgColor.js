class TableBgColor {

	//Class main constructor
	constructor(data) {
		this.colorId = data; //Partner ID
		this.table = document.querySelector('.bettingTable') || document.querySelector('.userTable');
	}

	//Getting table background color
	get tableBgColor() {
		this.setTableBgColor(this.colorId);
	}

	//Function for setting table row background color
	setTableBgColor(colorID) {

		switch(colorID) {
			case 0:
				this.table.classList.remove('color-1', 'color-2', 'color-3');
			break;

			case 1:
				this.table.classList.add('color-1'); //Adding class to the table
			break;

			case 2:
				this.table.classList.add('color-2');
			break;

			case 3:
				this.table.classList.add('color-3');
			break;

			default:
				return false;
		}
	}

	//Function for reseting tabel background color
	resetUserTableBackgroundColor() {
		this.table.classList.remove('color-1', 'color-2', 'color-3');
	}
}

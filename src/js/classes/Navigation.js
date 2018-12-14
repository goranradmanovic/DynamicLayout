class Navigation {

	//Main class constructor
	constructor(data) {
		//Setting all class variables
		this.navigationConfig = data; //JSON config data
		this.layoutElements = this.getPageElements(); //Get header, aside, footer
		this.navigation; //Page nav element
		this.headerNumberOfItems; //Number of items/links that can be put in the header element base on his width
		this.navigationDropdown; //Span elelment for navigation dropdown menu
		this.navChildernElements; //Number of items/links in the nav el.
		this.navigationLink; //Navigation <a> tag
		this.navDropdown; //Navigation <span> el. for dropdown menu
		this.headerWidth; //Width of the header el. (number)
		this.headerElement; //Mian header el.
		this.resizeObserver; //Resise observer (for detecting resize of heder el.)
		this.removeFromNavigation; //Max number of el. that can be removed from navigation el.
		this.removeFromDropdown; //Max number of el. that can be removed from dropdown navigation el.
		this.removedElementFromDropdown; //All removed el.(links) from dropdown list
		this.removedElementFromNavigation; //All removed el. (links) from main nav
	}

	//Getting prepared main navigation for page
	get mainNavigation() {
		this.setNavigationOrder(this.navigationConfig)
		this.setMainNavigation(this.navigationConfig);
		this.openNavDropdown();
	}

	//Get Header, Content, Aside, Footer
	getPageElements() {
		return document.querySelectorAll('.grid__header, .gird__header--navigation, .gird__header--navigation--dropdown'); //Query DOM for header, content, aside, footer el.
	}

	//Function for sorting main navigation configuration
	setMainNavigation(navConfig) {

		this.headerNumberOfItems = this.getHeaderWidth(); //Get max items that can be placed in header (nav items/links, dropdown)

		//this.setNavigationOrder(navConfig); //Sort navigation objects

		this.navigation = this.layoutElements[1]; //Getting main nav element
		this.headerNumberOfItems = this.getHeaderWidth(); //Get max items that can be placed in header (nav items/links, dropdown)
		this.navigationDropdown = document.createElement('span'); //Create span el. for navigation dropdown btn.

		//Adding class prperty to the nav dropdown el. and text
		this.navigationDropdown.setAttribute('class', 'gird__header--navigation--dropdown');

		//Looping thru navigation config
		for (let item in navConfig) {

			this.navChildernElements = this.navigation.childNodes.length; //Get number of link items in the main nav

			//Creating anchor tag for navigation sports
			this.navigationLink = document.createElement('a'); //Creating anchor tag
			this.navigationLink.setAttribute('href', '#'); //Adding href atribute with # value to it
			this.navigationLink.setAttribute('class', 'gird__header--navigation--link'); //Adding class to anhor tag
			this.navigationLink.innerText = navConfig[item].itemName; //Adding sport name to anchor tag, item - (0, 1, 2 ,3, ...)

			if (this.navChildernElements < this.headerNumberOfItems) {
				//Adding anchor tag to the main navigation
				this.navigation.appendChild(this.navigationLink);
			} else {
				//Adding nav items/links that can't get in the main nav to the dropdown nav item
				this.navigationDropdown.appendChild(this.navigationLink);
			}
		}

		//Adding dropdown item with nav items/links to the main navigation
		this.navigation.appendChild(this.navigationDropdown);
	}

	//Function for opening navigation dropdown
	openNavDropdown() {

		this.navDropdown = document.querySelector('.gird__header--navigation--dropdown'); //Getting nav dropdown span el.

		//Adding click event on the span dropdown el.
		this.navDropdown.addEventListener('click', function() {
			this.navDropdown.classList.toggle('gird__header--navigation--dropdown--open'); //Toggle class open on the click of the dropdown btn.
		}.bind(this));
	}

	//Function for getting width of header
	getHeaderWidth() {

		this.headerWidth = this.layoutElements[0].offsetWidth; //Get the width of header
		return Math.floor((this.headerWidth / 100) - 1); //Round number to smaller number, width of header devided to width of nav tab, minus one (one for dropdown btn)
	}

	//Sorting navigations objects
	setNavigationOrder(navConfigData) {

		//Sorting navigation config by locked property (true/false) and by index position property (a - first object from array, b - second object from array)
		navConfigData.sort(function(a, b) {

			// First sort by locked prop.
			// If the first item has a true value, move it up
			// If the first item has a false value, move it down
			if (a.locked < b.locked)
				return 1;

			if (a.locked > b.locked)
				return -1;

			// Second sort by index position
			// If the first item has a higher number, move it down
			// If the first item has a lower number, move it up
			if (a.indexPosition > b.indexPosition)
				return 1;

			if (a.indexPosition < b.indexPosition)
				return -1;

			return 0; //Same position in the array
		});
	}

	//Reset navigation
	resetNavigation() {
		this.navigation = this.layoutElements[1]; //Getting main nav element

		//While is still some el. in the main navigation loop and remove first child from nav
		while (this.navigation.firstChild) {
			this.navigation.removeChild(this.navigation.firstChild); //Remove first (all) childs from navigation
		}
	}


	//Function for reoredring nav links based on the header element width
	reorderNavigationLinks() {
		//Detect resize of header element (ResizeObserver API)
		this.resizeObserver = new ResizeObserver(entries => {
			this.navigation = document.getElementsByClassName('gird__header--navigation'); //Getting main nav element
			this.headerNumberOfItems = this.getHeaderWidth(); //Get max items that can be placed in header (nav items/links, dropdown)
			this.navDropdown = document.getElementsByClassName('gird__header--navigation--dropdown'); //Get nav dropdown el. (collection)
			this.removeFromDropdown = this.headerNumberOfItems - this.navigation[0].children.length; //Number of elements (links) that need to be removed from navigation dropdown
			this.removeFromNavigation = this.navigation[0].children.length - this.headerNumberOfItems; //Number of elements (links) that need to be removed from main navigation

			//If number of navigation links is smaller then number of el. that can fit inside of header,then add links to main navigation from dropdown menu
			if (this.navigation[0].children.length < this.headerNumberOfItems) {

				//REMOVE LINKS FROM DROPDOWN AND ADD TO THE MAIN NAVIGATION

				//Check if dropdown has some child elements (links) in side
				if (this.navDropdown[0].hasChildNodes()) {

					//Loop thrught all navigation dropdown child elements (links)
					for (let i = 0; i <= this.navDropdown[0].childNodes.length; i++) {
						//If loop increment is smaller or equal to  number of elemets (links) that need to be removed from dropdown
						//Then remove first el. (link) from dropdown
						if (i <= this.removeFromDropdown) {
							this.removedElementFromDropdown = this.navDropdown[0].removeChild(this.navDropdown[0].firstChild); //Remoe first el.(link) from dropdown
							this.navigation[0].insertBefore(this.removedElementFromDropdown, this.navDropdown[0]); //Insert el. from dropdown (nav link) to the navigation, before dropdown el.
						}
					}
				}
			} else if (this.navigation[0].children.length > this.headerNumberOfItems) {
				//If navigation links are greather then number of links that can fit in side od main navigation, then remove them and put in side of dropdown
				//REMOVE LINKS FROM NAVIGATION AND ADD TO THE DROPDOWN

				//Check if navigation has some elements inside
				if (this.navigation[0].hasChildNodes()) {

					let tempArray = []; //Temporary array for dropdown

					//Push removed el. from navigation to temporary array
					for (let i = 0; i < this.removeFromNavigation; i++) {
						tempArray.push(this.navigation[0].removeChild(this.navigation[0].lastElementChild));
					}

					//Loop thrught temporary array and get first el. then put all other el. from array before first element inside temp array
					for (let i = 0; i < tempArray.length - 1; i++) {
						tempArray[0].insertBefore(tempArray[i + 1], tempArray[0].children[0]); //Adding links to Dropdown menu
					}

					this.navigation[0].appendChild(tempArray[0]); //Adding dropdown menu to the nav
				}
			}
		});

		return this.resizeObserver;
	}
}

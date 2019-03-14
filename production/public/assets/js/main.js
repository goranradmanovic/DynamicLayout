//Waiting for document to be loaded
document.addEventListener('DOMContentLoaded', () => {

	let firestoreDatabase = new FirestoreDatabase();
			firestoreDatabase.firestoreDbOn;

	const db = firestoreDatabase.firebaseDbSettup();

	//This is a promisse (Call to the Firestore DB)
	db.collection('layoutConfig').onSnapshot(snapshot => {

		//Detect changes in the collection
		let changes = snapshot.docChanges();

		//Loops trught array
		changes.forEach(change => {

			if (change.type == 'added') {

				let dbData = change.doc.data();

				firstInit(dbData); //Calling the first init function and passing the first DB data

			} else if (change.type == 'modified') {

				let newData = change.doc.data();

				updateInit(window.oldData, newData); //Callint update init function and passing the old and new data
			}
		});
	});
});


//Function for first initialization of classes and data
function firstInit(data) {
	//Setting layout of the page from the config
	let layout = new Layout(data.config.Templates);
			layout.pageLayout; //Calling class getter
			layout.createSortableNavItems(); //Calling class method

	//Setting main navigation of the page from the config
	let navigation = new Navigation(data.config.Navigation);
			navigation.mainNavigation;

	//Setting body background image based on the partener ID
	let bodyBackgroundImage = new BodyBgImage(data.config.Partner.id);
			bodyBackgroundImage.bodyBgImg;

	//Setting Pricing plans layout based on config data
	let pricingPlansLayout = new PricingPlans(data.config.Plans);
			pricingPlansLayout.plansLayout;

	//Setting table body background color based on the color ID
	let tableBackgroundColor = new TableBgColor(data.config.TableColor.id);
			tableBackgroundColor.tableBgColor;
}


//Function for updating page layout on the update of data
function updateInit(oldDbData, newDbData) {

	//Check if two config templtes strings are different
	if (JSON.stringify(oldDbData.config.Templates) != JSON.stringify(newDbData.config.Templates)) {
		//Setting layout of the page from the config
		let layout = new Layout(newDbData.config.Templates);
				layout.resetActiveTemplate();
				layout.pageLayout;
				layout.altAsideMenuButton();

		//Setting main navigation
		let navigation = new Navigation(newDbData.config.Navigation),
				headerElement = document.querySelector('.grid__header'),
				headerObserver;

				//Observe if element width is changed
				headerObserver = navigation.reorderNavigationLinks();
				headerObserver.observe(headerElement); //Watch for changes of the header el.
	}


	//Loops trught old navigation data
	for (let i = 0; i < oldDbData.config.Navigation.length; i++) {
		//Compare old navigation position of item (name) with new position of item name
		if (oldDbData.config.Navigation[i].itemName != newDbData.config.Navigation[i].itemName) {
			//Setting main navigation of the page from the config
			let navigation = new Navigation(newDbData.config.Navigation);
					navigation.resetNavigation();
					navigation.mainNavigation;
		}
	}


	//Check if there is some changes in the partner ID
	if (oldDbData.config.Partner.id != newDbData.config.Partner.id) {
		//Setting body background image based on the partener ID
		let bodyBackgroundImage = new BodyBgImage(newDbData.config.Partner.id);
				bodyBackgroundImage.resetBodyBackgroundImage();
				bodyBackgroundImage.bodyBgImg;
	}

	//Check if there is some changes in the partner ID
	if (oldDbData.config.TableColor.id != newDbData.config.TableColor.id) {
		//Setting table body background color based on the color ID
		let tableBackgroundColor = new TableBgColor(newDbData.config.TableColor.id);
				tableBackgroundColor.resetUserTableBackgroundColor();
				tableBackgroundColor.tableBgColor;
	}
}

class FirestoreDatabase {

	//Class constuctor
	constructor() {
		this.config = {
			apiKey: "AIzaSyCroggHw_3jdK0aN63EKiapu8N4nsraE8c",
			authDomain: "dynamicpagelayout.firebaseapp.com",
			databaseURL: "https://dynamicpagelayout.firebaseio.com",
			projectId: "dynamicpagelayout",
			storageBucket: "dynamicpagelayout.appspot.com",
			messagingSenderId: "280766259425"
		};

		this.db;
	}

	//Turn on firestore db
	get firestoreDbOn() {
		this.firestoreDbInit();
	}

	//Initialize firestore db
	firestoreDbInit() {
		firebase.initializeApp(this.config);
	}

	//Firestore settup
	firebaseDbSettup() {

		//Storing databse inside of this variable (firebase.firestore() is reference to our DB)
		this.db = firebase.firestore();

		//For working with snapshots in firestore
		this.db.settings({timestampsInSnapshots: true});

		return this.db;
	}

	//Function for updating DB data
	updateDbData(objectData) {
		this.firebaseDbSettup().collection('layoutConfig').doc('MtyYfGHe9cbaHlauDqCv').update(objectData);
	}

	/*getDbData() {
		this.firebaseDbSettup().collection('layoutConfig').get().then((snapshot) => {
			snapshot.docs.forEach(doc => {
				return doc.data(); //Return all data from db
			});
		});
	}*/

	//Function for getting all data from the DB
	getDbData() {
		return this.firebaseDbSettup().collection('layoutConfig').get().then((snapshot) => {
			return snapshot.docs;
		});
	}
}

class Layout extends FirestoreDatabase {

	//Main constructor of the class
	constructor(data) {
		super(); //FirestoreDatabase constructor

		this.templatesConfig = data;
		this.layoutElements = this.getPageElements(); //Get header, aside, footer
		this.settingBtn;
		this.formModal;
		this.form;
		this.formData;
		this.formDataObject = {};
		this.activeTemplate;
		this.navigation;
		this.sortListItem;
		this.sortListItemLockedClassName;
		this.isSortListItemCheckboxChecked;
		this.sortListItemCheckbox;
		this.sortListItems;
		this.sortListCheckedItemObject = {};
		this.sortListCheckedItemArray= [];
		this.newNavLinksOrder;
		this.asideSettingLink;
	}

	//Class getter for page layout
	get pageLayout() {
		this.resetActiveTemplate(); //Reset previus layout template
		this.setActiveTemplate(this.templatesConfig); //Set new template
		this.altAsideMenuButton();
		this.settingsButton();
		this.asideSettingButton();
		this.modalCloseButton();
		this.modalFormSave();
	}

	//Get Header, Content, Aside, Footer
	getPageElements() {
		return document.querySelectorAll('.grid__header, .grid__content, .altaside, .altaside__btn, .grid__aside, .grid__footer, .grid__footer--notification, .grid__footer--settings, .modal, .modal__close--btn, .modal__form, .modal__form--list, .modal__form--btn'); //Query DOM for header, content, aside, footer el.
	}

	//Convert object property to string (for add() class method, witch expect only string param)
	convertToString(property) {
		return new String(property); //Convert to string
	}

	//Setting up active template
	setActiveTemplate(templates) {
		//Looping thru all templates from config and geting one by one template
		for (let template in templates) {

			//Check if template is active and if it is true, set new css layout classes
			if (templates[template].isActive) {

				//Adding new classes from configuration to header, aside, footer
				this.layoutElements[0].classList.add(this.convertToString(templates[template].headerClass)); //Header
				this.layoutElements[1].classList.add(this.convertToString(templates[template].contentClass)); //Main Content, check if class from config exists
				this.layoutElements[4].classList.add(this.convertToString(templates[template].asideClass)); //Aside
				this.layoutElements[5].classList.add(this.convertToString(templates[template].footerClass)); //Footer

				//If template layout is 4 then display alternative aside
				if (template === 'template-4') {
					//Removing classes from the altaside and altaside button (reseting to default)
					this.layoutElements[2].classList.remove('altaside__remove'); //Altaside
					this.layoutElements[3].classList.remove('altaside__btn--remove'); //altaside button
				} else {
					//Remove alternative aside menu
					this.layoutElements[2].classList.add('altaside__remove');
					this.layoutElements[3].classList.add('altaside__btn--remove');
				}
			}
		}
	}

	//Reset current active template for the new one
	resetActiveTemplate() {
		//Removing classes from the header, aside, footer (reseting to default)
		this.layoutElements[0].classList.remove("grid__header-footer--pull", "grid__span--allwidth", "null", "."); //Header
		this.layoutElements[1].classList.remove("grid__span--allwidth", "undefined", "null", "."); //Content
		this.layoutElements[4].classList.remove("grid__aside--left", "grid__aside--top", "grid__aside--left--top", "grid__aside--remove", "null", "."); //Aside
		this.layoutElements[5].classList.remove("grid__header-footer--pull", "grid__span--allwidth", "null", "."); //Footer
	}

	//Function for checking witch template is active
	isActiveTemplate(templates) {
		for (let template in templates) {
			if (templates[template].isActive) {
				return template; //Return template name
			}
		}
	}


	//Function for toggle open/close Alt. aside button
	altAsideMenuButton() {
		//Alt. Aside open/close button
		this.layoutElements[3].addEventListener('click', function() {
			this.layoutElements[2].classList.toggle('altaside__open'); //Alternative page aside
			this.layoutElements[3].classList.toggle('altaside__btn--open'); //Alternative page aside button
		}.bind(this));
	}

	//Settings button
	settingsButton() {
		//Click on Setting button
		this.layoutElements[7].addEventListener('click', function() {

			//Function from FirestoreDatabase class for getting document DB data
			this.getDbData().then((docs) => {
				//Loop trught all db document
				docs.forEach(doc => {
					window.oldData = doc.data(); //Currently active DB config stored in window object
				});
			});

			this.layoutElements[8].classList.add('open'); //Add class open to the modal window
			this.layoutElements[6].innerText = ''; //Reset text in the footer notification el.
			this.layoutElements[6].classList.remove('show'); //Remove show class from footer notification el.
			this.formDataObject = {}; //Reset form data object (empty)
		}.bind(this));
	}

	//Function for opening setting form with aside setting link
	asideSettingButton() {

		this.asideSettingLink = document.querySelectorAll('#pageSettings'); //Get all el. from aside and altaside

		//The Array.from() method creates a new, shallow-copied Array instance from an array-like or iterable object.
		//And iterate over the array, add event listener to evry link in the array
		Array.from(this.asideSettingLink).forEach(link => {

			link.addEventListener('click', function() {

				event.preventDefault();

				//Function from FirestoreDatabase class for getting document DB data
				this.getDbData().then((docs) => {
					//Loop trught all db document
					docs.forEach(doc => {
						window.oldData = doc.data(); //Currently active DB config stored in window object
					});
				});

				this.layoutElements[8].classList.add('open'); //Add class open to the modal window
				this.layoutElements[6].innerText = ''; //Reset text in the footer notification el.
				this.layoutElements[6].classList.remove('show'); //Remove show class from footer notification el.
				this.formDataObject = {}; //Reset form data object (empty)
			}.bind(this));
		});
	}

	//Function for closing modal window
	modalCloseButton() {
		//Click on the modal close button to close modal
		this.layoutElements[9].addEventListener('click', function() {
			this.layoutElements[8].classList.remove('open');
		}.bind(this));
	}

	//Function for setting and creating sortable nav items based on DB config in the modal form
	createSortableNavItems() {
		//Function from FirestoreDatabase class for getting document DB data
		this.getDbData().then((docs) => {
			//Loop trught all db document
			docs.forEach(doc => {

				this.navigation = doc.data().config.Navigation; //Currently navigation

				//Loop thrught current navigation and create li tags with links name and append to ul drag and drop list
				for (let i = 0; i < this.navigation.length; i++) {

					this.sortListItemLockedClassName = (this.navigation[i].locked == 'true') ? 'modal__form--list--item--locked' : 'modal__form--list--item'; //Set list item class
					this.isSortListItemCheckboxChecked = (this.navigation[i].locked == 'true') ? true : false; //Set checkbox checked property

					this.sortListItem = document.createElement('li'); //Create el.
					this.sortListItem.setAttribute('class', 'modal__form--list--item'); //Add class to the el.
					this.sortListItem.classList.add(this.sortListItemLockedClassName); //Add class to the el.
					this.sortListItem.setAttribute('data-locked', this.navigation[i].locked); //Add data attribute value to the el.
					this.sortListItem.innerText = this.navigation[i].itemName; // Add text to the el.

					this.sortListItemCheckbox = document.createElement('input');
					this.sortListItemCheckbox.setAttribute('type', 'checkbox'); //Add class to the el.
					this.sortListItemCheckbox.setAttribute('id', `item-checkbox-${i}`); //Add class to the el.
					this.sortListItemCheckbox.setAttribute('class', 'modal__form--list--item--checkbox'); //Add class to the el.
					this.sortListItemCheckbox.setAttribute('title', 'Lock this item on the fix nav position'); //Add class to the el.*/
					this.sortListItemCheckbox.checked = this.isSortListItemCheckboxChecked; //Set the checkbox to true/false (checked or not)

					this.sortListItem.appendChild(this.sortListItemCheckbox); //Append checkbox to sort list item

					this.layoutElements[11].appendChild(this.sortListItem); //Append li el.to ul drag and drop list
				}

				//Calling the functions after creation of item list is completed
				this.setLockedNavItem();
			});
		});
	}

	//Function for seting locked attr on the navigation item
	setLockedNavItem() {

		this.sortListItemCheckbox = document.getElementsByClassName('modal__form--list--item--checkbox'); //Get the HTML collection of el.

		//Loop trught all el.
		for (let i = 0; i < this.sortListItemCheckbox.length; i++) {
			//Add event listener click onevry single chekbox el.
			this.sortListItemCheckbox[i].addEventListener('click', function(event) {

				//If targeted checkbox is checked (equal to true)
				if (event.target.checked) {
					event.target.parentElement.dataset.locked = true; //Add true value to the data locked attribute
					event.target.parentElement.classList.add('modal__form--list--item--locked');  //Add class to the el.
				} else {
					event.target.parentElement.dataset.locked = false; //Add false value to the data locked attribute
					event.target.parentElement.classList.remove('modal__form--list--item--locked'); //Remove class from the el.
				}
			}.bind(this));
		}
	}


	//Function for getting list items order when user only click on the checkbox locked (with out draging list items)
	getListItemsCheckedOrder() {

		this.sortListItems = document.querySelectorAll('.modal__form--list--item'); //Get all list items

		//Loop trught all list items
		for (let i = 0; i < this.sortListItems.length; i++) {

			//Add properties to empty checkbox object and set the values
			this.sortListCheckedItemObject.indexPosition = i;
			this.sortListCheckedItemObject.itemName = this.sortListItems[i].innerText;
			this.sortListCheckedItemObject.locked = this.sortListItems[i].dataset.locked;

			this.sortListCheckedItemArray.push(this.sortListCheckedItemObject);
			this.sortListCheckedItemObject = {}; //clear the object
		}

		return this.sortListCheckedItemArray;
	}

	//Function for geting new navigation links order with drag and drop
	modalSortableLinks() {
		//Local vars for navigation links array and nav link object
		let navLinks = [],
				navLinkObject = {},
				currentNavItemsOrder = [];

		//Sortable class for sorting list items
		Sortable.create(this.layoutElements[11], {
			//After finish sorting the list items
			onEnd: function(event) {
						//var itemEl = evt.item; // the current dragged HTMLElement

						//Loop thrught list of navigation links
						for (let i = 0; i < event.target.childNodes.length; i++) {

							 navLinkObject.indexPosition = i + 1; //Add new index position
							 navLinkObject.itemName = event.target.childNodes[i].innerText; //Add new item name
							 navLinkObject.locked = event.target.childNodes[i].dataset.locked; //Set locked property to true/false

							 navLinks.push(navLinkObject); //Push created object to links array
							 navLinkObject = {}; //Clear the object
						}

						currentNavItemsOrder.push(navLinks);
						navLinks = []; //Reset nav links array because of duplicating el. in the array
				}
		});

		//Return new sorted links array (array of array [ [], [], [] ...])
		return currentNavItemsOrder;
	}

	//Function for getting data from the modal form and updating data to the DB
	modalFormSave() {

		this.newNavLinksOrder = this.modalSortableLinks(); //Get new navigation links order array

		//Click on the form modal submit button to update data in the DB
		this.layoutElements[10].addEventListener('submit', function(event) {
			event.preventDefault(); //Prevent default behavior

			this.form = this.layoutElements[10]; //Form el.
			this.formData = new FormData(this.form); //new form data

			//Function from FirestoreDatabase class for getting document DB data
			this.getDbData().then((docs) => {
				//Loop trught all db document
				docs.forEach(doc => {

					this.activeTemplate = this.isActiveTemplate(doc.data().config.Templates); //Currently active template
					this.formDataObject[`config.Templates.${this.activeTemplate}.isActive`] = false; //Old active template set to false
					this.formDataObject[`config.Templates.${this.formData.get('templates')}.isActive`] = true; //New active template set to true
					this.formDataObject['config.Partner.id'] = Number(this.formData.get('background-image')); //Set new body background image
					this.formDataObject['config.TableColor.id'] = Number(this.formData.get('table-background-color')); //Set new table background color
					//Use the first array if user is used drag'n drop items, or use second array if user is only checked to locked chekbox
					(this.newNavLinksOrder.length > 0) ? this.formDataObject['config.Navigation'] = this.newNavLinksOrder[this.newNavLinksOrder.length - 1]
																						 : this.formDataObject['config.Navigation'] = this.getListItemsCheckedOrder(); //Set new navigation links order

					//Check if config navigation is undefined and if it is, then delete the property from object
					if (typeof this.formDataObject['config.Navigation'] == 'undefined') {
						delete this.formDataObject['config.Navigation']; //Delete this property to avoid Firebase error when update propery is undefined
					}

					//If selected form data is different then false value
					this.updateDbData(this.formDataObject); //Update DB data

					this.layoutElements[6].innerText = (this.formData.get('templates') != 'template-0') ? this.formData.get('templates') : 'Default Template'; //Set the text to info popup
					this.layoutElements[6].classList.add('show'); //Show info popup
					this.layoutElements[8].classList.remove('open'); //Close the modal window after updating databse
					this.newNavLinksOrder = []; //Clear the array
					this.sortListCheckedItemArray = []; //Reset sort list checked array to empty
					//this.form.reset(); //Reset form after finish
				});
			});
		}.bind(this));
	}
}

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

class CreateElement {

	//Class constructor
	constructor() {
		this.element;
	}

	//Class getter method
	get createdElement() {
		return this.buildElement();
	}

	//Method for creating HTML element
	buildElement(elementName, elementClass, elementText = null) {
		this.element = document.createElement(elementName);
		this.element.setAttribute('class', elementClass);
		this.element.innerHTML = elementText;

		return this.element;
	}
}
class PricingPlans extends CreateElement {

	//Class constructor
	constructor(data) {

		super(); // Constructor from extended class

		//Setting up variables
		this.plansConfig = data;
		this.pricingPlansMainWrapper = document.querySelector('.pricing');
		this.pricingPlansContainer;
		this.pricingPlansTitle;
		this.pricingPlansPrice;
		this.pricingPlansList;
		this.pricingPlansListItem;
		this.pricingPlansButton;
	}

	//Getter method for runing class function on class initialization
	get plansLayout() {
		this.settingPlansLayout(this.plansConfig);
	}

	//Set pricing plans layout and el.
	settingPlansLayout(configData) {

		//Sorting Plans objects
		this.setPlansOrder(configData);

		for (let plan in configData) {

			//Pricing plan container
			this.pricingPlansContainer = this.buildElement('div', 'pricing__plan');

			//Pricing plan Title
			this.pricingPlansTitle = this.buildElement('div', 'pricing__plan--title', configData[plan].title);

			//Pricing plan Price
			this.pricingPlansPrice = this.buildElement('div', 'pricing__plan--price', '$' + configData[plan].price);

			//Pricing plan List
			this.pricingPlansList = this.buildElement('div', 'pricing__plan--list');

			//Pricing plan Button
			this.pricingPlansButton = this.buildElement('div', 'pricing__plan--btn', configData[plan].btnText);

			//Looping thru array of items
			for (let i = 0; i < configData[plan].items.length; i++) {
				this.pricingPlansListItem = this.buildElement('div', 'pricing__plan--list--item', configData[plan].items[i]);

				//Append pricing plans list items to the ul list
				this.pricingPlansList.appendChild(this.pricingPlansListItem);
			}

			//Append created elements to thepricing plans container
			this.pricingPlansContainer.appendChild(this.pricingPlansTitle);
			this.pricingPlansContainer.appendChild(this.pricingPlansPrice);
			this.pricingPlansContainer.appendChild(this.pricingPlansList);
			this.pricingPlansContainer.appendChild(this.pricingPlansButton);

			//Append pricing plan container to the pricing plans wrapper
			this.pricingPlansMainWrapper.appendChild(this.pricingPlansContainer);
		}
	}

	//Sort plans config objects by order propery value
	setPlansOrder(configData) {
		Object.keys(configData).sort(function(obj1, obj2) {
			return obj1.order - obj2.order;
		});
	}
}

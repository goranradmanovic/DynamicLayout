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
	}

	//Class getr for page layout
	get pageLayout() {
		this.resetActiveTemplate(); //Reset previus layout template
		this.setActiveTemplate(this.templatesConfig); //Set new template
		this.altAsideMenuButton();
		this.settingsButton();
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

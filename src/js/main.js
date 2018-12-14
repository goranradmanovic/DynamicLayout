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

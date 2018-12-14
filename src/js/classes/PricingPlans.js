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

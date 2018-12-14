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
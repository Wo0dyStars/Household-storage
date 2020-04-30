function ChangeNumberValue(element, id, index) {
	const numberField = document.querySelectorAll('#' + id)[index];
	let value = numberField.value;
	if (element === 'up') {
		value++;
	} else if (element === 'down') {
		if (value > 0) {
			value--;
		}
	}

	numberField.value = value;
}

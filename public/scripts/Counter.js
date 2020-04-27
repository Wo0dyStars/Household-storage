function ChangeNumberValue(element, id, index) {
	const numberField = document.querySelectorAll('#' + id)[index];
	let value = numberField.value;
	if (element === 'up') {
		value++;
	} else if (element === 'down') {
		if (id === 'stock-qty' && value > 1) {
			value--;
		}
		if (id === 'stock-reorder' && value > 0) {
			value--;
		}
	}

	numberField.value = value;
}

function CalculateRealTimePrices(index) {
	const subtotalname = '.item__subtotal_' + index;
	const subtotal = document.querySelector(subtotalname);
	const quantity = document.querySelectorAll('#basket-quantity');
	const price = document.querySelectorAll('#basket-price');
	const total = document.querySelector('.totalAmount');
	let sum = 0;
	for (let i = 0; i < price.length; i++) {
		if (quantity[i].value < 0) {
			quantity[i].value = 0;
		}
		if (price[i].value < 0) {
			price[i].value = 0;
		}
		sum += quantity[i].value * price[i].value;
	}
	if (sum < 0) {
		total.innerHTML = '£' + 0;
	} else {
		total.innerHTML = '£' + sum;
	}

	if (quantity[index].value > 0 && price[index].value > 0) {
		subtotal.innerHTML = '£' + quantity[index].value * price[index].value;
	} else {
		subtotal.innerHTML = '£' + 0;
	}
}

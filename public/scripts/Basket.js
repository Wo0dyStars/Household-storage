function CalculateRealTimePrices(index) {
	const subtotalname = '.item__subtotal_' + index;
	const subtotal = document.querySelector(subtotalname);
	const quantity = document.querySelectorAll('#basket-quantity');
	const price = document.querySelectorAll('#basket-price');
	const total = document.querySelector('.totalAmount');
	let sum = 0;
	for (let i = 0; i < price.length; i++) {
		sum += quantity[i].value * price[i].value;
	}
	total.innerHTML = sum;
	subtotal.innerHTML = quantity[index].value * price[index].value;
}

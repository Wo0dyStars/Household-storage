function DateFormat(OriginalDate) {
	var date = new Date(OriginalDate);
	var d = date.getDate();
	var m = date.getMonth() + 1;
	var y = date.getFullYear();
	return `${d}/${m}/${y}`;
}

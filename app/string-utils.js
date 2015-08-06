var StringUtils = {
	innerText: (str, prefix, suffix) => {
		var beginIndex = str.indexOf(prefix);
		if (beginIndex == -1) {
			return '';
	  	}
	  	beginIndex += prefix.length;
	  	var endIndex = str.indexOf(suffix, beginIndex);
	  	if (endIndex == -1) {
	    	return '';
	  	}

	  	return str.substring(beginIndex, endIndex);
	},
	stripHtml: (str) => {
		return str.replace(/<(?:.|\n)*?>/gm, '');
	},
};

module.exports = StringUtils;
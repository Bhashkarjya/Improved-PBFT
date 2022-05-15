var XMLHttpRequest = require('xhr2');
const ChainUtil = require("../chain-util");

class QRCode {
	constructor() {
		this.readCounter = 0;
        this.url = '';
		this.readUrl = '';
		this.qrid = '';
	}

	generateQR({ data }) {
		if (this.qrid != '') {
			return;
		}

		const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data}`;
        this.url = url;
		const timestamp = Date.now();
        
		this.qrid = ChainUtil.hash(url, timestamp);

		const encoded = encodeURIComponent(url);
		this.readUrl = `https://api.qrserver.com/v1/read-qr-code/?fileurl=${encoded}`;

		return url;
	}

	readQR() {
		if (this.qrid != ''){
			return;
		}

		this.readCounter += 1;

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				console.log("QR Code reads: ", xmlHttp.responseText);
			}
			xmlHttp.open("GET", theUrl, true);
			xmlHttp.send(NULL);
		}
	}
}

module.exports = QRCode;
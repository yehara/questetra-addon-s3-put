const DigestUtils = {
    toHex: str => {
        return unescape(encodeURIComponent(str))
            .split('').map(function(v){
                return ('0' + v.charCodeAt(0).toString(16)).substr(-2);
            }).join('');
    },

    hmac: (keyHex, str) => {
        const jssha = new jsSHA("SHA-256", "HEX");
        jssha.setHMACKey(keyHex, "HEX");
        jssha.update(DigestUtils.toHex(str));
        return jssha.getHMAC("HEX");
    },

    sha256: (str) => {
        const jssha = new jsSHA("SHA-256", "TEXT");
        jssha.update(str);
        return jssha.getHash("HEX");
    }

}


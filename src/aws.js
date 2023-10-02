class AWS {
    constructor(region, iamKey, iamSecretKey) {
        this.region = region;
        this.iamKey = iamKey;
        this.iamSecretKey = iamSecretKey;
    }

    sendRequest({
                    service,
                    method,
                    host,
                    path,
                    queryParams = {},
                    body
                }) {
        const algorithm = "AWS4-HMAC-SHA256";
        const payload = "UNSIGNED-PAYLOAD";
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:]/g, "").substring(0, 15) + "Z";
        const date = timestamp.substring(0,8);
        const scope = `${date}/${this.region}/${service}/aws4_request`;
        const credential = `${this.iamKey}/${scope}`;

        const headers = {
            "Host": host
        };
        const signedHeaders = Object.keys(headers).sort().map(k => k.toLowerCase()).join(";");
        const queryParameters = {
            "X-Amz-Algorithm": algorithm,
            "X-Amz-Credential": credential,
            "X-Amz-Date": timestamp,
            "X-Amz-Expires": 86400,
            "X-Amz-SignedHeaders": signedHeaders,
            ...queryParams
        };
        let queryString = Object.keys(queryParameters).map(k => `${k}=${encodeURIComponent(queryParameters[k])}`).join("&");

        const canonicalRequest = this.generateCanonicalRequest(method, path, queryString, headers, signedHeaders, payload);
        const stringToSign = this.generateStringToSign(algorithm, timestamp, scope, canonicalRequest);
        const signingKey = this.generateSigningKey(this.iamSecretKey, date, this.region, service);
        const signature = DigestUtils.hmac(signingKey, stringToSign);
        queryString += "&X-Amz-Signature=" + signature;

        if(path.startsWith("/")) {
            path = path.substring(1);
        }
        const url = `https://${host}/${path}?${queryString}`

        const http = httpClient.begin();
        if (method === 'GET') {
            return http.get(url);
        } else if (method === 'PUT') {
            return http.body(body).put(url);
        }
    }

    // private methods

    generateSigningKey(key, timestamp, region, service) {
        const awsKey = "AWS4" + key;
        const dateKey = DigestUtils.hmac(DigestUtils.toHex(awsKey), timestamp);
        const regionKey = DigestUtils.hmac(dateKey, region);
        const serviceKey = DigestUtils.hmac(regionKey, service);
        const signingKey = DigestUtils.hmac(serviceKey, 'aws4_request');
        return signingKey;
    }

    generateCanonicalRequest(method, uri, queryString, headers, signedHeaders, hashedPayload) {
        const normalizedHeaders = Object.keys(headers).map(k => `${k.toLowerCase()}:${headers[k]}\n`).join('');
        return method + "\n"
            + uri + "\n"
            + queryString + "\n"
            + normalizedHeaders + "\n"
            + signedHeaders + "\n"
            + hashedPayload
    }

    generateStringToSign(algorithm, timestamp, scope, canonicalRequest) {
        return algorithm + "\n"
            + timestamp + "\n"
            + scope + "\n"
            + DigestUtils.sha256(canonicalRequest);
    }

}

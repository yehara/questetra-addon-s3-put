class S3 {
    constructor(accessKey, secretKey, region, bucket) {
        this.aws = new AWS(region, accessKey, secretKey);
        this.commonProps = {
            host: `${bucket}.s3.amazonaws.com`,
            service: "s3"
        }
    }

    listObjects(prefix) {
        return this.aws.sendRequest({
            ...this.commonProps,
            method: "GET",
            path: prefix,
            queryParams: {
                "list-type": "2",
            }
        });
    }

    putObject(path, qfile) {
        return this.aws.sendRequest({
            ...this.commonProps,
            method: "PUT",
            path: path,
            body: qfile,
        });
    }
}

function initializeS3() {
    return new S3(
        configs.get("awsAccessKey"),
        configs.get("awsSecretKey"),
        configs.get("awsRegion"),
        configs.get("s3Bucket")
    );
}

function doList() {
    const s3 = initializeS3();
    const result = s3.listObjects("/");
    engine.log(result);
}

function doPut() {
    const s3 = initializeS3();
    const files = engine.findData( configs.getObject("file") );
    const path = configs.get("filePath");
    if(files !== null && files.size() > 0) {
        const file = files.get(0);
        engine.log("putting file: " + file.getName() + " to " + path);
        const result = s3.putObject(path, file);
    }
}

doPut();
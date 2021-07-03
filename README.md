# Recipe Bible API

AWS lambdas with DynamoDB

## setup

Spin up the local AWS environment using [localstack](https://localstack.cloud/)

```bash
yarn local:up
```

To destroy:

```bash
yarn local:down
```

### S3 commands

```bash
awslocal s3api list-buckets
awslocal s3api list-objects --bucket recipe-bible-content
```

### Run the API

```bash
nvm use

yarn

yarn dev
```

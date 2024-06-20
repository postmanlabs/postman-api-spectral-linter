# postman-collection-spectral-linter

> This code is part of a blog post and is **not** actively maintained by Postman.

Command line utility (bash script) to validate the quality of an API.

## Purpose

This code demonstrates how to use the [Postman API](https://www.postman.com/postman/workspace/postman-public-workspace/collection/12959542-c8142d51-e97c-46b6-bd77-52bb66712c9a) and the [Spectral CLI](https://docs.stoplight.io/docs/spectral/9ffa04e052cc1-spectral-cli) to validate automatically the quality of an API maintained in Postman.

The script receives the Postman API ID, downloads the API using the Postman API, and validates several Spectral governance rules.

The file [spectral-ruleset/ruleset.yaml](ruleset.yaml) contains all the rules the process validate. Some of them require custom Javascript functions, which are also included in the repository.

If any of the error rules doesn't pass for the API being linted, the script returns an error status (1), which can be used in CI/CD processes to avoid further workflow steps.

Optionally (if the `-c` parameter is passed), the script will create a comment on the API in Postman, visible to all the API contributors.

> NOTE: You need a valid [Postman API key](https://learning.postman.com/docs/developer/postman-api/authentication/) to execute the command. You can save the API key in an environment variable called `POSTMAN_API_KEY`, and the script will read it from there.

```shell
export POSTMAN_API_KEY=PMAK_your_key
```

## Requirements

You need to install the following tools:

[curl](https://curl.se/)
[jq](https://jqlang.github.io/jq/)
[spectral](https://docs.stoplight.io/docs/spectral/b8391e051b7d8-installation)

## Usage

The [linter.sh](linter.sh) command receives the following arguments:

```shell
./linter.sh -a <apiId> -k [APIKey] -r [rulesFilePath] [-c]
```

| Argument         | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| -a apiId         | The id of the API we want to validate. Mandatory.                                                            |
| -k APIKey        | Postman API key. Defaults to the environment variable POSTMAN_API_KEY                                        |
| -r rulesFilePath | Path to rules file. Defaults to [spectral-ruleset/ruleset.yaml](spectral-ruleset/ruleset.yaml)               |
| -c               | If present, and the API governance check returns errors, a new comment will be created in the API in Postman |

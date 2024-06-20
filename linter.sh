#!/bin/bash

# argument validation and usage help
usage()
{
cat << EOF
usage: $0 options

Lint an API in Postman using spectral rules:

OPTIONS:
    -a <API ID>
    -k <Postman API key> (defaults to the environment variable POSTMAN_API_KEY)
    -r <path to rules file> (defaults to spectral-ruleset/ruleset.yaml)
    -c

Requirements: curl, spectral, jq
More information can be found here: https://github.com/postmanlabs/postman-collection-spectral-linter
EOF
}

if [ $# -eq 0 ]
  then
    usage
    exit 1
fi

API_KEY=$POSTMAN_API_KEY
RULES_PATH=spectral-ruleset/ruleset.yaml
COMMENT=false

OPTSTRING=":a:k:r:c"

while getopts ${OPTSTRING} opt; do
  case ${opt} in
    a)
        API_UID=${OPTARG}
        ;;
    k)
        API_KEY=${OPTARG}
        ;;
    r)
        RULES_PATH=${OPTARG}
        ;;
    c)
        COMMENT=true
        ;;
    :)
        echo "Option -${OPTARG} requires an argument."
        exit 1
      ;;
    ?)
        echo "Invalid option: -${OPTARG}."
        exit 1
        ;;
  esac
done

if [ ! $API_KEY ]
  then
    usage
    exit 1
fi

# Perform a curl request against the Postman API to retrieve the API schema. Save the request body in a file called _api.json
curl -s -H "Accept: application/vnd.api.v10+json" -H "x-api-key: $API_KEY" https://api.postman.com/apis/$API_UID?include=schemas,collections,versions,gitInfo | jq . > _api.json

# extract the schema ID from the first schemas list in the response with jq and save it in a variable
SCHEMA_ID=$(jq -r '.schemas[0].id' _api.json)

# get the bundled schema in a file
curl -s -H "Accept: application/vnd.api.v10+json" -H "x-api-key: $API_KEY" https://api.postman.com/apis/$API_UID/schemas/$SCHEMA_ID?bundled=true | jq . > _api.json

jq -r '.content' _api.json > _api.yaml

# Lint the API using spectral. Save the result in a JSON file
spectral lint _api.yaml --ruleset $RULES_PATH -f json --quiet > _result.json

# search for errors (severity=0) in the result file. If there are errors, exit with a non-zero status code
jq '.[] | select(.severity==0)' -e _result.json >/dev/null

if [ $? -eq 0 ]
  then
    # if COMMENT is true, call the Postman API to create a comment with the result
    if [ $COMMENT = true ]
      then
        COMMENT_BODY=$(jq -r 'map( .code + ": " + .message )' _result.json)
        echo $COMMENT_BODY > _errors.json
        # build a valid json file with {"body": "comment body"} with jq
        cat _errors.json | jq -Rs '{body: .}' > _comment.json
        curl -s -H "x-api-key: $API_KEY" -H "Content-Type: application/json" -X POST --data-binary "@./_comment.json" https://api.postman.com/apis/$API_UID/comments >/dev/null
        echo "Comment created on the API"
    fi
    exit 1
fi

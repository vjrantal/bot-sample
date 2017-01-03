# Bot Sample

A clear and simple base case bot using the [Microsoft Bot Framework](https://dev.botframework.com) that demonstrates:

* One way to automate bot testing 
* How to make a bot deployable to Azure Functions, AWS Lambda (via serverless) or restify
* LUIS.ai integration

This can be useful to those looking to get started quickly with either or all of the three points above. 

## Notes for Azure Functions

To learn how to setup continuous deployment of this bot see: [Continuous deployment for Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-continuous-deployment)

> An interesting thing to note if you're following the above article is the structure of the repository. It is important that you follow the structure specified. This source code (bot-sample) can be one of the sub-directory (not the main directory). Obvious, but good to note! :)

To learn how to setup the necessary environment variables, see: [How to configure Azure Function app settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings). 

For certain continuous integration deployment options, dependencies may not be automatically resolved. If you run into dependency errors, try getting the dependent botbuilder package by running:

```
> npm install
```

within site\wwwroot\[FUNCTION_DIR] (see above app settings documentation on how to access Kudu). For GitHub integration, the dependencies should already be resolved as part of the deployment process.

---

See the latest build in Travis CI from:

[![Build Status](https://travis-ci.org/vjrantal/bot-sample.svg?branch=master)](https://travis-ci.org/vjrantal/bot-sample)

More information about the automated testing aspect of this project can be found from [this blog post](http://blog.vjrantal.net/2016/10/24/continuous-delivery-of-a-node-js-bot/).

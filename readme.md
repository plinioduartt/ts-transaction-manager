# **Transaction Manager with Typescript Decorators**
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/plinioduartt/ts-transaction-manager/publish.yml)

📚 Abstracted transaction control for Typescript decorators, to facilitate transaction management and make the code cleaner.

<br>

## **Supported ORMs:**
- Typeorm

<br>

## **Quickstart**
<br>

**Configuration:**
```
import { DataSource } from 'typeorm'
import { TransactionManager } from '@plinioduartt/ts-transaction-manager'

const dataSource = new DataSource({
	...options
})

dataSource.initialize()

TransactionManager
	.getInstance()
	.addDataSource(dataSource)
	.setDefaultDataSource(dataSource)
```
<br>

**Example of use:**
```
import { Transactional } from '@plinioduartt/ts-transaction-manager'

class Example1 {

	@Transactional()
	methodToBeCalled() {
		// all the database actions here are encapsulated
		   by typeorm transaction...
	}
}
```
<br>

**The arguments are optionals:**
```
TransactionalOptions {
  dataSource?: Exclude<DataSourceTypes, undefined>
  logging?: boolean
}

*Consider DataSourceTypes = 'typeorm'.
In the future, it'll be available with more options for dataSource configuration.
```
<br>

**If you pass logging: true, then you'll see logs like that:**
```
[01:21:05.906] INFO: [OrderUsecase][executeWithSuccess] is being intercepted by Transaction decorator...
[01:21:05.914] INFO: [OrderUsecase][executeWithFailure] is being intercepted by Transaction decorator...


@Transactional({ logging: true })
async executeWithSuccess(request: CreateOrderRequest): Promise<CreateOrderResponse> {
	// Logic with success
}

[01:23:29.425] INFO: [OrderUsecase][executeWithSuccess][Typeorm] transaction initialized.
[01:23:29.463] INFO: [OrderUsecase][executeWithSuccess][Typeorm] transaction completed successfully.


@Transactional({ logging: true })
async executeWithFailure(request: CreateOrderRequest): Promise<CreateOrderResponse> {
	// Logic with failure
}

[01:21:12.494] INFO: [OrderUsecase][executeWithFailure][Typeorm] transaction initialized.
[01:21:12.526] INFO: [OrderUsecase][executeWithFailure][Typeorm] has failed. Rollback realized successfully.
```

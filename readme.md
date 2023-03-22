# **Transaction Manager with Typescript Decorators**

📚 Abstracted transaction control for Typescript decorators, to facilitate transaction management and make the code cleaner.

<br>

[![tests](https://github.com/plinioduartt/ts-transaction-manager/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/plinioduartt/ts-transaction-manager/actions/workflows/tests.yml)
[![ci](https://github.com/plinioduartt/ts-transaction-manager/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/plinioduartt/ts-transaction-manager/actions/workflows/ci.yml)

<br>

## **Supported ORMs**

- [x] Typeorm (since v1.0.0)
- [x] Knex (since v1.0.15)
- [ ] Prisma (soon)
- [ ] Mongoose (soon)
- [ ] Sequelize (soon)

<br>

## **Why to use**

This is an abstract implementation to work with ORM transactions.

The main objective is to facilitate the flow of implementation and provide a powerfull feature, you can use the @Transactional decorator at usecases/services/adapters layer without the fear of coupling the layers of your application with the ORM specific syntax.

<br>

## **Quickstart**

<br>

**Configuration:**
- With TypeOrm
```
import { DataSource } from 'typeorm'
import { TransactionManager } from '@plinioduartt/ts-transaction-manager'

const dataSource: DataSource = new DataSource({
	...options
})

dataSource.initialize()

TransactionManager
	.addDataSource(dataSource)
	.setDefaultDataSource(dataSource)
```
- With Knex
```
mport knex, { Knex } from 'knex'
import { TransactionManager } from '@plinioduartt/ts-transaction-manager'

const dataSource: Knex = knex({
	...options
})

dataSource.initialize()

TransactionManager
	.addDataSource(dataSource)
	.setDefaultDataSource(dataSource)
```
<br>

**Example of use:**
- With TypeOrm
```
import { Transactional } from '@plinioduartt/ts-transaction-manager'

class Example1 {

	@Transactional()
	methodToBeCalled() {
		// all the database actions here are encapsulated by typeorm transaction...
		// you can do the database operations here or pass it to whatever other layer
	}
}
```
- With Knex
```
import { TransactionManager, Transactional } from '@plinioduartt/ts-transaction-manager'

class Example1 {

	@Transactional()
	methodToBeCalled() {
		// all the database actions here are encapsulated by knex transaction...
		// you can do the database operations here or pass it to whatever other layer

		const transaction: Knex.Transaction = await TransactionManager.getKnexTransaction()

		await knex('table_name').insert(data).transacting(transaction)
	}
}
```
*Obs: You'll need to remember to always retrieve the transaction from TransactionManager.getKnexTransaction() and pass inside .transacting() method

<br>

**The arguments are optionals:**
```
TransactionalOptions {
  orm?: SupportedOrms
  logging?: boolean
}

*Consider SupportedOrms = 'typeorm' | 'knex'.
In the future, it'll be available with more options for dataSource configuration.
```
<br>

**If you pass logging: true, then you'll see logs like that:**
```
[01:21:05.906] INFO: [OrderUsecase][executeWithSuccess] is being intercepted by Transactional decorator...
[01:21:05.914] INFO: [OrderUsecase][executeWithFailure] is being intercepted by Transactional decorator...


@Transactional({ orm: 'typeorm', logging: true })
async executeWithSuccess(request: CreateOrderRequest): Promise<CreateOrderResponse> {
	// Logic with success
}

[01:23:29.425] INFO: [OrderUsecase][executeWithSuccess][Typeorm] transaction initialized.
[01:23:29.463] INFO: [OrderUsecase][executeWithSuccess][Typeorm] transaction completed successfully.


@Transactional({ orm: 'typeorm', logging: true })
async executeWithFailure(request: CreateOrderRequest): Promise<CreateOrderResponse> {
	// Logic with failure
}

[01:21:12.494] INFO: [OrderUsecase][executeWithFailure][Typeorm] transaction initialized.
[01:21:12.526] INFO: [OrderUsecase][executeWithFailure][Typeorm] has failed. Rollback realized successfully.
```


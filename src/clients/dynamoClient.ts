import {
	AttributeMap,
	DeleteItemInput,
	DeleteItemOutput,
	DocumentClient,
	GetItemInput,
	GetItemOutput,
	QueryInput,
	QueryOutput,
} from 'aws-sdk/clients/dynamodb'

export interface DynamoClient {
	putItem: <T>(item: T, table: string) => Promise<void>
	updateItem: (params: DocumentClient.UpdateItemInput) => Promise<DocumentClient.UpdateItemOutput>
	getItem: (params: GetItemInput) => Promise<GetItemOutput>
	deleteItem: (params: DeleteItemInput) => Promise<DeleteItemOutput>
	query: (params: QueryInput) => Promise<QueryOutput>
	truncateTable: (TableName: string, hash: string, range?: string) => Promise<void>
}

export const createDynamoClient = (client = new DocumentClient()): DynamoClient => {
	const updateItem = async (params: DocumentClient.UpdateItemInput): Promise<DocumentClient.UpdateItemOutput> =>
		client.update(params).promise()

	const putItem = async <T>(item: T, table: string): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			client.put(
				{
					TableName: table,
					Item: item,
				},
				(err) => {
					if (err) {
						return reject(err)
					}
					resolve()
				},
			)
		})
	}

	const getItem = async (params: GetItemInput): Promise<GetItemOutput> => {
		return new Promise<GetItemOutput>((resolve, reject) => {
			client.get(params, (err, data) => {
				if (err) {
					reject(err)
				}
				resolve(data)
			})
		})
	}

	const deleteItem = async (params: DeleteItemInput): Promise<DeleteItemOutput> => {
		return new Promise<DeleteItemOutput>((resolve, reject) => {
			client.delete(params, (err, data) => {
				if (err) {
					reject(err)
				}
				resolve(data)
			})
		})
	}

	const query = async (params: QueryInput): Promise<QueryOutput> => {
		return new Promise<QueryOutput>((resolve, reject) => {
			client.query(params, (err, data) => {
				if (err) {
					reject(err)
				}
				resolve(data)
			})
		})
	}

	const getItemKeyAndValue = (item: AttributeMap, key?: string) => (key ? { [`${key}`]: item[`${key}`] } : {})

	const truncateTable = async (TableName: string, hash: string, range?: string): Promise<void> => {
		const { Items } = await client.scan({ TableName }).promise()
		if (!Items) {
			return
		}
		const keys = Items.map((item) => ({
			...getItemKeyAndValue(item, hash),
			...getItemKeyAndValue(item, range),
		}))
		if (!keys.length) {
			return
		}
		await Promise.all(keys?.map((Key) => deleteItem({ TableName, Key })))
	}

	return {
		putItem,
		updateItem,
		deleteItem,
		getItem,
		query,
		truncateTable,
	}
}

# MongoDB ORM

Bsonify is a type-safe, extensible Object-Relational Mapping (ORM) library for MongoDB, designed to simplify database interactions in TypeScript applications. This guide will walk you through installation, basic usage, creating and using extensions (plugins), and creating and using custom types.

---

## Table of Contents

1. [Installation](#installation)
2. [Connecting to MongoDB](#connecting-to-mongodb)
3. [Defining Models](#defining-models)
4. [Performing CRUD Operations](#performing-crud-operations)
5. [Using Plugins](#using-plugins)
6. [Creating a Plugin](#creating-a-plugin)
7. [Using Custom Types](#using-custom-types)
8. [Creating a Custom Type](#creating-a-custom-type)
9. [API Reference](#api-reference)
10. [Contributing](#contributing)

---

## Installation

To install the MongoDB ORM, use npm:

```bash
npm install bsonify
```
<!-- You also need to install the mongodb driver and reflect-metadata for decorators:

bash
npm install mongodb reflect-metadata -->

Ensure your tsconfig.json includes the following settings to enable decorators and metadata:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```
## Connecting to MongoDB
To connect to a MongoDB database, create an instance of the Bsonify class and call the connect method:

```typescript
import { Bsonify } from 'bsonify';

const orm = new Bsonify('mongodb://localhost:27017', 'testdb');

async function main() {
    await orm.connect();
    console.log('Connected to MongoDB');
}

main().catch(console.error);
```
## Defining Models
Models are defined using TypeScript classes and decorators. Each model corresponds to a MongoDB collection.

### Example: User Model
```typescript
import { Collection, Field } from 'mongodb-orm';

@Collection('users') // Specifies the collection name
class User {
    @Field({ required: true }) // Marks the field as required
    id: string;

    @Field({ required: true }) // Marks the field as required
    name: string;

    @Field({ required: true, unique: true }) // Marks the field as required and unique
    email: string;

    @Field({ default: 18 }) // Sets a default value
    age: number;

    @Field() // Optional field
    createdAt: Date;
}
```
## Performing CRUD Operations
#### Create a Document
To create a new document, use the create method:

```typescript
const userId = await orm.create(User, {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
});
console.log('Created user with ID:', userId);
```
#### Find a Document
To find a document, use the findOne method:

```typescript
const user = await orm.findOne(User, { email: 'john@example.com' });
console.log('Found user:', user);
```
#### Update a Document
To update a document, use the updateOne method:

```typescript
await orm.updateOne(User, { email: 'john@example.com' }, { name: 'John Updated' });
console.log('User updated');
```
#### Delete a Document
To delete a document, use the deleteOne method:

```typescript
await orm.deleteOne(User, { email: 'john@example.com' });
console.log('User deleted');
```
## Using Plugins
Plugins allow you to extend the ORM's functionality. For example, you can use the LoggingPlugin to log all operations:

```typescript
import { LoggingPlugin } from 'mongodb-orm';

orm.use(new LoggingPlugin());
```
Now, all operations will be logged to the console.

#### Creating a Plugin
A plugin is a class that implements the Plugin interface. For example:

```typescript
import { Plugin } from 'mongodb-orm';

export class MyPlugin implements Plugin {
    onInit(orm: any) {
        console.log('MyPlugin initialized');
    }

    async beforeCreate(model: any, data: any) {
        console.log(`Creating document in ${model.name}:`, data);
    }
}
```
#### Register your plugin:

```typescript
orm.use(new MyPlugin());
```
#### Using Custom Types
Custom types allow you to define custom serialization and deserialization logic for your fields. For example, you can create a JSONType to handle JSON data:

```typescript
import { CustomType } from 'mongodb-orm';

export class JSONType implements CustomType<object> {
    serialize(value: object): string {
        return JSON.stringify(value);
    }

    deserialize(value: string): object {
        return JSON.parse(value);
    }
}
```
Register the custom type and use it in your model:

```typescript
orm.registerCustomType('JSONType', new JSONType());

@Collection('users')
class User {
    @Field({ type: JSONType })
    metadata: object;
}
```
#### Creating a Custom Type
A custom type is a class that implements the CustomType interface. For example:

```typescript
import { CustomType } from 'mongodb-orm';

export class MyCustomType implements CustomType<MyType> {
    serialize(value: MyType): any {
        // Custom serialization logic
    }

    deserialize(value: any): MyType {
        // Custom deserialization logic
    }
}
```
## API Reference
For detailed usage, refer to the API Reference.

## Contributing
We welcome contributions! If you'd like to contribute to MongoDB ORM, please read our [Contributing Guidelines](./src/docs/contributing.md).

License
This project is licensed under the MIT License. See the LICENSE file for details.


---

### Key Features of the `README.md`

1. **Comprehensive Guide**: Covers installation, usage, plugins, and custom types.
2. **Code Examples**: Provides clear and concise examples for each feature.
3. **Modular Structure**: Breaks down the guide into logical sections.
4. **Links to Additional Docs**: Directs users to the API reference and contributing guidelines.

---

### How to Use

1. Save the above content in a file named `README.md`.
2. Place it in the root of your project.
3. Update the links (e.g., `./docs/api-reference.md`) to match your project structure.

---

This `README.md` ensures that users can quickly get started with your MongoDB ORM package and understand its core features and capabilities. 🚀
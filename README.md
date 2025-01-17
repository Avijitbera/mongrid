# Mongrid ORM

A lightweight, type-safe MongoDB ORM for Node.js and TypeScript. Easily define models, fields, validations, and hooks for your MongoDB collections.

---

## Table of Contents

1. [Installation](#installation)
2. [Connection Configuration](#connection-configuration)
3. [Model Building](#model-building)
4. [Field Builders](#field-builders)
5. [Validations](#validations)
6. [Hooks](#hooks)
7. [Relationships](#relationships)
8. [Querying Data](#querying-data)
   - [find](#find)
   - [findById](#findbyid)
9. [Query Builder](#query-builder)
10. [Example Usage](#example-usage)
    - [TypeScript](#typescript-example)
    - [JavaScript](#javascript-example)
11. [Contributing](#contributing)
12. [License](#license)

---

## Installation

Install the package using npm:

```bash
npm install mongrid
```

---

## Connection Configuration

To connect to your MongoDB database, create a `Database` instance:

### **TypeScript**

```typescript
import { Database, Connection } from 'mongrid';

const connection = new Connection(`mongodb+srv://${user}:${password}@localhost:27017/`);
await connection.connect('mydatabase');
const db = new Database(connection.getDatabase()!);
```

### **JavaScript**

```javascript
const { Database, Connection } = require('mongrid');

const connection = new Connection(`mongodb+srv://${user}:${password}@localhost:27017/`);
await connection.connect('mydatabase');
const db = new Database(connection.getDatabase());
```

- **Connection String**: Replace `mongodb+srv://${user}:${password}@localhost:27017/` with your MongoDB connection string.
- **Database Name**: Replace `mydatabase` with your database name.

---

## Model Building

Define your models using the `ModelBuilder` class. Each model corresponds to a MongoDB collection.

### **TypeScript**

```typescript
import { ModelBuilder, FieldBuilder, NestedField } from 'mongrid';

interface User {
    name: string;
    email: string;
    age: number;
    address: {
        city: string;
        country: string;
    };
}

const userModel = new ModelBuilder<User>(db, 'users')
    .addField('name', new FieldBuilder<string>('name').required().type(String).build())
    .addField('email', new FieldBuilder<string>('email').required().type(String).unique().build())
    .addField('age', new FieldBuilder<number>('age').type(Number).build())
    .addNestedField('address', new NestedField<object>('address')
        .addField('city', new FieldBuilder<string>('city').required().type(String).build())
        .addField('country', new FieldBuilder<string>('country').required().type(String).build())
    )
    .build();
```

### **JavaScript**

```javascript
const { ModelBuilder, FieldBuilder, NestedField } = require('mongrid');

const userModel = new ModelBuilder(db, 'users')
    .addField('name', new FieldBuilder('name').required().type(String).build())
    .addField('email', new FieldBuilder('email').required().type(String).unique().build())
    .addField('age', new FieldBuilder('age').type(Number).build())
    .addNestedField('address', new NestedField('address')
        .addField('city', new FieldBuilder('city').required().type(String).build())
        .addField('country', new FieldBuilder('country').required().type(String).build())
    )
    .build();
```

---

## Field Builders

Field builders allow you to define fields with various options:

### **Field Options**

| Option       | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `required()` | Marks the field as required.                                                |
| `unique()`   | Ensures the field value is unique across the collection.                    |
| `index()`    | Creates an index for the field.                                             |
| `type()`     | Specifies the field's data type (e.g., `String`, `Number`, `Boolean`).      |
| `default()`  | Sets a default value for the field.                                         |
| `alias()`    | Maps the field to a different name in the database.                         |
| `transform()`| Applies a transformation function to the field value before saving.         |

### **Example**

#### **TypeScript**

```typescript
const emailField = new FieldBuilder<string>('email')
    .required()
    .type(String)
    .unique()
    .default('example@example.com')
    .transform((value) => value.toLowerCase())
    .build();
```

#### **JavaScript**

```javascript
const emailField = new FieldBuilder('email')
    .required()
    .type(String)
    .unique()
    .default('example@example.com')
    .transform((value) => value.toLowerCase())
    .build();
```

---

## Validations

Validators ensure that your data meets specific requirements before saving it to the database.

### **Custom Validators**

Create custom validators by extending the `Validator` class:

#### **TypeScript**

```typescript
import { Validator } from 'mongrid';

class EmailValidator<T extends { email: string }> extends Validator<T> {
    message = 'Invalid email format';

    validate(document: T): string[] {
        const errors: string[] = [];
        if (!document.email.includes('@')) {
            errors.push('Email must contain "@"');
        }
        if (!document.email.endsWith('.com')) {
            errors.push('Email must end with ".com"');
        }
        return errors;
    }
}
```

#### **JavaScript**

```javascript
const { Validator } = require('mongrid');

class EmailValidator extends Validator {
    message = 'Invalid email format';

    validate(document) {
        const errors = [];
        if (!document.email.includes('@')) {
            errors.push('Email must contain "@"');
        }
        if (!document.email.endsWith('.com')) {
            errors.push('Email must end with ".com"');
        }
        return errors;
    }
}
```

### **Add Validators to a Model**

#### **TypeScript**

```typescript
const userModel = new ModelBuilder<User>(db, 'users')
    .addField('email', new FieldBuilder<string>('email').required().type(String).build())
    .addValidator(new EmailValidator())
    .build();
```

#### **JavaScript**

```javascript
const userModel = new ModelBuilder(db, 'users')
    .addField('email', new FieldBuilder('email').required().type(String).build())
    .addValidator(new EmailValidator())
    .build();
```

---

## Hooks

Hooks allow you to execute custom logic at specific points in the document lifecycle.

### **Hook Types**

| Hook Type   | Description                                      |
|-------------|--------------------------------------------------|
| `PreSave`   | Runs before saving a document.                  |
| `PostSave`  | Runs after saving a document.                   |
| `PreUpdate` | Runs before updating a document.                |
| `PostUpdate`| Runs after updating a document.                 |
| `PreRemove` | Runs before removing a document.                |
| `PostRemove`| Runs after removing a document.                 |

### **Example Hook**

#### **TypeScript**

```typescript
import { Hook, HookType } from 'mongrid';

class LogBeforeSaveHook<T> extends Hook<T> {
    async execute(data: T): Promise<void> {
        console.log('BeforeSave Hook: Document is about to be saved:', data);
    }
}

const userModel = new ModelBuilder<User>(db, 'users')
    .addHook(HookType.PreSave, new LogBeforeSaveHook())
    .build();
```

#### **JavaScript**

```javascript
const { Hook, HookType } = require('mongrid');

class LogBeforeSaveHook extends Hook {
    async execute(data) {
        console.log('BeforeSave Hook: Document is about to be saved:', data);
    }
}

const userModel = new ModelBuilder(db, 'users')
    .addHook(HookType.PreSave, new LogBeforeSaveHook())
    .build();
```

---

## Relationships

Mongrid supports **One-to-One**, **One-to-Many**, and **Many-to-Many** relationships between models.

### **Example: One-to-One Relationship**

#### **TypeScript**

```typescript
const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('title', new FieldBuilder<string>('title').required().type(String).build())
    .addField('content', new FieldBuilder<string>('content').required().type(String).build())
    .addField('author', new FieldBuilder<ObjectId>('author').required().type(ObjectId).build())
    .addOneToOne('author', userModel, 'author', true) // Cascade delete
    .build();
```

#### **JavaScript**

```javascript
const postModel = new ModelBuilder(db, 'posts')
    .addField('title', new FieldBuilder('title').required().type(String).build())
    .addField('content', new FieldBuilder('content').required().type(String).build())
    .addField('author', new FieldBuilder('author').required().type(ObjectId).build())
    .addOneToOne('author', userModel, 'author', true) // Cascade delete
    .build();
```

---

## Querying Data

Mongrid provides methods to query data from your collections, including `find` and `findById`.

### **find**

The `find` method allows you to query documents with optional population of related fields.

#### **TypeScript**

```typescript
const posts = await postModel.find({});
console.log(posts);

const postsWithAuthor = await postModel.find({}, {}, ['author']);
console.log(postsWithAuthor);
```

#### **JavaScript**

```javascript
const posts = await postModel.find({});
console.log(posts);

const postsWithAuthor = await postModel.find({}, {}, ['author']);
console.log(postsWithAuthor);
```

### **findById**

The `findById` method allows you to find a document by its ID and optionally populate related fields.


```typescript
const post = await postModel.findById(postId);
console.log(post);

const postWithAuthor = await postModel.findById(postId, ['author']);
console.log(postWithAuthor);
```

#### **JavaScript**

```javascript
const post = await postModel.findById(postId);
console.log(post);

const postWithAuthor = await postModel.findById(postId, ['author']);
console.log(postWithAuthor);
```

### **updateById**

The `updateById` method allows you to update a document by its ID.


```typescript
const post = await postModel.updateById(postId, {title: 'Updated Title'});
console.log(post);
```

#### **JavaScript**

```javascript
const post = await postModel.updateById(postId, {title: 'Updated Title'});
console.log(post);
```

---

## Query Builder

Mongrid provides a type-safe query builder for constructing complex queries.

### **Query Builder Methods**

| Method               | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `where(field, operator, value)` | Adds a condition to the filter using a comparison operator.                 |
| `whereId(id)`        | Adds a condition to filter by `_id`.                                        |
| `and(conditions)`    | Adds a logical AND condition to the filter.                                 |
| `or(conditions)`     | Adds a logical OR condition to the filter.                                  |
| `not(field, condition)` | Adds a logical NOT condition for a specific field.                         |
| `nor(conditions)`    | Adds a logical NOR condition to the filter.                                 |
| `limit(limit)`       | Sets the limit for the query.                                               |
| `skip(skip)`         | Sets the number of documents to skip.                                       |
| `sort(field, direction)` | Sets the sort order for the query.                                        |
| `populate(...fields)`| Adds fields to be populated (joined with related documents).                |
| `execute()`          | Executes the query and returns the results.                                 |
| `executeOne()`       | Executes the query and returns the first result or null.                    |

### **Example Usage**

#### **TypeScript**

```typescript
const queryBuilder = new QueryBuilder<User>(userModel)
    .where('age', 'greaterThan', 18) // Simplified comparison operator
    .where('name', 'equal', 'John Doe') // Simplified comparison operator
    .and([
        { status: 'in', ['active'] }, // Simplified comparison operator
    ])
    .limit(10)
    .sort('age', 'asc')
    .populate('email');

const users = await queryBuilder.execute();
console.log(users);
```

#### **JavaScript**

```javascript
const queryBuilder = new QueryBuilder(userModel)
    .where('age', 'greaterThan', 18) // Simplified comparison operator
    .where('name', 'equal', 'John Doe') // Simplified comparison operator
    .and([
        { status: 'in', ['active'] }, // Simplified comparison operator
    ])
    .limit(10)
    .sort('age', 'asc')
    .populate('email');

const users = await queryBuilder.execute();
console.log(users);
```

---

## Example Usage

### **TypeScript Example**

```typescript
import { Database, ModelBuilder, FieldBuilder, NestedField } from 'mongrid';

// Define the User type
interface User {
    name: string;
    email: string;
    age: number;
    address: {
        city: string;
        country: string;
    };
}

// Connect to the database
const db = new Database('mongodb://localhost:27017', 'mydatabase');

// Define the User model
const userModel = new ModelBuilder<User>(db, 'users')
    .addField('name', new FieldBuilder<string>('name').required().type(String).build())
    .addField('email', new FieldBuilder<string>('email').required().type(String).unique().build())
    .addField('age', new FieldBuilder<number>('age').type(Number).build())
    .addNestedField('address', new NestedField<object>('address')
        .addField('city', new FieldBuilder<string>('city').required().type(String).build())
        .addField('country', new FieldBuilder<string>('country').required().type(String).build())
    )
    .build();

// Save a user
async function createUser() {
    const userId = await userModel.save({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: {
            city: 'New York',
            country: 'USA',
        },
    });

    console.log('User saved with ID:', userId);
    return userId;
}

createUser().catch(console.error);

// update or create a user if it doesn't exist by the same ID
async function updateOrCreateUser(){
    const userId = await userModel.save({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: {
            city: 'New York',
            country: 'USA',
        },
        _id: 'existingUserId' // ObjectId
    });

    return userId;
}

updateOrCreateUser().catch(console.error);

```

### **JavaScript Example**

```javascript
const { Database, ModelBuilder, FieldBuilder, NestedField } = require('mongrid');

// Connect to the database
const db = new Database('mongodb://localhost:27017', 'mydatabase');

// Define the User model
const userModel = new ModelBuilder(db, 'users')
    .addField('name', new FieldBuilder('name').required().type(String).build())
    .addField('email', new FieldBuilder('email').required().type(String).unique().build())
    .addField('age', new FieldBuilder('age').type(Number).build())
    .addNestedField('address', new NestedField('address')
        .addField('city', new FieldBuilder('city').required().type(String).build())
        .addField('country', new FieldBuilder('country').required().type(String).build())
    )
    .build();

// Save a user
async function createUser() {
    const userId = await userModel.save({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: {
            city: 'New York',
            country: 'USA',
        },
    });

    console.log('User saved with ID:', userId);
    return userId;
}

createUser().catch(console.error);

// update or create a user if it doesn't exist by the same ID
async function updateOrCreateUser(){
    const userId = await userModel.save({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: {
            city: 'New York',
            country: 'USA',
        },
        _id: 'existingUserId' // ObjectId
    });

    return userId;
}

updateOrCreateUser().catch(console.error);

```

---

## Contributing

We welcome contributions from the community! Please read our [Contribution Guidelines](./docs/CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This updated `README.md` now focuses on the core features of Mongrid, including **query builder**, and provides clear examples for both TypeScript and JavaScript users.
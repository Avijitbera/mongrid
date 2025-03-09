# Mongrid ORM 🚀

![NPM Version](https://img.shields.io/npm/v/mongrid)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Avijitbera/https%3A%2F%2Fgithub.com%2FAvijitbera%2Fmongrid)
![Discord](https://img.shields.io/discord/1330906862396379248)
![Static Badge](https://img.shields.io/badge/Full-Documentaion-blue)
![NPM Last Update](https://img.shields.io/npm/last-update/mongrid?registry_uri=https%3A%2F%2Fgithub.com%2FAvijitbera%2Fmongrid&style=flat)
![NPM Downloads](https://img.shields.io/npm/dw/mongrid)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/mongrid)
![NPM License](https://img.shields.io/npm/l/mongrid)

A lightweight, type-safe MongoDB ORM for Node.js and TypeScript. Easily define models, fields, validations, and hooks for your MongoDB collections.

---

## 📢 Notice to Users

We value your feedback! If you encounter any issues, have suggestions for new features, or want to contribute to the improvement of Mongrid, please feel free to:

- **Report Bugs**: Open an issue on our [GitHub Issues](https://github.com/your-repo/mongrid/issues) page.
- **Suggest Features**: Share your ideas for new features or improvements.
- **Contribute**: Check out our [Contribution Guidelines](./docs/CONTRIBUTING.md) to get started.

Join our [Discord Community](https://discord.gg/your-invite-link) to connect with other developers and get real-time support.



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
   - [updateById](#updatebyid)
9. [Query Builder](#query-builder)
10. [Example Usage](#example-usage)
11. [Bug Issues](#bug-issues)
12. [Contributing](#contributing)
13. [License](#license)
14. [Full Documentation](#full-documentation)

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

```typescript
const emailField = new FieldBuilder<string>('email')
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

### **Add Validators to a Model**

```typescript
const userModel = new ModelBuilder<User>(db, 'users')
    .addField('email', new FieldBuilder<string>('email').required().type(String).build())
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

---

## Relationships

Mongrid supports **One-to-One**, **One-to-Many**, and **Many-to-Many** relationships between models.

### **Example: One-to-One Relationship**

```typescript
const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('title', new FieldBuilder<string>('title').required().type(String).build())
    .addField('content', new FieldBuilder<string>('content').required().type(String).build())
    .addField('author', new FieldBuilder<ObjectId>('author').required().type(ObjectId).build())
    .addOneToOne('author', userModel, 'author', true) // Cascade delete
    .build();
```

---

## Querying Data

Mongrid provides methods to query data from your collections, including `find`, `findById`, and `updateById`.

### **find**

The `find` method allows you to query documents with optional population of related fields.

```typescript
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

### **updateById**

The `updateById` method allows you to update a document by its ID.

```typescript
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

---

## Bug Issues

If you encounter any bugs or issues while using Mongrid, please report them on our [GitHub Issues](https://github.com/your-repo/mongrid/issues) page. We appreciate your feedback and will work to resolve any problems as quickly as possible.

---

## Contributing

We welcome contributions from the community! Please read our [Contribution Guidelines](./docs/CONTRIBUTING.md) to get started. Whether you want to report a bug, suggest a feature, or submit a pull request, your help is greatly appreciated.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Full Documentation

For complete documentation, including advanced usage, API references, and more examples, please visit our official documentation website: [Mongrid Documentation](https://mongrid-docs.com).

---

This updated `README.md` now includes a more visually appealing design with version badges, open issues, Discord online users, and a notice for users to contribute and suggest new features. The JavaScript implementations have been removed to focus on TypeScript. The quick links section is now wrapped for better readability.
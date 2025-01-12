
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
9. [Example Usage](#example-usage)
10. [Contributing](#contributing)
11. [License](#license)

---

## Installation

Install the package using npm:

```bash
npm install mongrid
```

---

## Connection Configuration

To connect to your MongoDB database, create a `Database` instance:

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

```typescript
import { ModelBuilder, FieldBuilder, NestedField } from 'mongrid';

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

Mongrid supports **One-to-One**, **One-to-Many**, and **Many-to-Many** relationships between models. You can define relationships using the `addOneToOne`, `addOneToMany`, and `addManyToMany` methods.

### **Example: One-to-One Relationship**

```typescript
const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('title', new FieldBuilder<string>('title').required().type(String).build())
    .addField('content', new FieldBuilder<string>('content').required().type(String).build())
    .addField('author', new FieldBuilder<ObjectId>('author').required().type(ObjectId).build())
    .addOneToOne('author', userModel, 'author', true) // Cascade delete
    .build();
```

### **Example: One-to-Many Relationship**

```typescript
const commentModel = new ModelBuilder<Comment>(db, 'comments')
    .addField('text', new FieldBuilder<string>('text').required().type(String).build())
    .addField('postId', new FieldBuilder<ObjectId>('postId').required().type(ObjectId).build())
    .addOneToMany('postId', postModel, 'comments', true) // Cascade delete
    .build();
```

### **Example: Many-to-Many Relationship**

```typescript
const tagModel = new ModelBuilder<Tag>(db, 'tags')
    .addField('name', new FieldBuilder<string>('name').required().type(String).build())
    .build();

const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('tags', new FieldBuilder<ObjectId[]>('tags').type(Array).build())
    .addManyToMany('tags', tagModel, 'posts', true) // Cascade delete
    .build();
```

---

## Querying Data

Mongrid provides methods to query data from your collections, including `find` and `findById`.

### **find**

The `find` method allows you to query documents with optional population of related fields.

#### **Example: Find All Posts**

```typescript
const posts = await postModel.find({});
console.log(posts);
```

#### **Example: Find Posts with Populated Author**

```typescript
const posts = await postModel.find({}, {}, ['author']);
console.log(posts);
```

### **findById**

The `findById` method allows you to find a document by its ID and optionally populate related fields.

#### **Example: Find a Post by ID**

```typescript
const post = await postModel.findById(postId);
console.log(post);
```

#### **Example: Find a Post by ID with Populated Author**

```typescript
const post = await postModel.findById(postId, ['author']);
console.log(post);
```

---

## Example Usage

Here’s a complete example of using the MongoDB ORM:

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

// Define the Post type
interface Post {
    title: string;
    content: string;
    author: ObjectId;
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

// Define the Post model
const postModel = new ModelBuilder<Post>(db, 'posts')
    .addField('title', new FieldBuilder<string>('title').required().type(String).build())
    .addField('content', new FieldBuilder<string>('content').required().type(String).build())
    .addField('author', new FieldBuilder<ObjectId>('author').required().type(ObjectId).build())
    .addOneToOne('author', userModel, 'author', true) // Cascade delete
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

// Save a post
async function createPost(userId: ObjectId) {
    const postId = await postModel.save({
        title: 'My First Post',
        content: 'This is a test post.',
        author: userId,
    });

    console.log('Post saved with ID:', postId);
    return postId;
}

// Find a post with populated author
async function findPost(postId: ObjectId) {
    const post = await postModel.findById(postId, ['author']);
    console.log('Post with populated author:', post);
}

// Main function
async function main() {
    const userId = await createUser();
    const postId = await createPost(userId);
    await findPost(postId);
}

main().catch(console.error);
```

---

## Contributing

We welcome contributions from the community! Please read our [Contribution Guidelines](./docs/CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This updated `README.md` now includes detailed sections on **relationships**, **find**, and **findById** functionality, making it easier for users to understand and use these features in your ORM.
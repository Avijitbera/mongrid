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
7. [Example Usage](#example-usage)
8. [Contributing](#contributing)
9. [License](#license)

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
import { Database } from 'mongrid';

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
}

createUser().catch(console.error);
```

---

## Contributing

We welcome contributions from the community! Please read our [Contribution Guidelines](./docs/CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a clear and concise guide for users to get started with your MongoDB ORM package. You can customize it further based on your package's specific features and requirements.
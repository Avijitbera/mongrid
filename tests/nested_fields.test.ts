import { cleanup, connect } from './db';
import { Database, FieldBuilder, Model, NestedField } from '../src';
import dotenv from 'dotenv';
import { ObjectId } from '../src/types';
dotenv.config();

interface Address {
    street: string;
    city: string;
    zip: string;
}

interface Customer {
    id: string;
    name: string;
    address: Address;
}
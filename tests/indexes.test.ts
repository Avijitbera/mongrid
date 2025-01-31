import { cleanup, connect } from './db';
import { Database, FieldBuilder, Model } from '../src';
import dotenv from 'dotenv';
import { ObjectId } from '../src/types';
dotenv.config();

interface Product {
    id: string;
    sku: string;
    name: string;
}
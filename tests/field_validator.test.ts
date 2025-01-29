import dotenv from 'dotenv';

dotenv.config();

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}
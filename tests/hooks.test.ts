import dotenv from 'dotenv';


dotenv.config();

interface Order {
    id: string;
    total: number;
    status: string;
}


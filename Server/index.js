import express from  'express';
import mongoose  from'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/route.js';

dotenv.config();
const PORT = process.env.PORT ;
const MONGODB = process.env.MONGODB_URI;

import cookieparser from 'cookie-parser';

const app = express();

// const route = express.Router();

app.use(cookieparser());

app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const router = require("./routes/route");
app.use('/api',router)

mongoose.connect(MONGODB)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((error) => console.error('Error connecting to MongoDB:', error.message));


app.listen(PORT, () => {
    console.log(`Server runs at port ${PORT}`);
    // console.log(`MongoDB URI: ${MONGODB}`);
});

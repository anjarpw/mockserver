import express from 'express';
import { adminRouter, mockRouter } from './router/admin.router';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use("/mock", mockRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

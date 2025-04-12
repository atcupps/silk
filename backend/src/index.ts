import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple GET route
app.get('/api/screenshot', (req: Request, res: Response) => {
    const link = req.query.link;
    console.log(link);
    res.send('Hello World!');
});

// Define a POST route that echoes back the JSON sent in the request body
app.post('/data', (req: Request, res: Response) => {
    const requestData = req.body;
    res.json({
        success: true,
        data: requestData
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

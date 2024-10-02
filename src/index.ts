import express from 'express';
import { generateAdminRouter, generateInMemoryEndpointManager, generateMockRouter, generateRedisEndpointManager } from './router/admin.router';
import { EndpointManager } from './endpointManager';


const args = process.argv.slice(2); // Get arguments passed after `--`

console.log("Arguments passed:", args);

// Example logic using arguments
const storageMode = args[0]; // First argument


let endpointManager: EndpointManager

if(storageMode === 'REDIS'){
    endpointManager = generateRedisEndpointManager()
}else{
    endpointManager = generateInMemoryEndpointManager()
}


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use("/mock", generateMockRouter(endpointManager));
app.use("/admin", generateAdminRouter(endpointManager));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

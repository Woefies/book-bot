import { ChatOpenAI } from "@langchain/openai";
import express from 'express';
import cors from 'cors';

const app = express();
const router = express.Router();

app.use(cors()); // Add CORS middleware before other middleware or routes

app.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

const book = await model.invoke("give me a book recommendation")
console.log(book.content)

app.use('/', router);

router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;
        const response = await model.invoke(query);
        res.json({ response });
    } catch (error) {
        console.log("error chat query");
        res.status(500).json({ error: "er is een fout met de query" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`De server staat aan op ${process.env.PORT}`);
});

const messageHistory = []; // Initialize an array to store message history
router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;

        // Store user input in the message history
        messageHistory.push({ user: query });

        // Use the existing model to generate book recommendations based on the input
        const bookRecommendations = await model.invoke(query);

        // Store book recommendations in the message history
        messageHistory.push({ books: bookRecommendations });

        res.json({ books: bookRecommendations });
    } catch (error) {
        console.error("error book recommendation query:", error);
        res.status(500).json({ error: "er is een fout met de query" });
    }
});

router.get('/history', (req, res) => {
    res.json({ messageHistory });
});
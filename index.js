import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // sert index.html depuis /public

const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "Meta-Llama-3_3-70B-Instruct",
    configuration: {
        baseURL: "https://llama-3-3-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1",
    },
});

// Convertit les messages bruts {role, content} en objets LangChain
function formatMessages(memory) {
    return memory.map((msg) => {
        if (msg.role && msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role && msg.role === "assistant") return new AIMessage(msg.content);
        if (msg.role && msg.role === "system") return new SystemMessage(msg.content);
        throw new Error("Rôle inconnu : " + msg.role);
    });
}

app.post("/chat/completions", async (req, res) => {
    const rawMemory = req.body.memory;

    try {
        const formattedMessages = formatMessages(rawMemory);
        const response = await chat.invoke(formattedMessages);
        console.log(response);
        res.json({ reply: response.content });
    } catch (error) {
        console.error("Erreur LLM complète :", error);
        res.status(500).json({ error: "Erreur côté LLM." });
    }
});

app.listen(3000, () => {
    console.log("✅ Serveur démarré sur http://localhost:3000");
});

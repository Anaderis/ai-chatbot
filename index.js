import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch"; // npm install node-fetch si besoin

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // Sert ton index.html

const baseURL = "https://llama-3-3-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1";

app.post("/chat/completions", async (req, res) => {
    const memory = req.body.memory;

    try {
        const response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "Meta-Llama-3_3-70B-Instruct",
                messages: memory
            })
        });

        const data = await response.json();

        if (data?.choices?.[0]?.message?.content) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error("Réponse invalide :", data);
            res.status(500).json({ error: "Pas de réponse valide du modèle." });
        }

    } catch (error) {
        console.error("Erreur API directe :", error);
        res.status(500).json({ error: "Erreur de communication avec l'API." });
    }
});

app.listen(3000, () => {
    console.log("✅ Serveur démarré sur http://localhost:3000");
});

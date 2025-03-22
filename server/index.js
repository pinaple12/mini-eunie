const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const axios = require("axios");
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = "./data.json";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1352821701578068110/TBaz9xUHC38ZXdEHpR0CqpsJlIzeMTnL9Yk-2-KdWHDnJ8TPBWXZsPR5tFGD2rS2lNkP"

  
  // Read all product links
  app.get("/products", (req, res) => {
    fs.readFile("./websites.txt", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading websites.txt:", err);
        return res.status(500).json({ error: "Failed to read product links" });
      }
  
      const products = data.split("\n").filter(line => line.trim() !== "");
      res.json({ products });
    });
  });

// Write
app.post("/data", (req, res) => {
    const { type, value } = req.body;
  
    let filePath;
  
    if (type === "product") {
      filePath = "./websites.txt";
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }
  
    fs.appendFile(filePath, value + "\n", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ error: "Failed to save data" });
      }
  
      res.json({ message: "Saved!" });
    });
  });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const notifyDiscord = async (link) => {
  try {
    await axios.post(DISCORD_WEBHOOK, {
      content: `🔔 ${link} is in stock!! 🍵`,
    });
    console.log("📣 Sent Discord notification for", link);
  } catch (err) {
    console.error("⚠️ Discord webhook failed:", err.message);
  }
};

const extractInventory = (html) => {
  const match = html.match(/"inventory_quantity"\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const checkInventory = () => {
  console.log(checkInventory);
  fs.readFile("./websites.txt", "utf8", async (err, data) => {
    if (err) return console.error("Error reading websites.txt:", err);

    let urls = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const stillWatching = [];

    for (const url of urls) {
      try {
        const response = await axios.get(url);
        const quantity = extractInventory(response.data);

        if (quantity !== null && quantity > 0) {
          console.log(`✅ IN STOCK: ${url}`);
          await notifyDiscord(url); // ✅ send Discord alert
        } else if (quantity === 0) {
          stillWatching.push(url); // keep watching
        } else {
          console.log(`❓ Couldn't find inventory for ${url}`);
          stillWatching.push(url);
        }
      } catch (err) {
        console.error(`❌ Error checking ${url}:`, err.message);
        stillWatching.push(url);
      }
    }

    fs.writeFileSync("./websites.txt", stillWatching.join("\n"));
  });
};

// Start inventory check
checkInventory();
setInterval(checkInventory, 5 * 60 * 1000);
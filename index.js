const TelegramBot = require("node-telegram-bot-api");
const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const express = require("express");

// Replace with your bot token from BotFather
const BOT_TOKEN = "7514306274:AAF4fv4o-TjgcrDfUTu8EyZQKB9-1v9FVAc";

// Wallet and token addresses
const WALLET_ADDRESS = "decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH";
const USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Mainnet USDC

// Initialize Solana connection
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// Initialize Express app
const app = express();
app.use(express.json());

// Create a bot instance
const bot = new TelegramBot(BOT_TOKEN);
const WEBHOOK_URL = `https://<your-render-domain>/bot${BOT_TOKEN}`;

// Function to fetch token balance
async function getTokenBalance(walletAddress, tokenAddress) {
    try {
        const wallet = new PublicKey(walletAddress);
        const token = new PublicKey(tokenAddress);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
            programId: TOKEN_PROGRAM_ID,
        });

        const tokenAccount = tokenAccounts.value.find(
            (account) => account.account.data.parsed.info.mint === tokenAddress,
        );

        if (tokenAccount) {
            const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
            return balance;
        }

        return 0;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0;
    }
}

// Set up webhook for Telegram bot
bot.setWebHook(WEBHOOK_URL);

// Define endpoint for webhook
app.post(`/bot${BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Command handlers
bot.onText(/\/goal/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `🚀 *Token Launch \\[December\\] Goal* 🚀  

We’re working on something big, but first, we need to hit a goal:  
👥 *1,000 Members*  

Here’s the deal: when we reach *690 members*, we’ll reveal the meme that started it all\\! Let’s make it happen—spread the word, and be part of the journey to launch the funniest token ever\\! 🎉  

Copy Invite Link: \`https://t\\.me/tokenlaunchDecember\``,
        { parse_mode: "MarkdownV2" },
    );

    try {
        const usdcBalance = await getTokenBalance(WALLET_ADDRESS, USDC_TOKEN_ADDRESS);
        const memberCount = await bot.getChatMemberCount(chatId);

        const response = `*Group Goal Progress:*\n👥 *Members:* ${memberCount}/1000 \n
        💸*Balance:* ${usdcBalance} USDC`;

        bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error fetching group members:", error);
        bot.sendMessage(
            chatId,
            "An error occurred while fetching group information. Please try again later.",
        );
    }
});

bot.onText(/\/getbalance/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const loadingMessage = await bot.sendMessage(chatId, "Fetching balances...");
        const usdcBalance = await getTokenBalance(WALLET_ADDRESS, USDC_TOKEN_ADDRESS);

        const targetText = `*Balance:* \`$${usdcBalance.toFixed(2)}\`\n*Wallet Address:* \`decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH\``;
        bot.sendMessage(chatId, targetText, { parse_mode: "MarkdownV2" });
    } catch (error) {
        console.error("Error:", error);
        bot.sendMessage(chatId, "❌ An error occurred while checking the balances.");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

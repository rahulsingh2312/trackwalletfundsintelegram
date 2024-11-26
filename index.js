const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

// Replace with your bot token from BotFather
const BOT_TOKEN = "7514306274:AAF4fv4o-TjgcrDfUTu8EyZQKB9-1v9FVAc";

// Wallet and token addresses
const WALLET_ADDRESS = "decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH";
const USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Mainnet USDC

// Solana connection
const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed",
);

// Express server and webhook setup
const app = express();
const PORT = process.env.PORT || 3000; // Define the port you want to serve at
const WEBHOOK_URL = `https://trackwalletfundsintelegram.onrender.com/bot${BOT_TOKEN}`; // Replace 'yourdomain.com' with your actual domain

app.use(express.json()); // Middleware to parse JSON bodies

// Initialize the bot
const bot = new TelegramBot(BOT_TOKEN, { webHook: true });
bot.setWebHook(WEBHOOK_URL);

// Function to fetch token balance
async function getTokenBalance(walletAddress, tokenAddress) {
    try {
        const wallet = new PublicKey(walletAddress);
        const token = new PublicKey(tokenAddress);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet,
            { programId: TOKEN_PROGRAM_ID },
        );

        const tokenAccount = tokenAccounts.value.find(
            (account) => account.account.data.parsed.info.mint === tokenAddress,
        );

        if (tokenAccount) {
            const balance =
                tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
            return balance;
        }

        return 0;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0;
    }
}

// Telegram command handlers
bot.onText(/\/goal/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `🚀 Token Launch \\[December\\] Goal 🚀\n\n` +
        `We’re working on something big, but first, we need to hit a goal:\n` +
        `👥 1,000 Members\n\n` +
        `Here’s the deal: when we reach 690 members, we’ll reveal the meme that started it all! ` +
        `Let’s make it happen—spread the word, and be part of the journey to launch the funniest token ever! 🎉\n\n` +
        `Copy Invite Link: https://t.me/tokenlaunchDecember`,
        { parse_mode: "MarkdownV2" },
    );

    try {
        const usdcBalance = await getTokenBalance(
            WALLET_ADDRESS,
            USDC_TOKEN_ADDRESS,
        );
        const memberCount = await bot.getChatMemberCount(chatId);

        const response = `Group Goal Progress:\n👥 Members: ${memberCount}/1000\n💸 Balance: ${usdcBalance} USDC`;
        bot.sendMessage(chatId, response);
    } catch (error) {
        console.error("Error:", error);
        bot.sendMessage(chatId, "An error occurred while fetching details.");
    }
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        "Welcome to Solana Balance Checker Bot!\n" +
        "Use /goal to check your group's goal progress.\n" +
        "Use /getbalance to check SOL and USDC balances.\n" +
        "Use /address to fetch the donation address.",
    );
});

bot.onText(/\/address/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Wallet Address: \`${WALLET_ADDRESS}\``, {
        parse_mode: "MarkdownV2",
    });
});

bot.onText(/\/getbalance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const usdcBalance = await getTokenBalance(
            WALLET_ADDRESS,
            USDC_TOKEN_ADDRESS,
        );

        bot.sendMessage(
            chatId,
            `💸 *Balance:* $${usdcBalance.toFixed(2)}\n` +
            `📬 *Wallet Address:* \`${WALLET_ADDRESS}\``,
            { parse_mode: "MarkdownV2" },
        );
    } catch (error) {
        console.error("Error:", error);
        bot.sendMessage(
            chatId,
            "❌ An error occurred while checking the balances.",
        );
    }
});

// Express route for webhook
app.post(`/bot${BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body); // Pass the update to Telegram Bot API
    res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

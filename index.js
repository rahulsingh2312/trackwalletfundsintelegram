const TelegramBot = require("node-telegram-bot-api");
const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

// Replace with your bot token from BotFather
const BOT_TOKEN = "7514306274:AAF4fv4o-TjgcrDfUTu8EyZQKB9-1v9FVAc";

// Wallet and token addresses
const WALLET_ADDRESS = "decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH";
const USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Mainnet USDC

// Initialize Solana connection
const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed",
);

// Create a bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Function to fetch token balance
async function getTokenBalance(walletAddress, tokenAddress) {
    try {
        const wallet = new PublicKey(walletAddress);
        const token = new PublicKey(tokenAddress);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet,
            {
                programId: TOKEN_PROGRAM_ID,
            },
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

// Command handler for /start
bot.onText(/\/goal/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const usdcBalance = await getTokenBalance(
            WALLET_ADDRESS,
            USDC_TOKEN_ADDRESS
        );
        const memberCount = await bot.getChatMemberCount(chatId);

        const response = `🚀 *Token Launch \\[December\\] Goal* 🚀\n\n` +
            `👥 *Members:* ${memberCount}/1000\n` +
            `💸 *Balance:* \`$${usdcBalance.toFixed(2)}\`\n\n` +
            `When we hit *690 members*, we'll reveal the meme behind it all\\!\n\n` +
            `Copy Invite Link: \`https://t\\.me/tokenlaunchDecember\``;

        bot.sendMessage(chatId, response, { parse_mode: "MarkdownV2" });
    } catch (error) {
        console.error("Error fetching group members:", error);
        bot.sendMessage(chatId, "❌ An error occurred while fetching group details.");
    }
});

bot.onText(/\/address/, async (msg) => {
    const chatId = msg.chat.id;
    const response = `*Wallet Address:* \`decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH\``;
    bot.sendMessage(chatId, response, { parse_mode: "MarkdownV2" });
});

bot.onText(/\/getbalance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const usdcBalance = await getTokenBalance(
            WALLET_ADDRESS,
            USDC_TOKEN_ADDRESS
        );

        const response = `💰 *Wallet Balance:* \`$${usdcBalance.toFixed(2)}\`\n` +
            `📥 *Donate to:* \`decaW6NX7WSmYKUetF6LLsTTo6MxE6aNUJRkSbH4xaH\``;

        bot.sendMessage(chatId, response, { parse_mode: "MarkdownV2" });
    } catch (error) {
        console.error("Error fetching balances:", error);
        bot.sendMessage(chatId, "❌ An error occurred while fetching the balance.");
    }
});

// Error handler
bot.on("error", (error) => {
    console.error("Telegram Bot Error:", error);
});

// Error handler
bot.on("error", (error) => {
    console.error("Telegram Bot Error:", error);
});

// Start message
console.log("Solana Balance Checker Bot is running...");

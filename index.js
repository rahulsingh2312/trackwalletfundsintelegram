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
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        "Welcome to Solana Balance Checker Bot!\n" +
        "Use /getbalance to check SOL and USDC balances\n" +
        "Use /goal to check project details\n" +
        "Use /address to get wallet address"
    );
});

// Command handler for /goal
bot.onText(/\/goal/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `🚀 Token Launch \\[December\\] Goal 🚀\n\n` +
        `We're working on something big, but first, we need to hit a goal:\n` +
        `👥 1,000 Members\n\n` +
        `Here's the deal: when we reach 690 members, we'll reveal the meme that started it all! ` +
        `Let's make it happen—spread the word, and be part of the journey to launch the funniest token ever! 🎉\n\n` +
        `Copy Invite Link: https://t.me/tokenlaunchDecember`,
        { parse_mode: "MarkdownV2" }
    );
});

// Command handler for /address
bot.onText(/\/address/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Wallet Address: \`${WALLET_ADDRESS}\``, {
        parse_mode: "MarkdownV2",
    });
});

// Command handler for /getbalance
bot.onText(/\/getbalance/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Send loading message
        const loadingMessage = await bot.sendMessage(
            chatId,
            "Fetching balances...",
        );
        
        // Fetch USDC balance
        const usdcBalance = await getTokenBalance(
            WALLET_ADDRESS,
            USDC_TOKEN_ADDRESS,
        );
        
        // Update message with both balances
        await bot.editMessageText(
            `💰 Wallet Balances:\n\n` +
            `USDC: ${usdcBalance.toFixed(2)} USDC\n\n` +
            `🔍 Address: ${WALLET_ADDRESS}`,
            {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
            },
        );
    } catch (error) {
        console.error("Error:", error);
        bot.sendMessage(
            chatId,
            "❌ An error occurred while checking the balances.",
        );
    }
});

// Error handler
bot.on("error", (error) => {
    console.error("Telegram Bot Error:", error);
});

// Start message
console.log("Solana Balance Checker Bot is running...");
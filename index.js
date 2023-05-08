const { Telegraf } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const { BOT_TOKEN, OWNER_ID, MAX_TOKEN } =
  (setting = require("./configAI.json"));
const configuration = new Configuration({
  apiKey: setting.OPENAI_APIKEY,
});
const bot = new Telegraf(BOT_TOKEN);
const client = bot.telegram;
let users = JSON.parse(fs.readFileSync("./db/users.json", "utf8"));

function reply(chatid, message, msgid, opts) {
  return client.sendMessage(chatid, message, {
    reply_to_message_id: msgid,
    ...opts,
  });
}

const color = require("chalk");

bot.on("message", async (ctx) => {
  let body = ctx.message.text || ctx.message.caption || "";
  let text = ctx.message.text || ctx.message.caption || "";
  let chatId = ctx.message.chat.id;
  let userId = ctx.message.from.id;
  let messageId = ctx.message.message_id;
  let username = ctx.message.from.username;
  let isOwner = OWNER_ID.includes(userId);
  let name = ctx.message.from.first_name;
  let lastName = ctx.message.from.last_name;
  let chatType = ctx.message.chat.type;
  let fullName = name + " " + (lastName ? lastName : "").trim();
  let mention = username ? "@" + username : fullName;
  let mentionId = fullName ? fullName : username ? "@" + username : userId;
  let userIdLink = "tg://user?id=" + userId;
  let args = text.split(" ").slice(1);
  let command = text.split(" ")[0].toLowerCase();
  let q = args.join(" ");
  console.log(
    color.green(new Date().toLocaleString() + " ") +
      color.white(username + " ") +
      color.cyan(body) +
      color.green(" From ") +
      color.white(userId + " ")
  );

  if (!users[userId]) {
    users[userId] = {
      id: userId,
      username: username || firstName,
    };
    fs.writeFileSync("./db/users.json", JSON.stringify(users, null, 2));
  }

  switch (command) {
    case "/start":
      let shareText = `Cobain Nih!!
Chat Bot AI yang akan membantu kamu. 
Kirimkan pertanyaan kamu disini, nanti bot akan menjawab pertanyaan kamu.
https://t.me/${bot.botInfo.username.toLowerCase()}`;
      let capt = `Hai Kak, Selamat Datang👋\n\nSaya adalah Robot AI untuk menjawab pertanyaan anda, Silahkan kirim Pertanyaan kamu, nanti jawaban kamu akan dijawab oleh robot.\n\n- Bot dibatasi menjawab maximal ${MAX_TOKEN} Kata/Huruf\n\n📌 Don't Forget to Share This AI BOT to Your Friends... Thank You!\n\nHave Fun 🤩\n\nCommands : \n/ai </ask question>\n/img </generate image>`;
      reply(chatId, capt.trim(), messageId, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Instagram", url: "https://instagram.com/xzhndvs" }],
            [{ text: "🔗 Whatsapp", url: "https://wa.me/6281281524356" }],
            [{ text: "🌐 Official Website", url: "https://xnbl354.xyz" }],
            [{ text: "🛠 Find Bugs ?", url: "https://t.me/xzhndvs" }],
            [
              {
                text: "📢 Share Bot",
                url:
                  "https://t.me/share/url?" +
                  new URLSearchParams({ text: shareText }),
              },
            ],
          ],
        },
      });
      break;

    case ">":
      if (args.length == 0)
        return reply(chatId, "Send me a code for execute.", messageId);
      if (!isOwner) return reply(chatId, "You are not my owner.", messageId);
      let code = args.join(" ");
      try {
        let evaled = await eval(`(async () => { ${code} })()`);
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled, { depth: 7 });
        reply(chatId, evaled, messageId);
      } catch (err) {
        reply(chatId, err, messageId);
      }
      break;
    case "/stats":
      det = new Date();
      x = await reply(chatId, "Wait!", messageId);
      dex = new Date() - det;
      client.editMessageText(
        chatId,
        x.message_id,
        null,
        `Pong!!!\nSpeed : ${dex < 1000 ? dex : dex / 1000} ${
          dex < 1000 ? "ms" : "Seconds"
        }
▾ SERVER INFORMATION ▾
° Plɑtform : ${process.platform}
° Nodejs : ${process.version}`
      );
      break;
    case "/broadcast":
      if (userId != OWNER_ID)
        return ctx.reply(`You don't have access for this feature!!`);
      success = 0;
      for (let i of Object.keys(users)) {
        try {
          await ctx.telegram.sendMessage(i, `*Broadcast:*\n${q}`, {
            parse_mode: "Markdown",
          });
          success++;
        } catch (e) {
          console.log(e);
        }
      }
      ctx.reply(
        `*Broadcast sent!*\nSuccess: \`${success}\`\nFailed: \`${
          Object.keys(users).length - success
        }\``,
        { parse_mode: "Markdown" }
      );
      break;
    case "/ai": case "/bot": case "/openai": case "/chatgpt": case "/ask":
      client.sendChatAction(chatId, "typing");
      if (!q) return reply(chatId, `Chat dengan AI.\n\nContoh:\n${command} Apa itu resesi`, messageId);
      try {
        const configuration = new Configuration({
          apiKey: "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",
        });
        const openai = new OpenAIApi(configuration);
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: q }],
        });
        reply(chatId, `${response.data.choices[0].message.content}`, messageId);
        if (setting.debug) console.log(response.data);
        console.log(
          color.cyan("User : ") +
            color.white(body) +
            "\n" +
            color.green("Bot AI : ") +
            color.white(response.data.choices[0].message.content)
        );
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
          console.log(`${error.response.status}\n\n${error.response.data}`);
        } else {
          console.log(error);
          reply(chatId,"Maaf, sepertinya ada yang error :" + error.message.messageId);
        }
      }
      break;
    case "/img":
    try {
        client.sendChatAction(chatId, "typing");
        if (!q) return reply(chatId, `Chat dengan AI.\n\nContoh:\n${command} Wooden house on snow mountain`, messageId);
        const configuration = new Configuration({
            apiKey: "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",
          });
          const openai = new OpenAIApi(configuration);
          const response = await openai.createImage({
            prompt: q,
            n: 1,
            size: "512x512",
          });
          ctx.replyWithPhoto(response.data.data[0].url, { caption: `*${q}*`, parse_mode: 'Markdown' });
          if (setting.debug) console.log(response.data.data[0].url);
        console.log(
          color.cyan("User : ") +
            color.white(body) +
            "\n" +
            color.green("Bot AI : ") +
            color.white(response.data.data[0].url)
        );
          } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
          console.log(`${error.response.status}\n\n${error.response.data}`);
        } else {
          console.log(error);
          reply(chatId, "Maaf, sepertinya ada yang error :"+ error.message, messageId);
        }
      }
        break;
    default:
  }
});

bot
  .launch()
  .then(() => {
    console.log("Bot started!");
  })
  .catch((err) => {
    console.log(err);
  });

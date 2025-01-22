const { Telegraf } = require("telegraf");
const token = "7555156483:AAHL-cHA4s9X0d49P1_CoLLDOUmZFglz2bI";
const UserModel = require("./models/users.models");
const { mongoose } = require("mongoose");
const fetch = require("node-fetch");

const tg_bot = new Telegraf(token);

mongoose.connect("mongodb://localhost:27017/telegram_bot");

const ChannelId = "@muhammmadjonoff";

(async () => {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'To start this bot and join a channel' },
      { command: 'phone', description: 'Send phone number' },
      { command: 'language', description: 'Update user language' },
      { command: 'products', description: 'Show all products' },
      { command: 'users', description: 'Show all users' },
    ]);
    console.log('Commands set successfully!');
  } catch (error) {
    console.error('Failed to set commands:', error);
  }
})();

tg_bot.start(async (ctx) => {
  const checkUsers = await ctx.telegram.getChatMember(ChannelId, ctx.from.id);
  const existsUser = ["member", "administrator", "creator"].includes(
    checkUsers.status
  );

  if (existsUser) {
    try {
      const find = await UserModel.findOne({ telegramId: ctx.from.id });
      if(!find) {
        await UserModel.create({username: ctx.from.first_name, telegramId: ctx.from.id, userLanguage: ctx.from.language_code});
        ctx.reply(`${ctx.from.first_name} Ma'lumotlaringiz muvaffaqiyatli saqlandi ✅`);
      } else {
        ctx.reply(`${ctx.from.first_name} ma'lumotlaringiz allaqachon saqlandi`);
      }
    } catch (error) {
      console.log(error.message);
    }
    ctx.reply(`Siz allaqachon kanalga obuna bo'lgansiz`);
  } else {
    ctx.reply("Kanalga obuna bo'lish", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "join", url: "https://t.me/muhammmadjonoff" }],
        ],
      },
    });
  }
});


tg_bot.command("phone", async (ctx) => {
  const find = await UserModel.findOne({ telegramId: ctx.from.id });
  if (!find) {
    ctx.reply(
      `Assalomu alaykum ${ctx.from.first_name} Telefon raqamingizni yuboring`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Phone",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    ctx.reply(
      `${ctx.from.first_name} ma'lumotlaringiz allaqachon saqlandi, qolgan komandalardan foydalanib ko'ring`
    );
  }
});


tg_bot.on("contact", async (ctx) => {
  try {
    const newUser = new UserModel({
      userName: ctx.from.first_name,
      telegramId: ctx.from.id,
      userLanguage: ctx.from.language_code,
      userPhone: ctx.message.contact.phone_number,
    });
    await newUser.save();
  } catch (error) {
    console.log(error.message);
  }
  ctx.reply(`Telefon raqamingiz: ${ctx.message.contact.phone_number}`);
  ctx.reply("Ma'lumotlaringiz muvaffaqiyatli saqlandi ✅");
});


tg_bot.command("users", async (ctx) => {
  try {
    ctx.reply("Users...");
    const allUsers = await UserModel.find();
    ctx.reply(`All users:\n ${allUsers}`);
  } catch (error) {
    console.log(error.message);
  }
});


tg_bot.command("products", async (ctx) => {
  ctx.reply('Mahsulotlar kelmoqda...');
  try {
    const response = await fetch("https://67914eecaf8442fd7379b533.mockapi.io/products_api");
    const products = await response.json();

    if (products.length === 0) {
      return ctx.reply("Mahsulotlar mavjud emas 🤔");
    }
    products.forEach((product) => {
    ctx.reply( `{ \nProductName: ${product.name}\nPrice: ${product.price}\nColor: ${product.color}\nDescription: ${product.description}\nTitle: ${product.title}\n }`);
    });
  } catch (error) {
    console.log(error.message);
    ctx.reply("Mahsulotlarni olishda xatolik yuz berdi");
  }
});


tg_bot.command('language', (ctx) => {
  ctx.reply('Tilni tanlang', {
    reply_markup: {inline_keyboard: [
      [{text: 'uz',  callback_data: 'uz'}], 
      [{text: 'rus', callback_data: 'rus'}], 
      [{text: 'eng', callback_data: 'eng'}],
    ],
    }
  })
});


tg_bot.on('callback_query', async (ctx) => {
  const languages = ctx.callbackQuery.data;
  try {
    const findUser = await UserModel.findOne({ telegramId: ctx.from.id });
    if(!findUser) {
      return ctx.reply("Foydalanuvchi topilmadi ❗");
    }
    findUser.userLanguage = languages;
    await findUser.save();  
    await ctx.reply(`Tanlangan til muvaffaqiyatli "${languages}" tiliga o'zgartirildi ✅`);
  } catch (error) {
    console.log(error.message);
    ctx.reply("Xato yuz berdi, qayta urinib ko'ring");
  }
});

tg_bot.launch();
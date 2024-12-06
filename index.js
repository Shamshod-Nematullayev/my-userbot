require("dotenv").config();
const MTProto = require("@mtproto/core");
const path = require("path");
const fs = require("fs-extra");
const readline = require("readline");
const crypto = require("crypto");
const { login } = require("./auth");
const { call, sendMessage, editMessage } = require("./helpers");
const { mtproto } = require("./core/bot");

// Start the bot
async function startUserbot() {
  console.log("Checking session...");

  try {
    const me = await call("users.getFullUser", {
      id: {
        _: "inputUserSelf",
      },
    });
    // console.log("Logged in as:", me);
  } catch (error) {
    if (error.error_message === "AUTH_KEY_UNREGISTERED") {
      console.log("Session not found. Starting manual login.");
      await login();
    } else {
      console.error("Error:", error);
    }
  }
}

startUserbot().catch(console.error);

console.log("boshlandi");
// mtproto.updates.on("updateShortMessage", (updateInfo) => {
//   console.log(updateInfo);
// });
// mtproto.call("messages.sendMessage", {
//   peer: {
//     _: "inputPeerSelf",
//     user_id: 5347896070,
//   },
//   message: "Nimadir degim keldi",
//   random_id: Math.floor(Math.random() * 1e10),
// });

// sendMessage(7436037316, "Dilnuram seni sevaman");
const sevgiIzhorlari = [
  "I love you,!", // Ingliz tili
  "Te quiero,!", // Ispan tili
  "Je t'aime,!", // Fransuz tili
  "Ich liebe dich,!", // Nemis tili
  "Ti amo,!", // Italiyacha
  "Seni seviyorum,!", // Turkiy tili
  "애가 사랑해요,!", // Koreys tili
  "मैं तुमसे प्यार करता हूँ,!", // Hind tili
  "Я тебя люблю,!", // Rus tili
  "Seni seviyorum,!", // O'zbek tili
  "أنا أحبك,!", // Arab tili
  "愛してる,!", // Yapon tili
  "Saya cinta padamu,!", // Malay tili
  "Aashiq hoon main tera,!", // Hind tili (poetik shakl)
  "ฉันรักเธอ,!", // Tailand tili
  "Eu te amo,!", // Portuqal tili
];

const prase = ["Men", "seni", "sevaman ❤️"];
let counter = 0;
// setInterval(() => {
//   if (counter === 3) {
//     counter = 0;
//   }
//   editMessage(
//     { _: "inputPeerUser", user_id: 7436037316 },
//     73285,
//     prase[counter]
//   );
//   counter++;
// }, 3000);

mtproto.updates.on("updateShortMessage", (ctx) => {
  if (ctx.out) {
    let string = ctx.message;
    let index = 1;

    const interval = setInterval(async () => {
      try {
        // Xabar to'liq bo'lsa, oxirgi tahrirni amalga oshir va intervalni to'xtat
        if (index >= string.length) {
          await editMessage(
            {
              _: "inputPeerUser",
              user_id: ctx.user_id,
            },
            ctx.id,
            string
          );
          clearInterval(interval);
          return;
        }

        // Xabarni qisman tahrir qilish
        await editMessage(
          {
            _: "inputPeerUser",
            user_id: ctx.user_id,
          },
          ctx.id,
          string.slice(0, index) + "░"
        );

        // Indexni oshirish faqat muvaffaqiyatli editMessage chaqiruvidan keyin
        index++;
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        clearInterval(interval); // Xatolik yuz berganda intervalni to'xtat
      }
    }, 200);
  }
});

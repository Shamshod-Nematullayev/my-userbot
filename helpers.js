const { mtproto } = require("./core/bot");

// Helper for MTProto calls
async function call(method, params = {}) {
  try {
    const result = await mtproto.call(method, params);
    return result;
  } catch (error) {
    console.error(`MTProto call error on method ${method}:`, error);
    throw error;
  }
}

async function sendMessage(user_id, messageText) {
  try {
    const result = await mtproto.call("messages.sendMessage", {
      peer: {
        _: "inputPeerUser",
        user_id: user_id,
      },
      message: messageText,
      random_id: Math.floor(Math.random() * 1e10), // Tasodifiy ID
    });
    return result;
  } catch (error) {
    console.error("Xatolik yuz berdi:", error);
  }
}

async function editMessage(peer, messageId, newMessageText) {
  try {
    const result = await mtproto.call("messages.editMessage", {
      peer: peer,
      id: messageId,
      message: newMessageText,
      media: null, // Agar yangi media qo'shmoqchi bo'lsangiz, media ob'ektini bu yerga kiritishingiz mumkin
      reply_markup: null, // Interaktiv tugmalar uchun, bu parametrni qo'shishingiz mumkin
    });
    // console.log("Xabar muvaffaqiyatli tahrirlandi:", result);
  } catch (error) {
    console.error("Xatolik yuz berdi:", error);
  }
}

module.exports = { call, sendMessage, editMessage };

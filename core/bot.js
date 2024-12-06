const MTProto = require("@mtproto/core");
const path = require("path");

const api_id = process.env.API_ID;
const api_hash = process.env.API_HASH;

const sessionFilePath = path.resolve(__dirname, "../session.json");

const mtproto = new MTProto({
  api_id: Number(api_id),
  api_hash,
  storageOptions: {
    path: sessionFilePath,
  },
});

module.exports = { mtproto };

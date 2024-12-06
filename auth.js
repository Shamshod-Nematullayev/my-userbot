const readline = require("readline");
const crypto = require("crypto");

const { call } = require("./helpers");

// Function to ask for user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

// Login function
async function login() {
  const phone = await askQuestion(
    "Enter your phone number (e.g., +123456789): "
  );
  const { phone_code_hash } = await call("auth.sendCode", {
    phone_number: phone,
    settings: {
      _: "codeSettings",
    },
  });

  const code = await askQuestion("Enter the code you received: ");
  try {
    const signIn = await call("auth.signIn", {
      phone_number: phone,
      phone_code_hash,
      phone_code: code,
    });
    console.log("Login successful! User:", signIn);
  } catch (error) {
    if (error.error_message === "SESSION_PASSWORD_NEEDED") {
      console.log("Two-factor authentication is enabled. Enter your password.");
      await handlePasswordLogin();
    } else {
      console.error("Error during login:", error);
    }
  }
}

// Handle two-factor authentication login
async function handlePasswordLogin() {
  const password = await askQuestion("Enter your Telegram password: ");
  const { srp_id, current_algo, srp_B } = await call("account.getPassword");

  const g = BigInt(current_algo.g);
  const p = BigInt(`0x${current_algo.p}`);
  const B = BigInt(`0x${srp_B}`);
  const salt1 = Buffer.from(current_algo.salt1, "hex");
  const salt2 = Buffer.from(current_algo.salt2, "hex");

  // Calculate x (password hash)
  const hash1 = crypto
    .createHash("sha256")
    .update(Buffer.concat([salt1, Buffer.from(password)]));
  const hash2 = crypto
    .createHash("sha256")
    .update(Buffer.concat([salt2, hash1.digest()]));
  const x = BigInt(`0x${hash2.digest("hex")}`);

  // Calculate g^x mod p
  const g_x = modExp(g, x, p);

  // Calculate k
  const k = BigInt(
    `0x${crypto
      .createHash("sha256")
      .update(
        Buffer.concat([
          Buffer.from(p.toString(16), "hex"),
          Buffer.from(g.toString(16), "hex"),
        ])
      )
      .digest("hex")}`
  );

  // Calculate A (public key)
  const a = BigInt(`0x${crypto.randomBytes(256).toString("hex")}`);
  const A = modExp(g, a, p);

  // Calculate u
  const uHash = crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        Buffer.from(A.toString(16), "hex"),
        Buffer.from(B.toString(16), "hex"),
      ])
    )
    .digest("hex");
  const u = BigInt(`0x${uHash}`);

  // Calculate K (shared secret)
  const K = modExp(B - k * g_x, a + u * x, p);

  // Calculate M1
  const KHash = crypto
    .createHash("sha256")
    .update(Buffer.from(K.toString(16), "hex"))
    .digest();
  const M1 = crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        Buffer.from(A.toString(16), "hex"),
        Buffer.from(B.toString(16), "hex"),
        KHash,
      ])
    )
    .digest();

  // Send password to Telegram
  const signIn = await call("auth.checkPassword", {
    password: {
      _: "inputCheckPasswordSRP",
      srp_id,
      A: A.toString(16),
      M1: M1.toString("hex"),
    },
  });

  console.log("Two-factor authentication successful! User:", signIn);
}

// Modular Exponentiation
function modExp(base, exp, mod) {
  if (exp === BigInt(0)) return BigInt(1);
  if (exp % BigInt(2) === BigInt(0)) {
    const half = modExp(base, exp / BigInt(2), mod);
    return (half * half) % mod;
  }
  return (base * modExp(base, exp - BigInt(1), mod)) % mod;
}

module.exports = { login };

// Entry point untuk Vercel Serverless Function.
//
// Vercel tidak menyediakan socket persistent, jadi aplikasi Express tidak
// boleh memanggil app.listen(). Sebagai gantinya, function ini menerima
// (req, res) dari Node.js runtime dan meneruskannya ke Express.
//
// Seluruh request (API, halaman HTML, file statis) diarahkan ke sini
// melalui rules "rewrites" di vercel.json.

const app = require('../server');

module.exports = (req, res) => {
    return app(req, res);
};
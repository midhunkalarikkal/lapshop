const mongoose = require('mongoose');
require('dotenv').config();

async function mongooseConnection() {
   try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(process.env.MONGOOSE_CONNECTION);

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛒 LAPSHOP | DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Status       : Connected
  🍃 Database     : ${mongoose.connection.name}
  🔗 Connection   : MongoDB
  🌍 Environment  : ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
   } catch (error) {
      console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛒 LAPSHOP | DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ❌ Status       : Connection Failed
  ⚠️  Error        : ${error.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

      process.exit(1);
   }
}

module.exports = {
   mongooseConnection,
};

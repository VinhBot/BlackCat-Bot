const { setupDatabase } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
module.exports = async(guild) => {
  // xoá database khi bot rời khỏi guilds
  await database.delete(guild);
  // thông báo đã rời khỏi guilds nào 
  console.log(`Đã rời khỏi ${guild.name} (${guild.id})`);
};
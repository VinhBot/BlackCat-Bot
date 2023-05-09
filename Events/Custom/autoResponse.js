const { Database } = require("st.db");
const autoresponsedata = new Database("./Assets/Database/autoresponse.json", { 
  databaseInObject: true 
});

module.exports = {
	eventName: "messageCreate", // tên events
	eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
	executeEvents: async(client, message) => {
    if(message.author.bot || !message.guild) return;
    const checkData = await autoresponsedata.has(message.guild.id);
    if(!checkData) {
      await autoresponsedata.set(message.guild.id, [
          { name: "", wildcard: "", responses: "" }
      ]); 
    };
    const data = await autoresponsedata.get(message.guild.id);
    if(!data) return;
    if(data) {
      if(data.some((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard)) {
         let response = data.find((data) => message.cleanContent.includes(data.name) && data.wildcard || data.name == message.cleanContent && !data.wildcard);
         return message.reply({ 
           content: `${response.responses}`
         }).catch((ex) => {});
      };
    };
  },
};
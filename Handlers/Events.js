const ascii = require("ascii-table");
const fs = require("node:fs");

module.exports = (client) => { 
  /*========================================================
  # Commands 
  ========================================================*/
  const commandHandler = async(options) => {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên File", "Trạng thái");
    const commandsPath = options;
    fs.readdirSync(commandsPath).forEach((dir) => {
      const commands = fs.readdirSync(`${commandsPath}/${dir}/`).filter((file) => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if(pull.commandName) {
          client.commands.set(pull.commandName, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, "❌");
          continue;
        };
        if(pull.commandAliases && Array.isArray(pull.commandAliases)) {
           pull.commandAliases.forEach((alias) => client.aliases.set(alias, pull.commandName));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  /*========================================================
  # Events
  ========================================================*/
  const executeEvents = async(options) => {
    let Events = new ascii("Events - Create");
    Events.setHeading("File", "Events");
    const eventFiles = fs.readdirSync(options.eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
    	const event = require(`${options.eventsPath}/${file}`);
	    if(event.eventName) {
        if(event.eventOnce) {
	      	client.once(event.eventName, (...args) => {
            event.executeEvents(client, ...args);
          });
	      } else {
		      client.on(event.eventName, (...args) => {
            event.executeEvents(client, ...args);
          });
	      };
        Events.addRow(file, '✔');
      } else {
        Events.addRow(file, '❌');
      };
    };
    console.log(Events.toString().yellow);
  };
  /*========================================================
  // Chạy các function
  ========================================================*/
  // commandHandler(`${process.cwd()}/Commands/PrefixCommands`);
  executeEvents({
     eventsPath: `${process.cwd()}/Events/Guilds`
  });
};
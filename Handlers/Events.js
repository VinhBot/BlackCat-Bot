const ascii = require("ascii-table");
const fs = require("node:fs");

module.exports = (client) => { 
  /*========================================================
  # Events
  ========================================================*/
  const executeEvents = async({ eventsPath, Events }) => {
    let _Events = new ascii("Events - Create");
    _Events.setHeading("File", "Events");
    const loadDir = (dir) => {
      const eventFiles = fs.readdirSync(`${eventsPath}/${dir}`).filter((file) => file.endsWith('.js'));
      for (const file of eventFiles) {
    	  const event = require(`${eventsPath}/${dir}/${file}`);
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
          _Events.addRow(file, '✔');
        } else {
          _Events.addRow(file, '❌');
        };
      };
    };
    await Events.forEach(e => loadDir(e));
    console.log(_Events.toString().yellow);
  };
  const commandHandler = (options) => {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên Lệnh", "Trạng thái");
    const commandsPath = options.setCommandPath //path_1.default.join(__dirname, options.setCommandPath);
    fs.readdirSync(commandsPath).forEach((dir) => {
      const commands = fs.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if(pull.name) {
          client.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, "❌");
          continue;
        };
        if(pull.aliases && Array.isArray(pull.aliases)) {
           pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  /*========================================================
  // Chạy các function
  ========================================================*/
  executeEvents({
     eventsPath: `${process.cwd()}/Events/`,
     Events: ["Guilds", "Custom"]
  });
  commandHandler({
    setCommandPath: `${process.cwd()}/Commands/PrefixCommands/`
  });
};
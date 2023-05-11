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
  /*========================================================
  // Chạy các function
  ========================================================*/
  executeEvents({
     eventsPath: `${process.cwd()}/Events/`,
     Events: ["Guilds", "Custom"]
  });
};
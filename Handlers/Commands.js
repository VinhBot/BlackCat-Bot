module.exports = async(client) => {
    try { 
        const { Routes, REST } = require("discord.js");
        const config = require(`${process.cwd()}/config.json`);
        const { readdirSync } = require("fs");
        const ascii = require("ascii-table");
        /*------------------
        # Events create 
        --------------------*/ 
        let Events = new ascii("Events");
        Events.setHeading("Tên file", "Trạng thái");
        const loadDir = (dir) => {
            const allevents = [];
            let amount = 0;
            const event_files = readdirSync(`./Events/Guild/${dir}`).filter((file) => file.endsWith(".js"));
            for (const file of event_files) {
                try {
                    const event = require(`../Events/Guild/${dir}/${file}`)
                    let eventName = file.split(".")[0];
                    allevents.push(eventName);
                    client.on(eventName, event.bind(null, client));
                    Events.addRow(file, '✔');
                    amount++;
                } catch(e) {
                    Events.addRow(file, '❌');
                    console.log(e);
                };
            }
        };
        await ["Guilds"].forEach(e => loadDir(e));
        /*------------------
        # PrefixCommands 
        --------------------*/ 
        let tableCmds = new ascii('BlackCat - commands');
        tableCmds.setHeading("Tên file", "Tình trạng");
        readdirSync("./Commands/PrefixCommands/").forEach(dir => {
            const commands = readdirSync(`./Commands/PrefixCommands/${dir}/`).filter(file => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../Commands/PrefixCommands/${dir}/${file}`);
                if (pull.name) {
                    client.commands.set(pull.name, pull);
                    tableCmds.addRow(file, '✔');
                } else {
                    tableCmds.addRow(file, '❌ => thiếu help name');
                    continue;
                };
                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
            };
        });
        /*-------------------
        # SlashCommands 
        --------------------*/ 
        const SlashCmds = new ascii("BlackCat - Slash")
        SlashCmds.setHeading('Slash Commands', 'Trạng thái').setBorder('|', '=', "0", "0")
        const data = [];
        readdirSync("./Commands/SlashCommands/").forEach((dir) => {
            const slashCommandFile = readdirSync(`./Commands/SlashCommands/${dir}/`).filter((files) => files.endsWith(".js"));
            for (const file of slashCommandFile) {
                const slashCommand = require(`../Commands/SlashCommands/${dir}/${file}`);
                client.slashCommands.set(slashCommand.name, slashCommand);
                if(slashCommand.name) {
				          	SlashCmds.addRow(file.split('.js')[0], '✅')
			        	} else {
					          SlashCmds.addRow(file.split('.js')[0], '⛔')
			        	};
                if (!slashCommand.name) return;
                if (!slashCommand.description) return; 
                data.push({
                    name: slashCommand.name,
                    description: slashCommand.description,
                    type: slashCommand.type,
                    options: slashCommand.options ? slashCommand.options : null,
                });
             };
         });
         const rest = new REST({ version: "10" }).setToken(process.env.token || config.token);
         client.on("ready", async() => {
             (async() => {
                 try {
                     await rest.put(Routes.applicationCommands(client.user.id), { body: data });
                     console.info(`[SlashCommands] Đã tải lại thành công lệnh (/).`.green);
                 } catch (error) {
                     console.info(error);
                 };
             })();
         });
         console.log(Events.toString().yellow);
         console.log(tableCmds.toString().magenta);
         console.log(SlashCmds.toString().red);
    } catch(err) {
        console.log(`${err}`);
    };
};
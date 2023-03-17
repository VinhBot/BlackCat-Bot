const { Language, switchLanguage } = require("../../Language/lang");

module.exports = (client) => {
  new Language({
    language: "vi"
  });
  console.log(switchLanguage("logger"));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));

const I18nProvider = class {
    constructor() {
        var _a;
        this.FilepathPrefix = 'file:';
        this.DefaultLocale = 'vi';
        const workingDirectory = (_a = global.__dirname) !== null && _a !== void 0 ? _a : __dirname;
        const localesPath = path_1.default.join(workingDirectory, '.', 'config');
        this.availableLocales = new Map(fs_1.default.readdirSync(localesPath).map(file => [path_1.default.basename(file, '.json'), path_1.default.resolve(localesPath, file)]));
    }
    loadFromLocale(locale) {
        let filepath = this.availableLocales.get(locale !== null && locale !== void 0 ? locale : this.DefaultLocal);
        let loaded = filepath !== undefined;
        if(!loaded && locale && locale.startsWith(this.FilepathPrefix)) {
            filepath = path_1.default.resolve(process.cwd(), locale.slice(this.FilepathPrefix.length));
        };
        try {
            if(filepath) {
                this.localeData = I18nProvider.flatten(JSON.parse(fs_1.default.readFileSync(filepath, 'utf-8')));
                loaded = true;
            };
        } catch(e) { };
        if (!loaded) {
            this.loadFromLocale(this.DefaultLocal);
            console.warn(`Không thể tải tập tin ngôn ngữ ${filepath !== null && filepath !== void 0 ? filepath : locale}. Sử dụng một mặc định.`);
        };
    }
    __switchLanguage(key, replacements) {
        if (this.localeData && this.localeData[key]) {
            let message = this.localeData[key];
            if (replacements) {
                Object.entries(replacements).forEach((replacement) => message = message.replace(`{${replacement[0]}}`, replacement[1].toString()));
            };
            return message;
        } else {
            console.warn(`xin lỗi ngôn ngữ ${key} của bạn không được hỗ trợ. Thay vào đó, hãy sử dụng ngôn ngữ khác.`);
            return key;   
        };
    }
    static flatten(object, objectPath = null, separator = '.') {
        return Object.keys(object).reduce((acc, key) => {
            const newObjectPath = [objectPath, key].filter(Boolean).join(separator);
            return typeof (object === null || object === void 0 ? void 0 : object[key]) === 'object' ? Object.assign(Object.assign({}, acc), I18nProvider.flatten(object[key], newObjectPath, separator)) : Object.assign(Object.assign({}, acc), { [newObjectPath]: object[key] });
        }, { });
    }
};
                                                      
const lc = new I18nProvider();
const switchLanguage = (id, replacements) => lc.__switchLanguage(id, replacements);

const Language = class {
  constructor(options) {
    lc.loadFromLocale(options.language);
  };
};

module.exports = {
  Language, 
  switchLanguage
};
const { GiveawaysManager } = require("discord-giveaways");
const { Database } = require("st.db");
const giveawayDB = new Database("./Assets/Database/giveawayDatabase.json", { 
  databaseInObject: true 
});

module.exports = (client) => {
  class DatabaseGiveaways extends GiveawaysManager {
    constructor(client) {
      super(client, {
        default: {
          botsCanWin: false,
          embedColor: "Yellow",
          embedColorEnd: "Red",
          reaction: "🎁",
        },
      }, false /*chưa khởi tạo trình quản lý*/);
    };
    // Hàm này được gọi khi người quản lý cần lấy tất cả giveaway được lưu trữ trong cơ sở dữ liệu.
    async getAllGiveaways() {
      // Lấy tất cả giveaway từ cơ sở dữ liệu
      return giveawayDB.all();
    };
    // Hàm này được gọi khi một giveaway cần được lưu trong cơ sở dữ liệu.
    async saveGiveaway(messageId, giveawayData) {
      // Thêm giveaway vào cơ sở dữ liệu
      giveawayDB.set(messageId, giveawayData);
      // Đừng quên trả lại thứ gì đó!
      return true;
    };
    // Hàm này được gọi khi cần chỉnh sửa giveaway trong cơ sở dữ liệu.
    async editGiveaway(messageId, giveawayData) {
      // Thay thế giveaway chưa chỉnh sửa bằng giveaway đã chỉnh sửa
      giveawayDB.set(messageId, giveawayData);
      // Đừng quên trả lại một cái gì đó!
      return true;
    };
    // Hàm này được gọi khi cần xóa giveaway trong cơ sở dữ liệu.
    async deleteGiveaway(messageId) {
      // Xóa giveaway khỏi cơ sở dữ liệu
      giveawayDB.delete(messageId);
      // Đừng quên trả lại một cái gì đó!
      return true;
    };
  };
  const giveawayHandler = new DatabaseGiveaways(client);
  giveawayHandler._init();
  client.giveawaysManager = giveawayHandler
};
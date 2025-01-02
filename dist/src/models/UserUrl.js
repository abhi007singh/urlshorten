"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userUrlSchema = new mongoose_1.Schema({
    userId: {
        ref: "User",
        required: true,
        type: mongoose_1.Schema.Types.ObjectId,
        unique: true,
    },
    userUrls: [
        {
            ref: "Url",
            type: mongoose_1.Schema.Types.ObjectId,
            unique: true,
        },
    ],
}, {
    timestamps: true,
});
const UserUrl = (0, mongoose_1.model)("UserUrl", userUrlSchema);
exports.default = UserUrl;
//# sourceMappingURL=UserUrl.js.map
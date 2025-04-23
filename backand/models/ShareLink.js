const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    itemId: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        required: true,
        enum: ['folder', 'task', 'subtask']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    accessType: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// אינדקס על שדה התפוגה
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ShareLink', shareLinkSchema); 
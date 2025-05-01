/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const mongoose = require('mongoose');
const moment = require('moment-timezone');

const chatSchema = new mongoose.Schema({
    staff_issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: false
    },
    guest_issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_guest_users',
        required: false
    },
    manager_issued_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_employees_staff_records',
        required: false
    },
    chat_message: {
        type: String,
        required: true
    },
    sender_type: {
        type: String,
        enum: ['staff', 'guest', 'manager'],
        required: true
    },
    chat_message_date: {
        type: Date,
        default: () => moment.tz('Asia/Manila').toDate()
    }
});

const AssistanceChat = mongoose.model('hms-chats', chatSchema);
module.exports = AssistanceChat;
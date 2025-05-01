/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const StaffAccount = require('../staff_accounts/model');
const GuestAccount = require('../guest_users/model');
const AssistanceChat = require('./model');
const mongoose = require('mongoose');

// Ensure proper database name usage in connection
const connectToDB = async () => {
    try {
        const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * GET = mag-retrieve ng mga existing datasets
 * POST = mag-submit ng new data
 * PUT (UPDATE) = sa existing na datasets need kasi nun may ID so clearly more on mag-update ka lang mismo ng existing na data
 * DELETE = ganun
 */

// GET 
const getAllChats = async (req, res) => {
    try {
        await connectToDB();

        const chats = await AssistanceChat.find()
            .populate({ path: 'staff_issued_by', model: StaffAccount, select: '-__v' })
            .populate({ path: 'guest_issued_by', model: GuestAccount, select: '-__v' })
            .sort({ chat_message_date: 1 }); // sort oldest to newest (optional)

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET all chats between a specific guest and the admin
const getChatsByGuest = async (req, res) => {
    const { guestId } = req.params;

    try {
        await connectToDB();

        const chats = await AssistanceChat.find({
            $or: [
                { guest_issued_by: guestId },
                { staff_issued_by: { $ne: null } } // Messages sent by staff
            ]
        })                     
            .populate({ path: 'staff_issued_by', model: StaffAccount, select: 'name email' })
            .populate({ path: 'guest_issued_by', model: GuestAccount, select: 'name email' })
            .sort({ chat_message_date: 1 }); // Sort by date (oldest to newest)

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chats.', error: error.message });
    }
};

// Controller to fetch messages by guest ID
const getMessagesByGuestId = async (req, res) => {
    const { guestId } = req.params;
    try {
        console.log("Fetching messages for guestId:", guestId);

        // Convert guestId to ObjectId
        const objectId = mongoose.Types.ObjectId(guestId);

        const messages = await AssistanceChat.find({ guest_issued_by: objectId }).sort({ chat_message_date: 1 });
        console.log("Messages found:", messages);

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: 'No messages found for this guest.' });
        }
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST
// Updated logic to default to guest if not staff or manager
const newChat = async (req, res) => {
    try {
        await connectToDB();

        const { _id, chat_message, sender_type } = req.body;

        if (!_id || !chat_message) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Missing required fields: _id and chat_message.'
            });
        }

        let isStaff = null;
        let isManager = null;

        if (sender_type === 'staff') {
            isStaff = await StaffAccount.findById(_id).lean();
            console.log('Staff check:', isStaff);
        } else if (sender_type === 'manager') {
            isManager = await StaffAccount.findById(_id).lean();
            console.log('Manager check:', isManager);
        }
        
        if (!isStaff && !isManager) {
            const isGuest = await GuestAccount.findById(_id).lean();
            console.log('Guest check:', isGuest);
            if (!isGuest) {
                return res.status(404).json({
                    statusCode: 404,
                    message: 'No matching StaffAccount, ManagerAccount, or GuestAccount found for provided _id.'
                });
            }
        
            const newChatData = new AssistanceChat({
                chat_message,
                sender_type: 'guest',
                guest_issued_by: _id
            });

            await newChatData.save();

            return res.status(201).json({
                statusCode: 201,
                message: 'Chat message created successfully.',
                chat: newChatData
            });
        }

        const newChatData = new AssistanceChat({
            chat_message,
            sender_type,
            staff_issued_by: isStaff ? _id : undefined,
            manager_issued_by: isManager ? _id : undefined
        });

        await newChatData.save();

        res.status(201).json({
            statusCode: 201,
            message: 'Chat message created successfully.',
            chat: newChatData
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

// POST a new chat message
const sendMessage = async (req, res) => {
    const { chat_message, sender_type } = req.body;
    const { guestId } = req.params;

    try {
        await connectToDB();

        if (!guestId || !chat_message || !sender_type) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Missing required fields: guestId, chat_message, and sender_type.'
            });
        }

        if (!['staff', 'guest'].includes(sender_type)) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Invalid sender_type. Must be "staff" or "guest".'
            });
        }

        const isGuest = sender_type === 'guest' ? await GuestAccount.findById(guestId).lean() : null;

        if (!isGuest) {
            return res.status(404).json({
                statusCode: 404,
                message: 'No matching GuestAccount found for provided guestId.'
            });
        }

        const newChatData = new AssistanceChat({
            chat_message,
            sender_type,
            guest_issued_by: guestId
        });

        await newChatData.save();

        res.status(201).json({
            statusCode: 201,
            message: 'Chat message created successfully.',
            chat: newChatData
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

// GET all unique guests who have messaged the admin
const getAllGuests = async (req, res) => {
    try {
        await connectToDB();

        const guests = await AssistanceChat.find({ guest_issued_by: { $ne: null } })
            .populate('guest_issued_by', 'name email') // Populate guest details
            .distinct('guest_issued_by'); // Get unique guest IDs

        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve guests.', error: error.message });
    }
};

module.exports = { getAllChats, newChat, getChatsByGuest, sendMessage, getAllGuests, getMessagesByGuestId };
/*
*   This feature is for Chat Assistance Group (between Guest,Staffs and Managers).
*/

const express = require('express');
const { getAllChats, newChat } = require('./controller');
const chatController = require('./controller');

const router = express.Router();

router.get('/', getAllChats); // for GET
router.post('/', newChat); // for POST

// New route to fetch chats by client ID
router.get('/client/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const chats = await AssistanceChat.find({
            $or: [
                { guest_issued_by: id },
                { staff_issued_by: id }
            ]
        }).sort({ chat_message_date: 1 });

        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: 'No chats found for this client.' });
        }

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

// Route to get all chats between a specific guest and the admin
router.get('/messages/:guestId', chatController.getChatsByGuest);

// Route to send a new chat message
router.post('/messages', chatController.sendMessage);

// Route to get all unique guests who have messaged the admin
router.get('/guests', chatController.getAllGuests);

// Define the route to fetch messages by guest ID
// Debugging logs
console.log('Registering route: GET /hotel-chats/:guestId');
router.get('/hotel-chats/:guestId', chatController.getMessagesByGuestId);

// Route to send a new chat message for a specific guest
// Debugging logs
console.log('Registering route: POST /hotel-chats/:guestId');
router.post('/hotel-chats/:guestId', chatController.sendMessage);

module.exports = router;
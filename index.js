import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

const app = express();

app.use(cors());
app.use(express.json());

let users = [];
const messages = [];
app.post('/participants', (req, res) => {
    const user = req.body;
    if(user.name === '') {
        res.sendStatus(400);
    } else {
        users.push({
            ...user,
            lastStatus: Date.now(),
        });
        messages.push({
            from: user.name, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format('HH:mm:ss'), 
        })
        res.sendStatus(200);
    }
});
app.get('/participants', (req, res) => {
    res.send(users);
})
app.post('/messages', (req, res) => {
    const username = req.headers.user;
    const message = req.body
    if(
        message.to === '' || 
        message.text === '' || 
        (message.type !== 'message' && message.type !== 'private_message') || 
        !users.find(user => user.name === username)
        ) {
            res.sendStatus(400)
        } else {
            messages.push({
                ...message,
                from: username,
                time: dayjs().format('HH:mm:ss'),
            });
            res.sendStatus(200);
        }
    });
app.get('/messages', (req, res) => {
    const limit = Number(req.query.limit);
    const accessibleMessages = messages.filter(message => !(message.type === 'private_message' && message.to !== req.headers.user && message.from !== req.headers.user));
    if(accessibleMessages.length <= limit || limit === undefined) {
        res.send(accessibleMessages);
    } else {
        const messagesWithLimit = [];
        for(let i = 0; i < accessibleMessages.length; i++) {
            if(i >= accessibleMessages.length - 1 - limit) {
                messagesWithLimit.push(accessibleMessages[i]);
            }
        }
        res.send(messagesWithLimit);
    }
});

app.post('/status', (req, res) => {
    const username = req.headers.user;
    if(!!users.find(user => user.name === username)) {
        users.map(user => {
            if(user.name === username) {
                user.lastStatus = Date.now();
            }
        })
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
})

setInterval(() => {
    users = users.filter(user => Date.now() - user.lastStatus <= 10000);
}, 15000)

app.listen(4000);
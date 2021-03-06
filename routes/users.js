const express = require('express');
const { ensureCorrectUser } = require('../middleware/auth');
const router = new express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const Message = require('../models/message');

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async(req, res, next) => {
    const results = await User.all();
    return res.json({results});
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async(req, res, next) => {
    const result = await User.get(req.params.username);
    return res.json({result});
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async(req, res, next)=> {
    const results = await User.messagesTo(req.params.username);
    let m = results.rows;
    return res.json({results});
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get('/:username/from', async(req, res, next)=> {
    const results = await User.messagesFrom(req.params.username);
    let m = results.rows;
    return res.json({results});
})

module.exports = router;
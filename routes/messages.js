const express = require('express');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');
const router = new express.Router();
const ExpressError = require('../expressError');
const Message = require('../models/message');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async(req, res, next) => {
    try{
    const results = await Message.get(req.params.id);
    if(results.length === 0){
        throw new ExpressError('Message not found', 404);
    }
    return res.json(results);

    }catch(e){
        return next(e);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async(req, res, next) => {
    try{
    const result = await Message.create({
        from_username: req.user.username, 
        to_username: req.body.to_username, 
        body: req.body.body
    });
    return res.json({message: result});
    }catch(e){
        return next(e);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', async(req, res, next) => {
    try{
        const username = req.user.username;
        let msg = await Message.get(req.params.id);

        // console.log(msg)

        if (msg.to_user.username !== username) {
            throw new ExpressError("Cannot set this message to read", 401);
        }
        const result = await Message.markRead(req.params.id);
        // console.log(result)
        return res.json({result});
    }catch(e){
        return next(e);
    }
})

module.exports = router;
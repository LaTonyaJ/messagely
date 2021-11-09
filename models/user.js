/** User class for message.ly */

const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require('bcrypt');
const db = require('../db');
const ExpressError = require("../expressError");

/** User of the site. */

class User {
  constructor(username, password, first_name, last_name, phone){
    this.username = username,
    this.password = password,
    this.first_name = first_name,
    this.last_name = last_name,
    this.phone = phone
  }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  
  static async register({username, password, first_name, last_name, phone}) { 
    const hashed_password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    // console.log(hashed_password)
    
    try{
    const results = await db.query(
      `INSERT INTO users (
        username, 
        password, 
        first_name, 
        last_name, 
        phone, 
        join_at,
        last_login_at) 
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashed_password, first_name, last_name, phone]);

      // console.log(results.rows[0])
      return(results.rows[0]);
    }catch(e){
      throw new ExpressError('User not added', 404);
    }
}

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try{
    const user_result = await db.query(`SELECT password FROM users WHERE username = $1`,
    [username]);
    const user = user_result.rows[0];
    if(user.length === 0){
      throw new ExpressError('User not Found', 404);
    }
    const result = await bcrypt.compare(password, user.password);
    // console.log(result)
    return(result);
    }catch(e){
      console.log(e);
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try{ 
    const result = await db.query(
    `UPDATE users 
      SET last_login_at = current_timestamp
      WHERE username = $1 
      RETURNING username`, [username]);
    
    if(result.rows.length === 0){
      throw new ExpressError('User not Found', 404);
    }
    }catch(e){
      throw new ExpressError('Could not update time', 404);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    try{
    const results = await db.query(
      `SELECT 
      username, 
      first_name, 
      last_name, 
      phone, 
      join_at, 
      last_login_at
      FROM users`);
    if(results.rows.length === 0){
      throw new ExpressError('No users found', 404);
    }
    return([results.rows]);
    }catch(e){
      console.log(e)
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    try{
    const result = await db.query(
      `SELECT 
      username, 
      first_name, 
      last_name, 
      phone, 
      join_at, 
      last_login_at 
      FROM users
      WHERE username = $1`, 
      [username]);
      
      if(result.rows.length === 0){
        throw new ExpressError('User not Found', 404);
      }

      return(result.rows[0]);
    }catch(e){
      console.log(e)
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    try{
    const results = await db.query(
      `SELECT m.id, 
      m.to_username, 
      m.body, 
      m.sent_at, 
      m.read_at
      FROM messages AS m 
      JOIN users AS u ON u.username = m.from_username
      WHERE u.username = $1`, 
      [username]);

      if(results.rows.length === 0){
        throw new ExpressError('User not Found', 404);
      }

    return results.rows;
    }catch(e){
      console.log(e);
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    try{
    const results = await db.query(
      `SELECT m.id, 
      m.from_username, 
      m.body, 
      m.sent_at, 
      m.read_at
      FROM messages AS m 
      JOIN users AS u ON u.username = m.to_username
      WHERE u.username = $1`, 
      [username]);

      if(results.rows.length === 0){
        throw new ExpressError('User not Found', 404);
      }

    return results.rows;
    }catch(e){
      console.log(e);
    }
  }
}


module.exports = User;
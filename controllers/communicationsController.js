const Communication = require('../models/Communication');
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY = (process.env.JWT_SECRET || 'dev_secret_key').slice(0,32); // dev only

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return { iv, tag, encrypted };
}

function decrypt(record) {
  const iv = record.iv;
  const tag = record.tag;
  const encrypted = record.content;
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  let dec = decipher.update(encrypted);
  dec = Buffer.concat([dec, decipher.final()]);
  return dec.toString('utf8');
}

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;
    const { iv, tag, encrypted } = encrypt(content);
    
    const rec = await Communication.create({
      sender: req.user.username || req.user.sub,
      receiver,
      content: encrypted,
      iv,
      encryptedFlag: true
    });
    
    res.status(201).json({ id: rec.id });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const rows = await Communication.findAll({
      where: { receiver: req.user.username || req.user.sub }
    });
    
    const msgs = rows.map(r => {
      
      return {
        id: r.id,
        sender: r.sender,
        receiver: r.receiver,
        
        encryptedFlag: r.encryptedFlag,
        createdAt: r.createdAt
      };
    });
    res.json(msgs);
  } catch (err) { next(err); }
};

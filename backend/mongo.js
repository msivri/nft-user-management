var mongo = require('mongodb');
var eth = require('@metamask/eth-sig-util');
var jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
process.env.TOKEN_KEY='this is secret';
mongoose.connect('mongodb+srv://cihanerdogan:GDDb8fUbDlBTi445@cluster0.eapsl.mongodb.net/MetaMaskAuthDb?retryWrites=true&w=majority');
var Schema = mongoose.Schema;
var userDataSchema = new Schema({
    _id: String,
    nonce: String
})
var UserData = mongoose.model('UserData', userDataSchema);
module.exports = {
    getUsers: async function getUsers() {
        let users = await UserData.find();
        return users;
    },

    upsertUser: async function upsertUser(address) {
        let res = "0";
        await UserData.findById(address).exec().then((doc) => {
            if (!doc) {
                doc = new UserData();
                doc._id = address;
                doc.nonce = Math.floor(Math.random() * 1000000).toString();
                doc.save();
            }
            res = doc.nonce;
        })
        return res;
    },

    verifyUser: async function (address, sig) {

        await UserData.findById(address).exec().then((doc) => {
            if (doc.nonce) {
                let existingNonce = doc.nonce;
                const recoveredAddress = eth.recoverPersonalSignature({
                    data: `0x${toHex(existingNonce)}`,
                    signature: sig,
                });
                if (recoveredAddress === address) {
                    // The signature was verified - update the nonce to prevent replay attacks
                    // update nonce
                    doc.nonce = Math.floor(Math.random() * 1000000).toString();
                    doc.save();
                    const token = jwt.sign(
                        {user_id:address},
                        process.env.TOKEN_KEY,
                        {
                            expiresIn:"2h"
                        }
                    );
                    res=token;
                } else {
                    // The signature could not be verified
                    res = 'sig invalid';
                }
            } else {
                res = 'no data';
            }
        })
        return res;
    }

};

const toHex = (stringToConvert) =>
    stringToConvert
        .split('')
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');


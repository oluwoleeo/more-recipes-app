import dbs from '../models';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypt from 'bcrypt';

const User=dbs.User;
dotenv.config();

export default {
    createUser:(req, res)=>{
        let username = req.body.username.toLowerCase().trim();
        let email = req.body.email.toLowerCase().trim();
        let password = req.body.password;

        User.findOne({
            where: 
                {
                    $or:[
                        {username: {$eq: username}},
                        {email: {$eq: email}}
                    ]
            }})
        .then((user) => {
                if (user)
                {
                    if (user.username===username)
                        return res.status(400).json({error: 'Username already exists'});
                    else if (user.email===email)
                        return res.status(400).json({error: 'Email already exists'});
                }
                else
                {
                    return User.create({
                        username,
                        email,
                        password
                      })
                      .then((user)=>{
                        let token = jwt.sign({id: user.id},process.env.TOKEN_SECRET,{ expiresIn: "5min"}); 

                        let data = {message:"Signup successful",id:user.id,username:user.username,email:user.email}
                       
                        return res.status(201).json(data); 
                      })
                      .catch(error =>res.status(400).json({message:'Error'}));
                } 
              })
        .catch(error => { return res.status(500).send(error) });
    },

    confirmUser:(req, res)=>{
        let username = req.body.username.toLowerCase().trim();

        User.findOne({
            where: 
                {
                    username
                }})
            .then(user => {
                    if (user)
                        {
                            crypt.compare(req.body.password,user.password)
                            .then(match=>{
                                if (match)
                                {
                                    let data={message:`Welcome, ${user.username}`};
                                    let token = jwt.sign({id: user.id},process.env.TOKEN_SECRET,{ expiresIn: "1h"});
                                    
                                    return res.status(201).json(data);
                                }
                                else
                                {
                                    return res.status(400).json({ message: "Incorrect password!" });
                                }
                            })
                            .catch(err=>res.status(500).json({message:"Server issue"}))
                        }
                    else
                        {
                            return res.status(400).json({ message: "Username does not exist!" });
                        }})
            .catch(error => { return res.status(500).send(error) });
    }
}
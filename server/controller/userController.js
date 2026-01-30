import User from '../models/User.js'
import imagekit from '../config/imageKit.js'
import fs from 'fs'
import Connection from '../models/Connection.js'
import Post from '../models/Post.js'
import { inngest } from '../inngest/index.js'
//Get user data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//Update user data
export const updateUserData = async (req, res) => {
    try {
        // console.log(req.files)
        const { userId } = req.auth()
        let { username, bio, location, full_name } = req.body;
        let tempUser = await User.findById(userId)

        !username && (username = tempUser.username)
        if (tempUser.username !== username) {
            const user = await User.findOne({ username })
            if (user) {
                //we will not change the username if it is already taken
                username = tempUser.username
            }
        }
        const updatedData = {
            username,
            bio,
            location,
            full_name
        }
        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]
        // console.log("42", profile, cover)

        if (profile) {
            const response = await imagekit.files.upload({
                file: fs.createReadStream(profile.path),
                fileName: profile.originalname,
            });
            // console.log(response)

            updatedData.profile_picture = response.url;
            // DELETE LOCAL FILE
            fs.unlink(profile.path, (err) => {
                if (err) console.log("File delete error:", err);
            });
        }

        if (cover) {
            const response = await imagekit.files.upload({
                file: fs.createReadStream(cover.path),
                fileName: cover.originalname,
            });
            // console.log(response)
            updatedData.cover_photo = response.url;
            // delete local file
            fs.unlink(cover.path, (err) => {
                if (err) console.log("File delete error:", err);
            });
        }


        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true })
        res.json({ success: true, user, message: "Profile updated successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}




//Find USer usig username, email, location, name
export const discoverUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    { username: new RegExp(input, 'i') },
                    { email: new RegExp(input, i) },
                    { full_name: new RegExp(input, i) },
                    { location: new RegExp(input, i) },
                ]
            }
        )
        const filterUsers = allUsers.filter(user => user._id !== userId)
        res.json({ success: true, users: filterUsers })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//Follow USer
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId)
        if (user.following.includes(id)) {
            return res.json({ success: false, message: "You are already following this user" })
        }

        user.following.push(id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({ success: true, message: 'now you are following this user' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//Unfollow USer
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId)
        user.following = user.following.filter(user => user !== id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers = toUser.followers.filter(user => user !== userId)
        await toUser.save()
        res.json({ success: true, message: 'you are no longer following this user' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        //check if user has sent more than 20 connection requests in the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 *1000)

        const connectionRequests = await Connection.find({from_user_id: userId, created_at:{$gt: last24Hours}})

        if(connectionRequests.length >= 20){
            return res.json({success: false, message:"You have send more than 20 connection request in the last 24 hours"})
        }

        //check if user are already connected
        const connection = await Connection.findOne({
            $or:[
                {from_user_id: userId, to_user_id: id},
                {from_user_id: id, to_user_id: userId},
            ]
        })

        if(!connection){
           const newConnection =  await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })

            await inngest.send({
                name: 'app/connection-request',
                data:{connectionId : newConnection._id}
            })

            return res.json({success: true, message:"Connection request send successfully"})

        }else if(connection && connection.status === 'accepted'){
            return res.json({success:false, message:"You are already connected with this user"})
        }
        return res.json({success: false, message:'Connection request pending'})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//Get User Connection
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate('connections, followers, following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnection = (await Connection.find({to_user_id: userId, status: 'pending'}).populate('from_user_id')).map(connection => connection.from_user_id)

        res.json({success: true, connections, followers, following, pendingConnection})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {id} = req.body;

        const connection = await Connection.findOne({from_user_id:id, to_user_id: userId})

        if(!connection){
            return res.json({success:false, message:"Connection not found"})
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save()

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save()

        connection.status = 'accepted';
        await connection.save()

        res.json({success: true, message: 'Connection accepted successfully'})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Get User Profiles
export const getUserProfile = async (req, res) => {
    try {
        const {profileId} = req.body;
        const profile = await User.findById(profileId)
        if(!profile){
            return res.json({success:false, message:"User not found"})
        }
        const posts = await Post.find({user: profileId}).populate('user')

        res.json({success: true, profile, posts})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
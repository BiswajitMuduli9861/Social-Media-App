import fs from 'fs';
import imagekit from '../config/imageKit.js';
import Story from '../models/Story.js'
import User from '../models/User.js'
import { inngest } from '../inngest/index.js';

// Add User Story
export const addUserStory = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const {content, media_type, background_color} = req.body;
        const media = req.file
        let media_url = ''

        //upload media to imagekit
        if(media_type === 'image' || media_type == 'video'){
            const response = await imagekit.files.upload({
                file: fs.createReadStream(media.path),
                fileName: media.originalname,
            });
            // console.log(response)
            media_url = response.url;
            // delete local file
            fs.unlink(media.path, (err) => {
                if (err) console.log("File delete error:", err);
            });
        }
        //create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })

        //schedule story deletion after 24 hours using inngest
        await inngest.send({
            name: 'app/story.delete',
            data:{storyId: story._id}
        })

        res.json({ success: true, message: "Story added successfully", story })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//get User Stories
export const getStories = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const user = await User.findById(userId)

        //Use connection and followings
        const userIds = [userId, ...user.connections, ...user.following]

        const stories = await Story.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1})

        res.json({ success: true, stories })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
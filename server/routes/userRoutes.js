import express from 'express'
import { acceptConnectionRequest, discoverUser, followUser, getUserConnections, getUserData, getUserProfile, sendConnectionRequest, unfollowUser, updateUserData } from "../controller/userController.js"
import {protect} from '../middleware/auth.js'
import upload from '../config/multer.js'
import { getUserRecentMessages } from '../controller/messageController.js';
const userRouter = express.Router();

userRouter.get('/data', protect, getUserData )
userRouter.put('/update', upload.fields([{name:'profile', maxCount: 1},{name:'cover', maxCount: 1}]),protect, updateUserData)
userRouter.post('/discover', protect, discoverUser)
userRouter.post('/follow', protect, followUser)
userRouter.post('/unfollow', protect, unfollowUser)
userRouter.post('/connect', protect, sendConnectionRequest)
userRouter.post('/accept', protect, acceptConnectionRequest)
userRouter.post('/connections', protect, getUserConnections)

userRouter.post('/profiles',getUserProfile)
userRouter.get('/recent-messages', protect, getUserRecentMessages)

export default userRouter
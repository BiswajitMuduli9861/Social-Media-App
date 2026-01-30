import express from 'express'
import {protect} from '../middleware/auth.js'
import upload from '../config/multer.js'
import { addUserStory, getStories } from '../controller/storyController.js';

const storyRouter  = express.Router();

storyRouter.post('/create', protect, upload.single('media'), addUserStory )
storyRouter.get('/get', protect, getStories )

export default storyRouter
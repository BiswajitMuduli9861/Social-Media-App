import express from 'express'
import {protect} from '../middleware/auth.js'
import upload from '../config/multer.js'
import { addUserStory, getStories } from '../controller/storyController.js';

const storyRouter  = express.Router();

storyRouter.post('/create', upload.single('media'),protect, addUserStory )
storyRouter.get('/get', protect, getStories )

export default storyRouter
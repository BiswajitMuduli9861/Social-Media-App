import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import connectionReducer from '../features/connections/connectionSlice'
import messageReducer from '../features/messages/messagesSlice'

export const store = configureStore({
    reducer:{
        user: userReducer,
        connections: connectionReducer,
        messages: messageReducer,
    }
})
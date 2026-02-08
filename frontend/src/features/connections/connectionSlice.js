import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import api from "../../api/axios";

const initialState ={
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections',async(token)=>{
    try {
        const {data} = await api.get('/api/user/connections',{headers: {Authorization: `Bearer ${token}`}
        })
        return data.success ? data : null;
    } catch (error) {
        console.log(error.message)
        toast.error(error.message)
    }
})

const connectionsSlice = createSlice({
    name:'connections',
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder.addCase(fetchConnections.fulfilled,(state,action)=>{
            if(action.payload){
                state.connections = action.payload.connections;
                state.pendingConnections = action.payload.pendingConnections;
                state.followers = action.payload.followers;
                state.following = action.payload.following;

            }
        })
    }
})

export default connectionsSlice.reducer;
import { useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Feed from './pages/Feed'
import Message from './pages/Message'
import ChatBox from './pages/ChatBox'
import Connection from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Login from './pages/Login'
import Layout from './pages/Layout'
import { useAuth, useUser } from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionSlice.js'
import { addMessage } from './features/messages/messagesSlice.js'
function App() {

  const {user} = useUser()
  const {getToken} = useAuth()
  const {pathname} = useLocation()
  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch()

  useEffect(()=>{
    const fetchData = async()=>{
      if(user){
        const token =await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }

    }
    fetchData()
  },[user, getToken, dispatch])

  useEffect(()=>{
    pathnameRef.current = pathnameRef
  },[pathname])

  useEffect(()=>{
    if(user){
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id)
    }

    eventSource.onmessage = (event)=>{
      const message = JSON.parse(event.data)

      if(pathnameRef.current === ('/messages/' + message.from_user_id._id)){
        dispatch(addMessage(message))
      }else{

      }
      return ()=>{
        eventSource.close()
      }
    }
  },[user, dispatch])
  return (
    <>
    <Toaster/>
      <Routes>

        <Route path='/' element={!user ? <Login/> : <Layout/>}>
        <Route index element={<Feed/>}/>
        <Route path='messages' element={<Message/>}/>
        <Route path='messages/:userId' element={<ChatBox/>}/>
        <Route path='connections' element={<Connection/>}/>
        <Route path='discover' element={<Discover/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='profile/:profileId' element={<Profile/>}/>
        <Route path='create-post' element={<CreatePost/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
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
function App() {

  const {user} = useUser()
  const {getToken} = useAuth()

  useEffect(()=>{
    if(user){
      getToken().then((token)=>console.log(token))
    }
  },[user])
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

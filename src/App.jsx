import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Auth from './Auth'
import Dashboard from './Dashboard'
import CreateSite from './CreateSite'  // <--- Новый
import StoreEditor from './StoreEditor' // <--- Новый (переименовали из Editor)
import Viewer from './Viewer'

function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
        return () => subscription.unsubscribe()
    }, [])

    if (loading) return <div>Загрузка...</div>

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={!session ? <Auth /> : <Dashboard session={session} />} />
                <Route path="/create" element={session ? <CreateSite session={session} /> : <Auth />} />
                <Route path="/editor/:id" element={session ? <StoreEditor /> : <Auth />} />
                <Route path="/view/:id" element={<Viewer />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

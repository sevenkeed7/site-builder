import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Lock, CheckCircle } from 'lucide-react'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState(null) // Для уведомлений

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        let error, data;

        if (isSignUp) {
            const res = await supabase.auth.signUp({ email, password })
            error = res.error
            data = res.data

            // Если регистрации успешна и сессии нет (значит включено подтверждение почты)
            if (!error && data.user && !data.session) {
                setMessage({ type: 'success', text: 'Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.' })
            }
        } else {
            const res = await supabase.auth.signInWithPassword({ email, password })
            error = res.error
        }

        if (error) setMessage({ type: 'error', text: error.message })
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    {isSignUp ? 'Создать аккаунт' : 'Вход в систему'}
                </h1>

                {/* Уведомление */}
                {message && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.type === 'success' && <CheckCircle size={20} className="mt-0.5 shrink-0"/>}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                {/* Если успешная регистрация с подтверждением, скрываем форму */}
                {message?.type === 'success' && isSignUp ? null : (
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20}/>
                            <input
                                type="email" placeholder="Email" required
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20}/>
                            <input
                                type="password" placeholder="Пароль" required
                                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
                        >
                            {loading ? 'Загрузка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-sm text-center text-gray-600">
                    {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(null) }}
                        className="ml-1 text-blue-600 hover:underline font-medium"
                    >
                        {isSignUp ? 'Войти' : 'Создать'}
                    </button>
                </p>
            </div>
        </div>
    )
}

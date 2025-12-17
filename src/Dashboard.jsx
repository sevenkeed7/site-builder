import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Plus, Globe, LogOut } from 'lucide-react'
// Мы пока не сделали роутинг, но представим, что будем переходить на /editor/ID
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ session }) {
    const [sites, setSites] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getSites()
    }, [])

    const getSites = async () => {
        const { data, error } = await supabase
            .from('sites')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Ошибка загрузки:', error)
        else setSites(data)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Шапка */}
            <nav className="bg-white shadow">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center text-xl font-bold text-blue-600">
                            MyBuilder
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-sm text-gray-500">{session.user.email}</span>
                            <button
                                onClick={() => supabase.auth.signOut()}
                                className="p-2 text-gray-500 rounded hover:text-red-600"
                            >
                                <LogOut size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Контент */}
            <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Мои проекты</h1>
                    <button
                        onClick={() => navigate('/create')}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="mr-2" size={20} />
                        Создать сайт
                    </button>
                </div>

                {/* Сетка сайтов */}
                {sites.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow">
                        У вас пока нет сайтов. Создайте первый!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sites.map((site) => (
                            <div key={site.id} className="overflow-hidden transition bg-white rounded-lg shadow hover:shadow-lg">
                                <div className="h-32 bg-gray-200 flex items-center justify-center">
                                    <Globe className="text-gray-400" size={48} />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900">{site.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(site.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="flex mt-4 space-x-2">
                                        <button
                                            className="flex-1 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                            onClick={() => navigate(`/editor/${site.id}`)}
                                        >
                                            Редактировать
                                        </button>
                                        {/* Тут можно добавить кнопку удаления */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

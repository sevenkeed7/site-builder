import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Plus, Globe, LogOut, Trash2, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ session }) {
    const [sites, setSites] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        getSites()
    }, [])

    const getSites = async () => {
        const { data, error } = await supabase
            .from('sites')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Ошибка:', error)
        else setSites(data)
        setLoading(false)
    }

    const handleDelete = async (e, siteId, siteName) => {
        e.stopPropagation() // Чтобы не сработал клик по карточке (переход в редактор)

        const confirmDelete = window.confirm(`Вы уверены, что хотите удалить сайт "${siteName}"? Это действие нельзя отменить.`)

        if (confirmDelete) {
            const { error } = await supabase.from('sites').delete().eq('id', siteId)
            if (error) {
                alert('Ошибка удаления: ' + error.message)
            } else {
                // Удаляем из локального стейта, чтобы не перезагружать страницу
                setSites(sites.filter(site => site.id !== siteId))
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow sticky top-0 z-10">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center text-xl font-bold text-blue-600">
                            MyBuilder <span className="text-gray-400 text-xs ml-2 font-normal">v1.0</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 hidden sm:inline">{session.user.email}</span>
                            <button
                                onClick={() => supabase.auth.signOut()}
                                className="p-2 text-gray-500 rounded hover:text-red-600 hover:bg-red-50 transition"
                                title="Выйти"
                            >
                                <LogOut size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Мои проекты</h1>
                        <p className="text-gray-500 mt-1">Управляйте своими магазинами</p>
                    </div>
                    <button
                        onClick={() => navigate('/create')}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="mr-2" size={20} />
                        Новый сайт
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20">Загрузка проектов...</div>
                ) : sites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Globe className="text-gray-300 mb-4" size={64}/>
                        <p className="text-lg text-gray-500 mb-4">У вас пока нет сайтов</p>
                        <button onClick={() => navigate('/create')} className="text-blue-600 font-medium hover:underline">Создать первый проект</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sites.map((site) => (
                            <div
                                key={site.id}
                                onClick={() => navigate(`/editor/${site.id}`)}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full"
                            >
                                {/* Превью (заглушка или цвет) */}
                                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                    <Globe className="text-gray-400 opacity-50 group-hover:scale-110 transition duration-500" size={48} />

                                    {/* Кнопки действий (появляются при наведении) */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                        <button
                                            onClick={(e) => handleDelete(e, site.id, site.name)}
                                            className="bg-white text-red-500 p-2 rounded-lg shadow hover:bg-red-50 transition"
                                            title="Удалить сайт"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{site.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                        {site.description || 'Нет описания'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                     <span className="text-xs text-gray-400 font-mono">
                         {new Date(site.created_at).toLocaleDateString()}
                     </span>
                                        <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                         <Edit size={14}/> Редактировать
                     </span>
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

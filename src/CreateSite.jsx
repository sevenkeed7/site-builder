import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Instagram, Send, Phone } from 'lucide-react'

// ... (Оставь константу TEMPLATES без изменений) ...
const TEMPLATES = [
    {
        id: 'minimal',
        name: 'Минимализм (Светлый)',
        image: 'https://placehold.co/600x400/FFF/000?text=Minimal',
        description: 'Чистый дизайн, идеально для одежды и обуви.'
    },
    {
        id: 'dark',
        name: 'Luxury (Темный)',
        image: 'https://placehold.co/600x400/222/D4AF37?text=Luxury',
        description: 'Премиальный стиль для техники и ювелирки.'
    }
]

export default function CreateSite({ session }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // Новая структура стейта
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [currency, setCurrency] = useState('₽')
    const [template, setTemplate] = useState('minimal')

    // Соцсети отдельно
    const [contacts, setContacts] = useState({
        phone: '',
        telegram: '',
        instagram: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Превращаем объект контактов в строку JSON, чтобы сохранить в текстовое поле БД
        const contactsJson = JSON.stringify(contacts)

        const { data, error } = await supabase
            .from('sites')
            .insert([
                {
                    user_id: session.user.id,
                    name: name,
                    description: desc,
                    currency: currency,
                    contacts: contactsJson, // Сохраняем как JSON строку
                    template_id: template,
                    content: []
                }
            ])
            .select()

        if (error) alert(error.message)
        else navigate(`/editor/${data[0].id}`)

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6">
                    <h1 className="text-2xl font-bold text-white">Создание магазина</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Выбор шаблона */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Выберите шаблон</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {TEMPLATES.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`cursor-pointer border-2 rounded-lg p-2 transition ${
                                        template === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <img src={t.image} alt={t.name} className="rounded mb-2 w-full h-32 object-cover"/>
                                    <div className="font-bold">{t.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Основные настройки */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Название</label>
                            <input required className="mt-1 w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Валюта</label>
                            <select className="mt-1 w-full border rounded p-2" value={currency} onChange={e => setCurrency(e.target.value)}>
                                <option value="₽">Рубли (₽)</option>
                                <option value="$">Доллары ($)</option>
                                <option value="€">Евро (€)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Слоган</label>
                        <input className="mt-1 w-full border rounded p-2" value={desc} onChange={e => setDesc(e.target.value)}/>
                    </div>

                    {/* Блок контактов */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
                        <h3 className="font-medium text-gray-900">Контакты</h3>

                        <div className="flex items-center gap-2">
                            <Phone size={20} className="text-gray-500" />
                            <input
                                placeholder="Телефон (+7...)"
                                className="flex-1 border rounded p-2"
                                value={contacts.phone}
                                onChange={e => setContacts({...contacts, phone: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Send size={20} className="text-blue-500" />
                            <input
                                placeholder="Ник в Telegram (без @)"
                                className="flex-1 border rounded p-2"
                                value={contacts.telegram}
                                onChange={e => setContacts({...contacts, telegram: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Instagram size={20} className="text-pink-600" />
                            <input
                                placeholder="Ссылка на Instagram"
                                className="flex-1 border rounded p-2"
                                value={contacts.instagram}
                                onChange={e => setContacts({...contacts, instagram: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate('/')} className="text-gray-500 hover:text-black">Отмена</button>
                        <button disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                            {loading ? 'Создаем...' : 'Создать магазин'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

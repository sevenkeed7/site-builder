import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
// ДОБАВИЛ Send В СПИСОК ИМПОРТОВ НИЖЕ:
import { ArrowLeft, Plus, Trash2, ExternalLink, Edit2, Share2, Copy, Check, X, Send } from 'lucide-react'

export default function StoreEditor() {
    const { id } = useParams()
    const [site, setSite] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Состояние формы товара
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ name: '', price: '', image: '', desc: '' })

    // Состояние окна "Поделиться"
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadSite()
    }, [])

    const loadSite = async () => {
        const { data } = await supabase.from('sites').select('*').eq('id', id).single()
        if (data) {
            setSite(data)
            setProducts(data.content || [])
        }
        setLoading(false)
    }

    const saveToDb = async (newProducts) => {
        setProducts(newProducts)
        await supabase.from('sites').update({ content: newProducts }).eq('id', id)
    }

    const handleSaveProduct = () => {
        if (!formData.name || !formData.price) return alert('Заполните поля!')
        let updatedProducts;
        if (editingId) {
            updatedProducts = products.map(p => p.id === editingId ? { ...p, ...formData } : p)
        } else {
            const newProduct = { id: Date.now(), ...formData }
            updatedProducts = [newProduct, ...products]
        }
        saveToDb(updatedProducts)
        closeForm()
    }

    const startEdit = (product) => {
        setFormData({ name: product.name, price: product.price, image: product.image, desc: product.desc })
        setEditingId(product.id)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const closeForm = () => {
        setFormData({ name: '', price: '', image: '', desc: '' })
        setEditingId(null)
        setIsFormOpen(false)
    }

    const handleDelete = (productId) => {
        if(!confirm('Удалить товар?')) return
        saveToDb(products.filter(p => p.id !== productId))
    }

    // Функция копирования ссылки
    const copyLink = () => {
        const url = `${window.location.origin}/view/${id}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div>Загрузка...</div>

    // Ссылка на готовый сайт
    const publicUrl = `${window.location.origin}/view/${id}`

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-black"><ArrowLeft /></Link>
                    <div>
                        <h1 className="font-bold text-xl">{site.name}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-green-600 font-medium">Онлайн</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Share2 size={18}/> Поделиться
                    </button>
                    <a href={publicUrl} target="_blank" className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-700 transition">
                        <ExternalLink size={18}/>
                    </a>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-6">
                {/* Кнопки и заголовок */}
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold">Товары ({products.length})</h2>
                    {!isFormOpen && (
                        <button onClick={() => setIsFormOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition">
                            <Plus size={20}/> Добавить товар
                        </button>
                    )}
                </div>

                {/* Форма */}
                {isFormOpen && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100 animate-fade-in ring-4 ring-blue-50/50">
                        <h3 className="font-bold mb-4 text-lg text-gray-800">
                            {editingId ? 'Редактирование товара' : 'Новый товар'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input placeholder="Название" className="border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <input placeholder="Цена" type="number" className="border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                   value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                            <input placeholder="Ссылка на картинку" className="border p-2 rounded md:col-span-2 focus:ring-2 ring-blue-500 outline-none"
                                   value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                            />
                            <textarea placeholder="Описание" className="border p-2 rounded md:col-span-2 focus:ring-2 ring-blue-500 outline-none"
                                      value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={closeForm} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Отмена</button>
                            <button onClick={handleSaveProduct} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                {editingId ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Сетка товаров */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                            <div className="h-48 bg-gray-100 overflow-hidden relative">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                                    <button onClick={() => startEdit(p)} className="bg-white text-blue-600 p-2 rounded-full shadow hover:bg-blue-50">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="bg-white text-red-500 p-2 rounded-full shadow hover:bg-red-50">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">{p.price} {site.currency}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО "ПОДЕЛИТЬСЯ" */}
            {isShareOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">Ваш сайт готов! 🚀</h3>
                                <p className="text-blue-100 text-sm mt-1">Используйте эту ссылку для продаж</p>
                            </div>
                            <button onClick={() => setIsShareOpen(false)} className="bg-white/20 p-1 rounded hover:bg-white/30 transition">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Поле со ссылкой */}
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200 mb-6">
                                <input
                                    readOnly
                                    value={publicUrl}
                                    className="bg-transparent flex-1 outline-none text-gray-600 text-sm font-mono"
                                />
                                <button
                                    onClick={copyLink}
                                    className={`p-2 rounded-md transition ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-600 shadow hover:bg-gray-50'}`}
                                >
                                    {copied ? <Check size={18}/> : <Copy size={18}/>}
                                </button>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-2 rounded-lg shadow-inner border mb-3">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl)}`}
                                        alt="QR Code"
                                        className="w-40 h-40"
                                    />
                                </div>
                                <p className="text-gray-500 text-xs text-center">
                                    Отсканируйте камерой телефона,<br/>чтобы проверить мобильную версию
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 border-t flex justify-center">
                            <a
                                href={`https://t.me/share/url?url=${publicUrl}&text=Посмотри мой новый магазин!`}
                                target="_blank"
                                className="text-blue-500 font-medium hover:underline flex items-center gap-2"
                            >
                                <Send size={16}/> Отправить в Telegram
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

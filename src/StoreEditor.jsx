import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
    ArrowLeft, Plus, Trash2, ExternalLink, Edit2, Share2, Copy, Check, X,
    Send, Package, ShoppingBag, Clock, Phone, Settings, Save, AlertTriangle
} from 'lucide-react'

// --- КОМПОНЕНТ КАРТОЧКИ ЗАКАЗА ---
const OrderCard = ({ order, currency, updateStatus }) => {
    const isNew = order.status === 'new'
    const { name, phone, telegram, comment } = order.customer_info

    // Очищаем ник телеграма от @ для ссылки
    const tgUsername = telegram ? telegram.replace('@', '').trim() : ''

    return (
        <div className={`bg-white rounded-lg shadow border p-6 ${isNew ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Заказ #{order.id.slice(0, 8)}</span>
                        {isNew ? (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase">Новый</span>
                        ) : (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold uppercase">Выполнен</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={14}/> {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold">{order.total} {currency}</div>
                </div>
            </div>

            {/* Данные клиента */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm space-y-2">
                <p className="font-bold text-gray-900 text-lg">{name}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                    <a href={`tel:${phone}`} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded hover:bg-gray-100 transition text-gray-700">
                        <Phone size={14}/> {phone}
                    </a>

                    {tgUsername && (
                        <a href={`https://t.me/${tgUsername}`} target="_blank" className="flex items-center gap-1 bg-blue-500 text-white border border-blue-600 px-3 py-1.5 rounded hover:bg-blue-600 transition">
                            <Send size={14}/> Написать в Telegram
                        </a>
                    )}
                </div>

                {comment && <p className="mt-2 text-gray-600 border-t pt-2 italic">Комментарий: "{comment}"</p>}
            </div>

            {/* Список товаров в заказе */}
            <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b border-dashed pb-1 last:border-0">
                        <span>{item.name}</span>
                        <span className="text-gray-500">{item.price}</span>
                    </div>
                ))}
            </div>

            {isNew && (
                <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
                >
                    Отметить как выполненный
                </button>
            )}
        </div>
    )
}

// --- ОСНОВНОЙ КОМПОНЕНТ РЕДАКТОРА ---
export default function StoreEditor() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Данные из БД
    const [site, setSite] = useState(null)
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    // Управление вкладками и UI
    const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders' | 'settings'
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Форма товара (Добавление/Редактирование)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [productForm, setProductForm] = useState({ name: '', price: '', image: '', desc: '' })

    // Форма настроек сайта
    const [settingsForm, setSettingsForm] = useState({
        name: '', description: '', currency: '', phone: '', telegram: '', instagram: ''
    })

    // --- ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => { loadData() }, [])

    // Подгружаем заказы только если открыта вкладка
    useEffect(() => { if (activeTab === 'orders') loadOrders() }, [activeTab])

    const loadData = async () => {
        const { data } = await supabase.from('sites').select('*').eq('id', id).single()
        if (data) {
            setSite(data)
            setProducts(data.content || [])

            // Парсим контакты из JSON
            let contacts = { phone: '', telegram: '', instagram: '' }
            try { contacts = JSON.parse(data.contacts) } catch (e) {}

            setSettingsForm({
                name: data.name,
                description: data.description,
                currency: data.currency,
                phone: contacts.phone || '',
                telegram: contacts.telegram || '',
                instagram: contacts.instagram || ''
            })
        }
        setLoading(false)
    }

    const loadOrders = async () => {
        const { data } = await supabase.from('orders').select('*').eq('site_id', id).order('created_at', { ascending: false })
        if (data) setOrders(data)
    }

    // --- ФУНКЦИИ ТОВАРОВ ---
    const saveProductsToDb = async (newProducts) => {
        setProducts(newProducts)
        await supabase.from('sites').update({ content: newProducts }).eq('id', id)
    }

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.price) return alert('Заполните название и цену!')

        let updated;
        if (editingId) {
            // Обновляем существующий
            updated = products.map(p => p.id === editingId ? { ...p, ...productForm } : p)
        } else {
            // Добавляем новый
            updated = [{ id: Date.now(), ...productForm }, ...products]
        }

        saveProductsToDb(updated)
        setProductForm({ name: '', price: '', image: '', desc: '' })
        setEditingId(null)
        setIsFormOpen(false)
    }

    const startEditProduct = (p) => {
        setProductForm({ name: p.name, price: p.price, image: p.image, desc: p.desc })
        setEditingId(p.id)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const deleteProduct = (productId) => {
        if(confirm('Удалить этот товар?')) {
            saveProductsToDb(products.filter(x => x.id !== productId))
        }
    }

    // --- ФУНКЦИИ НАСТРОЕК ---
    const saveSettings = async () => {
        const contactsJson = JSON.stringify({
            phone: settingsForm.phone,
            telegram: settingsForm.telegram,
            instagram: settingsForm.instagram
        })

        const updates = {
            name: settingsForm.name,
            description: settingsForm.description,
            currency: settingsForm.currency,
            contacts: contactsJson
        }

        const { error } = await supabase.from('sites').update(updates).eq('id', id)

        if (error) alert('Ошибка сохранения')
        else {
            alert('Настройки сохранены!')
            setSite({ ...site, ...updates }) // Обновляем UI мгновенно
        }
    }

    const deleteSite = async () => {
        const confirmText = prompt(`Чтобы удалить сайт, введите его название: "${site.name}"`)
        if (confirmText === site.name) {
            const { error } = await supabase.from('sites').delete().eq('id', id)
            if (error) alert('Ошибка: ' + error.message)
            else navigate('/') // Редирект на главную
        } else if (confirmText !== null) {
            alert('Название введено неверно. Удаление отменено.')
        }
    }

    // --- ФУНКЦИИ ЗАКАЗОВ И ОБЩЕЕ ---
    const updateOrderStatus = async (oid, status) => {
        await supabase.from('orders').update({ status }).eq('id', oid)
        loadOrders()
    }

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/view/${id}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Загрузка...</div>
    const publicUrl = `${window.location.origin}/view/${id}`

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* HEADER */}
            <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Link to="/" className="text-gray-500 hover:text-black"><ArrowLeft /></Link>
                    <div>
                        <h1 className="font-bold text-xl">{site.name}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-green-600 font-medium">Онлайн</p>
                        </div>
                    </div>
                </div>

                {/* НАВИГАЦИЯ ПО ВКЛАДКАМ */}
                <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
                    <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'products' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Package size={16}/> <span className="hidden sm:inline">Товары</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ShoppingBag size={16}/> <span className="hidden sm:inline">Заказы</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'settings' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Settings size={16}/> <span className="hidden sm:inline">Настройки</span>
                    </button>
                </div>

                {/* КНОПКИ ДЕЙСТВИЙ */}
                <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button onClick={() => setIsShareOpen(true)} className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium transition">
                        <Share2 size={18}/> <span className="hidden sm:inline">Поделиться</span>
                    </button>
                    <a href={publicUrl} target="_blank" className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-700 transition">
                        <ExternalLink size={18}/>
                    </a>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-6">

                {/* === Вкладка: ТОВАРЫ === */}
                {activeTab === 'products' && (
                    <>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold">Товары ({products.length})</h2>
                            {!isFormOpen && (
                                <button onClick={() => setIsFormOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition">
                                    <Plus size={20}/> Добавить товар
                                </button>
                            )}
                        </div>

                        {/* Форма добавления/редактирования */}
                        {isFormOpen && (
                            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100 animate-fade-in ring-4 ring-blue-50/50">
                                <h3 className="font-bold mb-4 text-lg">{editingId ? 'Редактирование' : 'Новый товар'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input placeholder="Название" className="border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                           value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}/>
                                    <input placeholder="Цена" type="number" className="border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                           value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})}/>
                                    <input placeholder="Ссылка на картинку" className="border p-2 rounded md:col-span-2 focus:ring-2 ring-blue-500 outline-none"
                                           value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})}/>
                                    <textarea placeholder="Описание" className="border p-2 rounded md:col-span-2 focus:ring-2 ring-blue-500 outline-none"
                                              value={productForm.desc} onChange={e => setProductForm({...productForm, desc: e.target.value})}/>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setIsFormOpen(false); setEditingId(null); setProductForm({ name: '', price: '', image: '', desc: '' }) }} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Отмена</button>
                                    <button onClick={handleSaveProduct} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
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
                                            <button onClick={() => startEditProduct(p)} className="bg-white text-blue-600 p-2 rounded-full shadow hover:bg-blue-50"><Edit2 size={16}/></button>
                                            <button onClick={() => deleteProduct(p.id)} className="bg-white text-red-500 p-2 rounded-full shadow hover:bg-red-50"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">{p.price} {site.currency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* === Вкладка: ЗАКАЗЫ === */}
                {activeTab === 'orders' && (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Входящие заказы</h2>
                        {orders.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50"/>
                                <p>Заказов пока нет.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {orders.map(order => (
                                    <OrderCard key={order.id} order={order} currency={site.currency} updateStatus={updateOrderStatus} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* === Вкладка: НАСТРОЙКИ === */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings className="text-gray-400"/> Настройки магазина</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Название магазина</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                           value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                            value={settingsForm.currency} onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})}>
                                        <option value="₽">Рубли (₽)</option>
                                        <option value="$">Доллары ($)</option>
                                        <option value="€">Евро (€)</option>
                                        <option value="₸">Тенге (₸)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание (Слоган)</label>
                                <input className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none"
                                       value={settingsForm.description} onChange={e => setSettingsForm({...settingsForm, description: e.target.value})}/>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                                <h3 className="font-medium text-gray-900">Контакты</h3>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Телефон</label>
                                    <input className="w-full border p-2 rounded mt-1" placeholder="+7..."
                                           value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Telegram</label>
                                        <input className="w-full border p-2 rounded mt-1" placeholder="username (без @)"
                                               value={settingsForm.telegram} onChange={e => setSettingsForm({...settingsForm, telegram: e.target.value})}/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Instagram</label>
                                        <input className="w-full border p-2 rounded mt-1" placeholder="https://..."
                                               value={settingsForm.instagram} onChange={e => setSettingsForm({...settingsForm, instagram: e.target.value})}/>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                                <button onClick={saveSettings} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                                    <Save size={18}/> Сохранить изменения
                                </button>
                            </div>

                            {/* ОПАСНАЯ ЗОНА */}
                            <div className="mt-10 border border-red-200 rounded-lg overflow-hidden">
                                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="text-red-600" size={20}/>
                                    <h3 className="font-bold text-red-900">Опасная зона</h3>
                                </div>
                                <div className="p-6 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <p className="font-bold text-gray-900">Удалить этот сайт</p>
                                        <p className="text-sm text-gray-500">
                                            Сайт и все заказы будут удалены безвозвратно.
                                        </p>
                                    </div>
                                    <button
                                        onClick={deleteSite}
                                        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 whitespace-nowrap"
                                    >
                                        Удалить сайт
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПОДЕЛИТЬСЯ */}
            {isShareOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                            <div><h3 className="text-xl font-bold">Готово!</h3></div>
                            <button onClick={() => setIsShareOpen(false)} className="bg-white/20 p-1 rounded hover:bg-white/30"><X size={20}/></button>
                        </div>
                        <div className="p-6 text-center space-y-4">
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded border">
                                <input readOnly value={publicUrl} className="bg-transparent flex-1 outline-none text-sm"/>
                                <button onClick={copyLink} className="text-blue-600 hover:text-blue-800"><Copy size={18}/></button>
                            </div>
                            <div className="flex justify-center p-2 bg-white border rounded">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`} alt="QR"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

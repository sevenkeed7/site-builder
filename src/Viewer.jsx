import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { ShoppingCart, Phone, X, Instagram, Send, ExternalLink } from 'lucide-react'

// Компонент для отображения иконок соцсетей
const Socials = ({ data, theme = 'light' }) => {
    let contacts = { phone: '', telegram: '', instagram: '' }
    let isLegacy = false

    try {
        // Пытаемся понять, это JSON или старый текст?
        if (data.startsWith('{')) {
            contacts = JSON.parse(data)
        } else {
            isLegacy = true // Это старый сайт, где просто текст
        }
    } catch (e) { isLegacy = true }

    if (isLegacy) return <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{data}</p>

    const iconClass = theme === 'dark' ? 'text-yellow-500 hover:text-white' : 'text-gray-600 hover:text-blue-600'

    return (
        <div className="flex flex-col items-center gap-3">
            {contacts.phone && (
                <a href={`tel:${contacts.phone}`} className={`flex items-center gap-2 ${iconClass}`}>
                    <Phone size={20}/> {contacts.phone}
                </a>
            )}
            <div className="flex gap-6 mt-2">
                {contacts.telegram && (
                    <a href={`https://t.me/${contacts.telegram}`} target="_blank" className={iconClass}>
                        <Send size={24}/>
                    </a>
                )}
                {contacts.instagram && (
                    <a href={contacts.instagram} target="_blank" className={iconClass}>
                        <Instagram size={24}/>
                    </a>
                )}
            </div>
        </div>
    )
}

// --- MINIMAL ---
const MinimalTemplate = ({ site, products, cart, addToCart, setIsCartOpen }) => (
    <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
        <nav className="border-b sticky top-0 bg-white/95 backdrop-blur z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="text-2xl font-bold tracking-tight">{site.name}</div>
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-gray-100 rounded-full">
                    <ShoppingCart size={24} />
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}
                </button>
            </div>
        </nav>
        <div className="bg-gray-50 py-20 text-center px-4">
            <h1 className="text-5xl font-extrabold mb-4 text-gray-900">{site.name}</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">{site.description}</p>
        </div>
        <main className="max-w-6xl mx-auto px-4 py-12 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                    <div key={product.id} className="group">
                        <div className="aspect-square overflow-hidden rounded-xl bg-gray-200 mb-4">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{product.desc}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">{product.price} {site.currency}</div>
                                <button onClick={() => addToCart(product)} className="mt-2 text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800">В корзину</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
        <footer className="bg-gray-100 py-10 mt-10 text-center">
            <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">Контакты</h3>
            <Socials data={site.contacts} theme="light" />
        </footer>
    </div>
)

// --- DARK LUXURY ---
const DarkTemplate = ({ site, products, cart, addToCart, setIsCartOpen }) => (
    <div className="font-serif text-gray-100 bg-zinc-900 min-h-screen flex flex-col">
        <nav className="border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur z-50">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="text-3xl font-serif tracking-widest text-yellow-500 uppercase">{site.name}</div>
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-yellow-500 hover:text-yellow-400">
                    <ShoppingCart size={24} />
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}
                </button>
            </div>
        </nav>
        <div className="relative py-24 text-center px-4 bg-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-thin mb-6 text-white tracking-widest uppercase">{site.name}</h1>
                <div className="w-24 h-1 bg-yellow-600 mx-auto mb-6"></div>
                <p className="text-xl text-gray-300 max-w-xl mx-auto italic font-light">{site.description}</p>
            </div>
        </div>
        <main className="max-w-6xl mx-auto px-6 py-16 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {products.map(product => (
                    <div key={product.id} className="group flex flex-col md:flex-row gap-6 bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800 transition border border-zinc-800 hover:border-yellow-600/30">
                        <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded bg-black">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100"/>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-serif text-white mb-2">{product.name}</h3>
                            <p className="text-gray-400 mb-4 text-sm leading-relaxed">{product.desc}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <div className="text-2xl text-yellow-500 font-light">{product.price} {site.currency}</div>
                                <button onClick={() => addToCart(product)} className="border border-yellow-600 text-yellow-500 px-6 py-2 hover:bg-yellow-600 hover:text-black transition uppercase text-xs tracking-widest">Купить</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
        <footer className="bg-black py-16 mt-10 text-center border-t border-zinc-800">
            <h3 className="text-yellow-600 mb-6 uppercase tracking-widest text-sm">Связь с нами</h3>
            <Socials data={site.contacts} theme="dark" />
        </footer>
    </div>
)

const CartDrawer = ({ cart, removeFromCart, isOpen, close, currency }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close}></div>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-black">Ваш заказ</h2>
                    <button onClick={close} className="text-black"><X/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-4 border-b pb-4">
                            <img src={item.image} className="w-16 h-16 rounded object-cover bg-gray-100"/>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">{item.name}</div>
                                <div className="text-gray-500">{item.price} {currency}</div>
                            </div>
                            <button onClick={() => removeFromCart(idx)} className="text-red-500 text-sm">Удалить</button>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-xl font-bold mb-4 text-black">
                        <span>Итого:</span>
                        <span>{cart.reduce((sum, item) => sum + Number(item.price), 0)} {currency}</span>
                    </div>
                    <button onClick={() => alert('Спасибо за заказ!')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Оплатить</button>
                </div>
            </div>
        </div>
    )
}

export default function Viewer() {
    const { id } = useParams()
    const [site, setSite] = useState(null)
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('sites').select('*').eq('id', id).single()
            .then(({ data }) => { setSite(data); setLoading(false) })
    }, [id])

    const addToCart = (p) => { setCart([...cart, p]); setIsCartOpen(true) }
    const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx))

    if (loading) return <div>Загрузка...</div>
    if (!site) return <div>404 Сайт не найден</div>

    return (
        <>
            {site.template_id === 'dark' ? (
                <DarkTemplate site={site} products={site.content || []} cart={cart} addToCart={addToCart} setIsCartOpen={setIsCartOpen}/>
            ) : (
                <MinimalTemplate site={site} products={site.content || []} cart={cart} addToCart={addToCart} setIsCartOpen={setIsCartOpen}/>
            )}
            <CartDrawer isOpen={isCartOpen} close={() => setIsCartOpen(false)} cart={cart} removeFromCart={removeFromCart} currency={site.currency}/>
        </>
    )
}

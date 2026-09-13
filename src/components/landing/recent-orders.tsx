'use client'

import { useEffect, useState } from 'react'
import { Heart, MessageCircle, PlaySquare, ThumbsUp, CheckCircle2, UserPlus } from 'lucide-react'

const MOCK_ORDERS = [
  { id: 1, user: 'Alex M.', service: 'Instagram Followers', qty: '5,000', icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-100', time: 'Just now' },
  { id: 2, user: 'Sarah K.', service: 'YouTube Views', qty: '10,000', icon: PlaySquare, color: 'text-red-600', bg: 'bg-red-100', time: '2 mins ago' },
  { id: 3, user: 'DevGuy', service: 'Twitter Retweets', qty: '500', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100', time: '5 mins ago' },
  { id: 4, user: 'BrandInc', service: 'Instagram Likes', qty: '2,500', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', time: '12 mins ago' },
  { id: 5, user: 'MarketingPro', service: 'Facebook Page Likes', qty: '1,000', icon: ThumbsUp, color: 'text-blue-700', bg: 'bg-blue-100', time: '18 mins ago' },
  { id: 6, user: 'CreatorX', service: 'YouTube Subscribers', qty: '1,000', icon: PlaySquare, color: 'text-red-600', bg: 'bg-red-100', time: '22 mins ago' },
]

export function RecentOrdersMockup({ dict }: { dict: { totalOrders: string; followersGained: string; liveOrders: string; realTimeFeed: string; } }) {
  const [orders, setOrders] = useState(MOCK_ORDERS.slice(0, 3))
  const [index, setIndex] = useState(3)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      
      setTimeout(() => {
        setOrders(prev => {
          const newOrders = [...prev]
          newOrders.pop() // Remove last
          newOrders.unshift(MOCK_ORDERS[index % MOCK_ORDERS.length]) // Add new at top
          return newOrders
        })
        setIndex(i => i + 1)
        setIsAnimating(false)
      }, 500)
    }, 3500) // Rotate every 3.5s

    return () => clearInterval(interval)
  }, [index])

  return (
    <div className="h-[320px] bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          {dict.liveOrders}
        </h3>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">{dict.realTimeFeed}</span>
      </div>
      
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex flex-col gap-3">
          {orders.map((order, i) => (
            <div 
              key={`${order.id}-${i}`} 
              className={`flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50 transition-all duration-500
                ${isAnimating && i === 0 ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
                ${isAnimating && i === 2 ? 'opacity-0 translate-y-4 scale-95' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.bg}`}>
                  <order.icon className={`w-5 h-5 ${order.color}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{order.user}</div>
                  <div className="text-xs text-slate-500">{order.service}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">+{order.qty}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {order.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

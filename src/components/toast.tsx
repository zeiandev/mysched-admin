'use client';
import { createContext, useContext, useState } from 'react';

type T = { id: number; kind:'error'|'success'|'info'; msg: string };
const C = createContext<(o: Omit<T,'id'>)=>void>(()=>{});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items,set] = useState<T[]>([]);
  const push = (o: Omit<T,'id'>) => {
    const id = Date.now()+Math.random();
    set(v => [...v, { id, ...o }]);
    setTimeout(()=>set(v=>v.filter(x=>x.id!==id)), 4500);
  };
  return (
    <C.Provider value={push}>
      {children}
      <div className="fixed right-4 bottom-4 space-y-2 z-50">
        {items.map(t=>(
          <div key={t.id}
               className={`rounded-xl px-4 py-3 text-sm shadow
                 ${t.kind==='error'?'bg-red-600 text-white':
                   t.kind==='success'?'bg-green-600 text-white':'bg-gray-900 text-white'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </C.Provider>
  );
}
export function useToast(){ return useContext(C); }

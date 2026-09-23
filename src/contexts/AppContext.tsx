import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../lib/firebase';
import { loadData, saveItem, removeItem } from '../repositories/dataRepository';
import type { Dataset, Role } from '../types';
type Profile={name:string;email:string;role:Role};
type Context={data:Dataset|null;loading:boolean;error:string;profile:Profile|null;demo:boolean;authenticated:boolean;canEdit:boolean;refresh:()=>Promise<void>;save:<K extends keyof Dataset>(name:K,item:Dataset[K][number])=>Promise<void>;remove:<K extends keyof Dataset>(name:K,id:string)=>Promise<void>;login:(email:string,password:string)=>Promise<void>;logout:()=>Promise<void>};
const AppContext=createContext<Context|null>(null);
const demoProfile:Profile={name:'Pessoa visitante',email:'',role:import.meta.env.DEV?'admin':'viewer'};
export function AppProvider({children}:{children:ReactNode}){
  const [data,setData]=useState<Dataset|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [profile,setProfile]=useState<Profile|null>(firebaseConfigured?null:demoProfile);
  async function refresh(){try{setLoading(true);setError('');setData(await loadData());}catch{setError('Não foi possível carregar os dados. Confira a conexão e as regras do Firestore.');setData(null);}finally{setLoading(false);}}
  useEffect(()=>{
    if(!auth||!db){void refresh();return;}
    return onAuthStateChanged(auth,async(user:User|null)=>{
      setLoading(true);setError('');
      if(!user){setProfile(null);setData(null);setLoading(false);return;}
      try{
        const snap=await getDoc(doc(db!,'users',user.uid));
        const value=snap.data();
        const nextProfile:Profile={name:String(value?.name||user.email||'Usuário'),email:user.email||'',role:value?.role==='admin'||value?.role==='editor'?value.role:'viewer'};
        setProfile(nextProfile);
        setData(await loadData());
      }catch{setProfile({name:user.email||'Usuário',email:user.email||'',role:'viewer'});setData(null);setError('Sua conta entrou, mas os dados não puderam ser carregados. Confira o perfil em users/{uid} e as regras do Firestore.');}
      finally{setLoading(false);}
    });
  },[]);
  async function save<K extends keyof Dataset>(name:K,item:Dataset[K][number]){if(!profile||profile.role==='viewer')throw new Error('Sem permissão para editar.');await saveItem(name,item);await refresh();}
  async function remove<K extends keyof Dataset>(name:K,id:string){if(!profile||profile.role!=='admin')throw new Error('Apenas administradores podem excluir.');await removeItem(name,id);await refresh();}
  async function login(email:string,password:string){if(!auth)throw new Error('O Firebase não está configurado neste ambiente.');await signInWithEmailAndPassword(auth,email,password);}
  async function logout(){if(auth)await signOut(auth);}
  const demo=!firebaseConfigured;
  return <AppContext.Provider value={{data,loading,error,profile,demo,authenticated:!demo&&!!profile,canEdit:!!profile&&profile.role!=='viewer',refresh,save,remove,login,logout}}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('AppProvider ausente');return value;}

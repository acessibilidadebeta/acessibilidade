import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../lib/firebase';
import { loadData, saveItem, removeItem } from '../repositories/dataRepository';
import type { Dataset, Role, UserAccount } from '../types';
const OWNER_EMAIL='vinizac@hotmail.com';
type Profile={name:string;email:string;role:Role};
type Context={data:Dataset|null;loading:boolean;error:string;profile:Profile|null;demo:boolean;authenticated:boolean;canEdit:boolean;refresh:()=>Promise<void>;save:<K extends keyof Dataset>(name:K,item:Dataset[K][number])=>Promise<void>;remove:<K extends keyof Dataset>(name:K,id:string)=>Promise<void>;login:(email:string,password:string)=>Promise<void>;register:(name:string,email:string,password:string)=>Promise<void>;logout:()=>Promise<void>};
const AppContext=createContext<Context|null>(null);
const demoProfile:Profile={name:'Pessoa visitante',email:'',role:import.meta.env.DEV?'admin':'viewer'};
export function AppProvider({children}:{children:ReactNode}){
  const [data,setData]=useState<Dataset|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [profile,setProfile]=useState<Profile|null>(firebaseConfigured?null:demoProfile);
  async function refresh(){try{setLoading(true);setError('');setData(await loadData());}catch{setError('Não foi possível carregar os dados. Confira a conexão e as regras do Firestore.');setData(null);}finally{setLoading(false);}}
  useEffect(()=>{
    if(!auth||!db){void refresh();return;}
    return onAuthStateChanged(auth,async(user:User|null)=>{
      setLoading(true);setError('');
      if(!user){setProfile(null);setData(null);setLoading(false);return;}
      try{
        const email=(user.email||'').toLowerCase();
        const ref=doc(db!,'users',user.uid),snap=await getDoc(ref);
        let account=snap.data() as Omit<UserAccount,'id'>|undefined;
        if(!account){account={name:user.displayName||user.email||'Usuário',email:user.email||'',role:email===OWNER_EMAIL?'admin':'pending',createdAt:new Date().toISOString().slice(0,10)};await setDoc(ref,account);}
        const role:Role=email===OWNER_EMAIL?'admin':account.role;
        setProfile({name:account.name||user.email||'Usuário',email:user.email||'',role});
        if(role==='pending'||role==='blocked'){setData(null);}else{setData(await loadData());}
      }catch{setProfile({name:user.email||'Usuário',email:user.email||'',role:'blocked'});setData(null);setError('Não foi possível validar sua permissão de acesso.');}
      finally{setLoading(false);}
    });
  },[]);
  async function save<K extends keyof Dataset>(name:K,item:Dataset[K][number]){if(!profile||profile.role==='viewer'||profile.role==='pending'||profile.role==='blocked')throw new Error('Sem permissão para editar.');await saveItem(name,item);await refresh();}
  async function remove<K extends keyof Dataset>(name:K,id:string){if(!profile||profile.role!=='admin')throw new Error('Apenas administradores podem excluir.');await removeItem(name,id);await refresh();}
  async function login(email:string,password:string){if(!auth)throw new Error('O Firebase não está configurado neste ambiente.');await signInWithEmailAndPassword(auth,email,password);}
  async function register(name:string,email:string,password:string){if(!auth||!db)throw new Error('O Firebase não está configurado neste ambiente.');const credential=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(credential.user,{displayName:name});const normalized=email.toLowerCase();await setDoc(doc(db,'users',credential.user.uid),{name,email,role:normalized===OWNER_EMAIL?'admin':'pending',createdAt:new Date().toISOString().slice(0,10)});}
  async function logout(){if(auth)await signOut(auth);}
  const demo=!firebaseConfigured;
  return <AppContext.Provider value={{data,loading,error,profile,demo,authenticated:!demo&&!!profile,canEdit:!!profile&&['editor','admin'].includes(profile.role),refresh,save,remove,login,register,logout}}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('AppProvider ausente');return value;}

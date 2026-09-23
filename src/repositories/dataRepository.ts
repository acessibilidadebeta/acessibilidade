import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockData } from '../data/mockData';
import type { Dataset } from '../types';
type CollectionName = keyof Dataset;
const storageKey = 'painel-acessibilidade-demo';
const clone = (): Dataset => JSON.parse(JSON.stringify(mockData)) as Dataset;
function demo():Dataset { try { const saved=localStorage.getItem(storageKey); if(!saved)return clone(); const data=JSON.parse(saved) as Dataset; data.issues=data.issues.map(issue=>({...issue,status:String(issue.status)==='fixing'?'open':String(issue.status)==='rejected'?'cancelled':issue.status})); data.regressionTests=data.regressionTests.map(test=>({...test,status:String(test.status)==='rejected'?'cancelled':test.status})); return data; } catch { return clone(); } }
export async function loadData(includeUsers=false):Promise<Dataset> { if(!db) return demo(); const names:CollectionName[]=includeUsers?['users','versions','prs','issues','regressionTests','knowledgeArticles']:['versions','prs','issues','regressionTests','knowledgeArticles']; const entries=await Promise.all(names.map(async name=>[name,(await getDocs(collection(db!,name))).docs.map(d=>({ ...d.data(),id:d.id }))] as const)); return {...Object.fromEntries(entries),users:includeUsers?(Object.fromEntries(entries).users||[]):[]} as Dataset; }
export async function saveItem<K extends CollectionName>(name:K,item:Dataset[K][number]):Promise<void> { if(db) await setDoc(doc(db,name,item.id),item); else {const data=demo(); const list=data[name] as typeof item[]; const index=list.findIndex(x=>x.id===item.id); if(index<0) list.unshift(item); else list[index]=item; localStorage.setItem(storageKey,JSON.stringify(data));} }
export async function removeItem<K extends CollectionName>(name:K,id:string):Promise<void> { if(db) await deleteDoc(doc(db,name,id)); else {const data=demo(); (data[name] as {id:string}[])=data[name].filter(x=>x.id!==id) as Dataset[K]; localStorage.setItem(storageKey,JSON.stringify(data));} }

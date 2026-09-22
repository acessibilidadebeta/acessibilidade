import type { Dataset, Issue, Status } from '../types';
export const statusLabel:Record<Status,string>={open:'Aberto',closed:'Fechado',resolved:'Resolvido',cancelled:'Cancelado',retest:'Aguardando reteste'};
export const statuses:Status[]=['open','closed','resolved','cancelled','retest'];
export const dateBR=(date:string)=>date?new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR'):'—';
export function counts(items:{status:Status}[]){return Object.fromEntries(statuses.map(status=>[status,items.filter(x=>x.status===status).length])) as Record<Status,number>;}
export function versionIssues(data:Dataset,id:string){return data.issues.filter(x=>x.versionId===id);}
export function percentage(items:Issue[]){return items.length?Math.round(items.filter(x=>x.status==='resolved'||x.status==='closed').length/items.length*100):0;}

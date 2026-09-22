import type { ReactNode } from 'react';
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
export function Empty({children}:{children:ReactNode}){return <div className="empty">{children}</div>}

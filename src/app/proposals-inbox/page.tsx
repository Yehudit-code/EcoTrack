"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

export default function ProposalsInboxPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (!userStr) {
      setError("User not found");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    fetch(`/api/company-requests?userId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        setProposals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch proposals");
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center',marginTop:80}}>Loading proposals...</div>;
  if (error) return <div style={{textAlign:'center',marginTop:80,color:'#d33'}}>{error}</div>;

  return (
    <div style={{maxWidth:600,margin:'60px auto',background:'#fff',borderRadius:16,padding:32,boxShadow:'0 2px 12px #eee'}}>
      <h2 style={{display:'flex',alignItems:'center',gap:10,fontSize:28,fontWeight:700,marginBottom:24}}>
        <ShoppingCart size={32} color="#2e7d32" /> Proposals Inbox
      </h2>
      {proposals.length === 0 ? (
        <div style={{textAlign:'center',color:'#888'}}>No proposals received yet.</div>
      ) : (
        <ul style={{listStyle:'none',padding:0}}>
          {proposals.map((p) => (
            <li key={p._id} style={{borderBottom:'1px solid #eee',padding:'18px 0'}}>
              <div style={{fontWeight:600,fontSize:18}}>{p.productName}</div>
              <div style={{color:'#555',margin:'6px 0'}}>{p.description}</div>
              <div style={{color:'#2e7d32',fontWeight:500}}>Price: {p.price} ₪</div>
              <div style={{fontSize:13,color:'#888'}}>Status: {p.status}</div>
              <div style={{fontSize:12,color:'#aaa'}}>Received: {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import type { CSSProperties, FC } from "react";

// Type Definitions
type Category = "Food" | "Transport" | "Shopping" | "Bills" | "Skincare & Necessities" | "Others";

interface Transaction {
  id: number;
  date: string;
  item: string;
  category: Category;
  price: number;
  paidBy: "Me" | "Fiancée" | "Shared";
  notes: string;
}

type FormState = Omit<Transaction, 'id' | 'price'> & { price: string };

const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Skincare & Necessities", "Others"];
const CATEGORY_COLORS: Record<Category, string> = { Food: "#FF6B6B", Transport: "#4ECDC4", Shopping: "#45B7D1", Bills: "#FFA07A", "Skincare & Necessities": "#C084FC", Others: "#98D8C8" };
const CATEGORY_ICONS: Record<Category, string> = { Food: "🍔", Transport: "🚌", Shopping: "🛍️", Bills: "📄", "Skincare & Necessities": "🧴", Others: "📦" };
const SAMPLE_DATA: Transaction[] = [
  { id:1, date:"2025-02-01", item:"Chicken Rice", category:"Food", price:5.5, paidBy:"Me", notes:"" },
  { id:2, date:"2025-02-02", item:"MRT Top Up", category:"Transport", price:20.0, paidBy:"Fiancée", notes:"" },
  { id:3, date:"2025-02-03", item:"NTUC Groceries", category:"Shopping", price:62.3, paidBy:"Me", notes:"" },
  { id:4, date:"2025-02-05", item:"Netflix", category:"Bills", price:17.98, paidBy:"Me", notes:"" },
  { id:5, date:"2025-02-07", item:"Grab Ride", category:"Transport", price:14.0, paidBy:"Fiancée", notes:"" },
  { id:6, date:"2025-02-08", item:"Kopitiam Lunch", category:"Food", price:7.5, paidBy:"Me", notes:"" },
  { id:7, date:"2025-02-10", item:"Electricity Bill", category:"Bills", price:89.0, paidBy:"Me", notes:"" },
  { id:8, date:"2025-02-12", item:"Zara Top", category:"Shopping", price:45.9, paidBy:"Fiancée", notes:"" },
  { id:9, date:"2025-02-14", item:"Valentine Dinner", category:"Food", price:120.0, paidBy:"Me", notes:"" },
  { id:10, date:"2025-02-15", item:"Bus Fare", category:"Transport", price:2.5, paidBy:"Fiancée", notes:"" },
  { id:11, date:"2025-01-05", item:"Hawker Dinner", category:"Food", price:12.0, paidBy:"Me", notes:"" },
  { id:12, date:"2025-01-10", item:"Spotify", category:"Bills", price:9.99, paidBy:"Fiancée", notes:"" },
  { id:13, date:"2025-01-15", item:"Uniqlo Jacket", category:"Shopping", price:79.9, paidBy:"Me", notes:"" },
  { id:14, date:"2025-01-20", item:"Taxi to Airport", category:"Transport", price:38.0, paidBy:"Me", notes:"" },
  { id:15, date:"2025-01-25", item:"Water Bill", category:"Bills", price:32.0, paidBy:"Fiancée", notes:"" },
];

function fmt(n: number): string { return `S$${Number(n).toFixed(2)}`; }
function getMon(date: string): string { const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()-day+(day===0?-6:1)); return d.toISOString().split("T")[0]; }

interface TransactionListProps { items: Transaction[]; onEdit: (item: Transaction) => void; onDelete: (id: number) => void; emptyMsg?: string; }
const TransactionList: FC<TransactionListProps> = ({ items, onEdit, onDelete, emptyMsg }) => {
  const bdg=(c: string): CSSProperties =>({display:"inline-block",background:c+"22",color:c,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600});
  const btn=(v: "danger" | "secondary"): CSSProperties =>({padding:"5px 10px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:v==="danger"?"#FF6B6B":"#f0f0f0",color:v==="danger"?"#fff":"#555"});
  if(!items.length) return <div style={{textAlign:"center",padding:"24px 0",color:"#aaa",fontSize:13}}>{emptyMsg||"No transactions found."}</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {items.map(e=>(
        <div key={e.id} style={{display:"flex",alignItems:"center",background:"#fafafa",borderRadius:12,padding:"11px 14px",gap:12,border:"1px solid #f0f0f0"}}>
          <div style={{width:34,height:34,borderRadius:9,background:CATEGORY_COLORS[e.category]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{CATEGORY_ICONS[e.category]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#333",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.item}</div>
            <div style={{fontSize:11,color:"#888",marginTop:2}}>{e.date} · <span style={bdg(CATEGORY_COLORS[e.category])}>{e.category}</span> · {e.paidBy}</div>
          </div>
          <div style={{fontWeight:800,color:"#333",fontSize:14,flexShrink:0}}>{fmt(e.price)}</div>
          {onEdit&&<button style={btn("secondary")} onClick={()=>onEdit(e)}>✏️</button>}
          {onDelete&&<button style={btn("danger")} onClick={()=>onDelete(e.id)}>🗑️</button>}
        </div>
      ))}
    </div>
  );
}

interface DrilldownPanelProps { title: string; color: string; icon: string; items: Transaction[]; onClose: () => void; onEdit: (item: Transaction) => void; onDelete: (id: number) => void; }
const DrilldownPanel: FC<DrilldownPanelProps> = ({ title, color, icon, items, onClose, onEdit, onDelete }) => {
  const total = items.reduce((s,e)=>s+e.price,0);
  const sorted = [...items].sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.12)",marginBottom:16,overflow:"hidden",border:`2px solid ${color}33`}}>
      <div style={{background:`linear-gradient(135deg,${color}dd,${color}99)`,padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>{icon}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>{title}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>{items.length} transaction{items.length!==1?"s":""} · Total: {fmt(total)}</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.25)",border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"#fff",fontWeight:700,fontSize:13}}>✕ Close</button>
      </div>
      <div style={{padding:"16px 20px"}}>
        <TransactionList items={sorted} onEdit={onEdit} onDelete={onDelete} emptyMsg="No transactions in this category for the selected period." />
      </div>
    </div>
  );
}

interface ChartBar { label: string; value: number; }
interface ClickableBarProps { data: ChartBar[]; colorMap?: Record<string, string>; onClickBar: (label: string) => void; }
const ClickableBar: FC<ClickableBarProps> = ({ data, colorMap, onClickBar }) => {
  if(!data||!data.length) return <p style={{color:"#aaa",textAlign:"center"}}>No data</p>;
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map(d=>(
        <div key={d.label} onClick={()=>d.value>0&&onClickBar(d.label)}
          style={{display:"flex",alignItems:"center",gap:10,cursor:d.value>0?"pointer":"default",borderRadius:8,padding:"3px 4px",transition:"background 0.15s"}}
          onMouseEnter={e=>{if(d.value>0)e.currentTarget.style.background="#f0f4ff";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
          <div style={{width:90,fontSize:12,color:"#555",textAlign:"right",flexShrink:0,fontWeight:d.value>0?600:400}}>{d.label}</div>
          <div style={{flex:1,background:"#f0f0f0",borderRadius:6,overflow:"hidden",height:22}}>
            <div style={{width:`${(d.value/max)*100}%`,background:colorMap?colorMap[d.label as Category]||"#45B7D1":"#45B7D1",height:"100%",borderRadius:6,transition:"width 0.4s",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6}}>
              {d.value>0&&<span style={{fontSize:10,color:"#fff",fontWeight:600,whiteSpace:"nowrap"}}>{fmt(d.value)}</span>}
            </div>
          </div>
          {d.value>0&&<span style={{fontSize:11,color:"#aaa",flexShrink:0}}>›</span>}
        </div>
      ))}
    </div>
  );
}

interface ClickableDonutProps { data: ChartBar[]; onClickSlice: (label: Category) => void; }
const ClickableDonut: FC<ClickableDonutProps> = ({ data, onClickSlice }) => {
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total) return <p style={{color:"#aaa",textAlign:"center"}}>No data</p>;
  let cum=0; const sz=160,r=55,cx=80,cy=80;
  const slices=data.map(d=>{
    const s=(cum/total)*2*Math.PI-Math.PI/2; cum+=d.value; const e=(cum/total)*2*Math.PI-Math.PI/2;
    const x1=cx+r*Math.cos(s),y1=cy+r*Math.sin(s),x2=cx+r*Math.cos(e),y2=cy+r*Math.sin(e);
    return {...d,path:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${e-s>Math.PI?1:0} 1 ${x2} ${y2} Z`};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap",justifyContent:"center"}}>
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
        {slices.map(s=>(
          <path key={s.label} d={s.path} fill={CATEGORY_COLORS[s.label as Category]||"#ccc"} stroke="#fff" strokeWidth={2}
            style={{cursor:s.value>0?"pointer":"default",transition:"opacity 0.15s"}}
            onMouseEnter={e=>{if(s.value>0)e.currentTarget.style.opacity="0.75";}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}
            onClick={()=>s.value>0&&onClickSlice(s.label as Category)}/>
        ))}
        <circle cx={cx} cy={cy} r={35} fill="#fff"/>
        <text x={cx} y={cy-5} textAnchor="middle" fontSize={10} fill="#888">Total</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#333">{fmt(total)}</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.filter(d=>d.value>0).map(d=>(
          <div key={d.label} onClick={()=>onClickSlice(d.label as Category)}
            style={{display:"flex",alignItems:"center",gap:8,fontSize:12,cursor:"pointer",borderRadius:7,padding:"4px 8px",transition:"background 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#f0f4ff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
            <div style={{width:12,height:12,borderRadius:3,background:CATEGORY_COLORS[d.label as Category]||"#ccc",flexShrink:0}}/>
            <span style={{color:"#555"}}>{d.label}</span>
            <span style={{color:"#333",fontWeight:600,marginLeft:"auto",paddingLeft:12}}>{((d.value/total)*100).toFixed(1)}%</span>
            <span style={{color:"#aaa",fontSize:10}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App(){
  const [expenses,setExpenses]=useState<Transaction[]>(SAMPLE_DATA);
  const [tab,setTab]=useState("dashboard");
  const emptyForm: FormState ={date:new Date().toISOString().split("T")[0],item:"",category:"Food",price:"",paidBy:"Me",notes:""};
  const [form,setForm]=useState<FormState>(emptyForm);
  const [err,setErr]=useState("");
  const [ok,setOk]=useState(false);
  const [fMonth,setFMonth]=useState("2025-02");
  const [fCat,setFCat]=useState<Category | "All">("All");
  const [editId,setEditId]=useState<number | null>(null);
  const [search,setSearch]=useState("");
  const [view,setView]=useState("monthly");
  const [sort,setSort]=useState("date-desc");
  const [drilldown,setDrilldown]=useState<Category | "All" | null>(null);

  const allMonths=useMemo(()=>[...new Set(expenses.map(e=>e.date.slice(0,7)))].sort().reverse(),[expenses]);
  const filtered=useMemo(()=>expenses.filter(e=>(fMonth==="All"||e.date.startsWith(fMonth))&&(fCat==="All"||e.category===fCat)&&(!search||e.item.toLowerCase().includes(search.toLowerCase()))),[expenses,fMonth,fCat,search]);
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>sort==="date-desc"?b.date.localeCompare(a.date):sort==="date-asc"?a.date.localeCompare(b.date):sort==="price-desc"?b.price-a.price:a.price-b.price),[filtered,sort]);
  const catTotals=useMemo(()=>CATEGORIES.map(c=>({label:c,value:filtered.filter(e=>e.category===c).reduce((s,e)=>s+e.price,0)})),[filtered]);
  const total=useMemo(()=>filtered.reduce((s,e)=>s+e.price,0),[filtered]);
  const weekly=useMemo(()=>{const w: Record<string, number> = {};filtered.forEach(e=>{const m=getMon(e.date);w[m]=(w[m]||0)+e.price;});return Object.entries(w).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>({label:`Wk ${k}`,value:v}));},[filtered]);
  const monthly=useMemo(()=>{const m: Record<string, number>={};expenses.forEach(e=>{const k=e.date.slice(0,7);m[k]=(m[k]||0)+e.price;});return Object.entries(m).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>{const[y,mo]=k.split("-");return{label:new Date(Number(y),Number(mo)-1).toLocaleString("default",{month:"short",year:"2-digit"}),value:v};});},[expenses]);
  const topByCat=CATEGORIES.map(c=>{const items=filtered.filter(e=>e.category===c);if(!items.length) return{label:c,value:0,item:"—"};const top=items.reduce((a,b)=>b.price>a.price?b:a);return{label:c,value:top.price,item:top.item};});

  const drillItems = useMemo(()=>{
    if(!drilldown) return [];
    const base = expenses.filter(e=>(fMonth==="All"||e.date.startsWith(fMonth)));
    return drilldown==="All" ? base : base.filter(e=>e.category===drilldown);
  },[drilldown,expenses,fMonth]);

  const openDrilldown = (cat: Category | "All") => { setDrilldown(cat); setTimeout(()=>document.getElementById("drilldown-panel")?.scrollIntoView({behavior:"smooth",block:"start"}),50); };

  const submit=()=>{
    if(!form.item.trim()) return setErr("Please enter an item name.");
    const price = parseFloat(form.price);
    if(isNaN(price) || price <= 0) return setErr("Please enter a valid price.");
    if(!form.date) return setErr("Please select a date.");
    setErr("");
    const newEntry = {...form, price: price };
    if(editId!==null){setExpenses(p=>p.map(e=>e.id===editId ? { ...e, ...newEntry } : e));setEditId(null);}
    else setExpenses(p=>[...p,{...newEntry, id:Date.now() }]);
    setForm(emptyForm); setOk(true); setTimeout(()=>setOk(false),2500);
  };
  const doEdit=(e: Transaction)=>{setForm({...e,price:String(e.price)});setEditId(e.id);setTab("add");};
  const doDelete=(id: number)=>setExpenses(p=>p.filter(e=>e.id!==id));
  const exportCSV=()=>{
    const h=["Date","Item","Category","Price (SGD)","Paid By","Notes"];
    const rows=sorted.map(e=>[e.date,e.item,e.category,e.price.toFixed(2),e.paidBy,e.notes||""]);
    const csv=[h,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`expenses_${fMonth||"all"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const inp: CSSProperties ={width:"100%",padding:"10px 14px",border:"1.5px solid #e0e0e0",borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",background:"#fafafa",color:"#333"};
  const lbl: CSSProperties ={fontSize:12,fontWeight:600,color:"#555",marginBottom:4,display:"block"};
  const btn=(v: "primary" | "danger" | "success" | "secondary"): CSSProperties =>({padding:"11px 20px",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,background:v==="primary"?"#4F46E5":v==="danger"?"#FF6B6B":v==="success"?"#10B981":"#f0f0f0",color:v==="secondary"?"#555":"#fff"});
  const card: CSSProperties ={background:"#fff",borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:16};
  
  const monthLabel = fMonth==="All" ? "All Time" : new Date(fMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:900,margin:"0 auto",background:"#f7f8fc",minHeight:"100vh",padding:16}}>
      <div style={{...card,background:"linear-gradient(135deg,#4F46E5,#7C3AED)",color:"#fff",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:22,fontWeight:800}}>💰 Couple Expense Tracker</div><div style={{fontSize:13,opacity:.75,marginTop:2}}>Stay on top of your finances together</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,opacity:.65}}>All-time spending</div><div style={{fontSize:22,fontWeight:800}}>{fmt(expenses.reduce((s,e)=>s+e.price,0))}</div></div>
        </div>
      </div>
      <div style={{display:"flex",background:"#fff",borderRadius:12,padding:6,gap:4,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        {[["dashboard","📊 Dashboard"],["add","➕ Add"],["records","📋 Records"],["insights","💡 Insights"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);if(id!=="dashboard")setDrilldown(null);}} style={{flex:1,padding:"10px 6px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,background:tab===id?"#4F46E5":"transparent",color:tab===id?"#fff":"#777"}}>{label}</button>
        ))}
      </div>

      {tab==="dashboard"&&<div>
        <div style={{...card,padding:"14px 20px"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <div><label style={lbl}>Month</label><select style={inp} value={fMonth} onChange={e=>{setFMonth(e.target.value);setDrilldown(null);}}><option value="All">All Time</option>{allMonths.map(m=><option key={m} value={m}>{new Date(m + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}</select></div>
            <div><label style={lbl}>Category</label><select style={inp} value={fCat} onChange={e=>{setFCat(e.target.value as Category | "All");setDrilldown(null);}}><option value="All">All Categories</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div onClick={()=>openDrilldown("All")}
            style={{background:"linear-gradient(135deg,#4F46E5,#6366F1)",borderRadius:14,padding:"16px 20px",color:"#fff",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s",boxShadow:drilldown==="All"?"0 0 0 3px #fff,0 0 0 5px #4F46E5":"none"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.02)";e.currentTarget.style.boxShadow="0 6px 20px rgba(79,70,229,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=drilldown==="All"?"0 0 0 3px #fff,0 0 0 5px #4F46E5":"none";}}>
            <div style={{fontSize:12,opacity:.8}}>Total Spent ({monthLabel})</div>
            <div style={{fontSize:24,fontWeight:800}}>{fmt(total)}</div>
            <div style={{fontSize:11,opacity:.7}}>{filtered.length} transactions · tap to view all ›</div>
          </div>
          <div style={{background:"linear-gradient(135deg,#D97706,#F59E0B)",borderRadius:14,padding:"16px 20px",color:"#fff"}}>
            <div style={{fontSize:12,opacity:.8}}>Highest Transaction</div>
            <div style={{fontSize:24,fontWeight:800}}>{filtered.length?fmt(Math.max(...filtered.map(e=>e.price))):"S$0.00"}</div>
            <div style={{fontSize:11,opacity:.7}}>{filtered.length?filtered.reduce((a,b)=>b.price>a.price?b:a,filtered[0]).item:"—"}</div>
          </div>
        </div>

        <div style={card}>
          <div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:14}}>🏆 Highest Transaction by Category</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topByCat.filter(c=>c.value>0).map(c=>(
              <div key={c.label} onClick={()=>openDrilldown(c.label as Category)}
                style={{display:"flex",alignItems:"center",background:"#fafafa",borderRadius:10,padding:"10px 14px",gap:10,border:`1px solid ${drilldown===c.label?CATEGORY_COLORS[c.label as Category]+"88":"#f0f0f0"}`,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#f0f4ff";e.currentTarget.style.borderColor=CATEGORY_COLORS[c.label as Category]+"66";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor=drilldown===c.label?CATEGORY_COLORS[c.label as Category]+"88":"#f0f0f0";}}>
                <div style={{width:32,height:32,borderRadius:8,background:CATEGORY_COLORS[c.label as Category]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{CATEGORY_ICONS[c.label as Category]}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#333"}}>{c.label}</div><div style={{fontSize:11,color:"#888",marginTop:1}}>{c.item}</div></div>
                <div style={{fontWeight:800,color:CATEGORY_COLORS[c.label as Category],fontSize:15}}>{fmt(c.value)}</div>
                <span style={{color:"#aaa",fontSize:13}}>›</span>
              </div>
            ))}
            {topByCat.every(c=>c.value===0)&&<div style={{textAlign:"center",color:"#aaa",padding:16}}>No data for selected filters</div>}
          </div>
        </div>

        <div style={card}>
          <div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:6}}>🥧 Spending by Category</div>
          <div style={{fontSize:12,color:"#aaa",marginBottom:12}}>Click a slice or label to drill down</div>
          <ClickableDonut data={catTotals} onClickSlice={openDrilldown}/>
        </div>

        <div style={card}>
          <div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:6}}>📊 Category Breakdown</div>
          <div style={{fontSize:12,color:"#aaa",marginBottom:12}}>Click a bar to drill down</div>
          <ClickableBar data={catTotals} colorMap={CATEGORY_COLORS} onClickBar={(label) => openDrilldown(label as Category)}/>
        </div>

        {drilldown&&(
          <div id="drilldown-panel">
            <DrilldownPanel
              title={drilldown==="All"?`All Transactions · ${monthLabel}`:`${CATEGORY_ICONS[drilldown as Category]||""} ${drilldown} · ${monthLabel}`}
              color={drilldown==="All"?"#4F46E5":CATEGORY_COLORS[drilldown as Category]||"#4F46E5"}
              icon={drilldown==="All"?"📋":CATEGORY_ICONS[drilldown as Category]||"📦"}
              items={drillItems}
              onClose={()=>setDrilldown(null)}
              onEdit={(e)=>doEdit(e)}
              onDelete={(id)=>doDelete(id)}
            />
          </div>
        )}
      </div>}

      {tab==="add"&&<div style={card}>
        <div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:14}}>{editId!==null?"✏️ Edit Expense":"➕ Add New Expense"}</div>
        {ok&&<div style={{background:"#D1FAE5",color:"#065F46",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,fontWeight:600}}>✅ Expense {editId!==null?"updated":"added"} successfully!</div>}
        {err&&<div style={{background:"#FEE2E2",color:"#991B1B",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13}}>⚠️ {err}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1 / -1"}}><label style={lbl}>Item / Description *</label><input style={inp} placeholder="e.g. Chicken Rice at Maxwell" value={form.item} onChange={e=>setForm({...form,item:e.target.value})}/></div>
          <div><label style={lbl}>Price (SGD) *</label><input style={inp} type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
          <div><label style={lbl}>Date *</label><input style={inp} type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label style={lbl}>Category *</label><select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})}>{CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}</select></div>
          <div><label style={lbl}>Paid By</label><select style={inp} value={form.paidBy} onChange={e=>setForm({...form,paidBy:e.target.value as "Me" | "Fiancée" | "Shared"})}><option value="Me">Me</option><option value="Fiancée">Fiancée</option><option value="Shared">Shared</option></select></div>
          <div style={{gridColumn:"1 / -1"}}><label style={lbl}>Notes (optional)</label><input style={inp} placeholder="Any extra details..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button style={btn("primary")} onClick={submit}>{editId!==null?"💾 Update":"💾 Save Expense"}</button>
          {editId!==null&&<button style={btn("secondary")} onClick={()=>{setEditId(null);setForm(emptyForm);}}>Cancel</button>}
        </div>
      </div>}

      {tab==="records"&&<div>
        <div style={{...card,padding:"14px 20px"}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:130}}><label style={lbl}>Search</label><input style={inp} placeholder="Search item..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div><label style={lbl}>Month</label><select style={inp} value={fMonth} onChange={e=>setFMonth(e.target.value)}><option value="All">All Time</option>{allMonths.map(m=><option key={m} value={m}>{new Date(m + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}</select></div>
            <div><label style={lbl}>Category</label><select style={inp} value={fCat} onChange={e=>setFCat(e.target.value as Category | "All")}><option value="All">All</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>Sort</label><select style={inp} value={sort} onChange={e=>setSort(e.target.value)}><option value="date-desc">Date ↓</option><option value="date-asc">Date ↑</option><option value="price-desc">Price ↓</option><option value="price-asc">Price ↑</option></select></div>
            <button style={btn("success")} onClick={exportCSV}>⬇️ Export CSV</button>
          </div>
        </div>
        <div style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontWeight:700,color:"#555",fontSize:13}}>{sorted.length} records</span>
            <span style={{fontWeight:800,color:"#4F46E5",fontSize:15}}>{fmt(total)}</span>
          </div>
          <TransactionList items={sorted} onEdit={doEdit} onDelete={doDelete}/>
        </div>
      </div>}

      {tab==="insights"&&<div>
        <div style={{...card,padding:"12px 20px"}}>
          <div style={{display:"flex",gap:8}}>
            <button style={btn(view==="monthly"?"primary":"secondary")} onClick={()=>setView("monthly")}>Monthly View</button>
            <button style={btn(view==="weekly"?"primary":"secondary")} onClick={()=>setView("weekly")}>Weekly View</button>
          </div>
        </div>
        {view==="monthly"&&<div style={card}><div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:14}}>📅 Monthly Spending Trend</div>
          <ClickableBar data={monthly} onClickBar={(label) => setFMonth(allMonths.find(m => m.endsWith(label.split(' ')[0].toLowerCase())) || 'All')}/>
        </div>}
        {view==="weekly"&&<div>
          <div style={{...card,padding:"14px 20px"}}><label style={lbl}>Filter Month</label><select style={inp} value={fMonth} onChange={e=>setFMonth(e.target.value)}><option value="All">All Time</option>{allMonths.map(m=><option key={m} value={m}>{new Date(m + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}</select></div>
          <div style={card}><div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:14}}>📆 Weekly Breakdown</div><ClickableBar data={weekly} onClickBar={() => {}}/></div>
        </div>}
        <div style={card}>
          <div style={{fontSize:15,fontWeight:700,color:"#333",marginBottom:14}}>🗂️ Category × Month Matrix</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr>
                <th style={{textAlign:"left",padding:"8px 10px",color:"#555",fontWeight:700,background:"#f7f8fc"}}>Category</th>
                {allMonths.map(m=><th key={m} style={{padding:"8px 10px",color:"#555",fontWeight:700,background:"#f7f8fc",textAlign:"right"}}>{new Date(m + '-02').toLocaleString('default', { month: 'short', year: '2-digit' })}</th>)}
                <th style={{padding:"8px 10px",color:"#4F46E5",fontWeight:700,background:"#EEF2FF",textAlign:"right"}}>Total</th>
              </tr></thead>
              <tbody>
                {CATEGORIES.map(cat=>{
                  const rowT=expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.price,0);
                  return(<tr key={cat} style={{borderBottom:"1px solid #f0f0f0"}}>
                    <td style={{padding:"10px",fontWeight:600,color:"#333"}}>{CATEGORY_ICONS[cat]} {cat}</td>
                    {allMonths.map(m=>{const v=expenses.filter(e=>e.category===cat&&e.date.startsWith(m)).reduce((s,e)=>s+e.price,0);return<td key={m} style={{padding:"10px",textAlign:"right",color:v>0?"#333":"#ccc"}}>{v>0?fmt(v):"—"}</td>;})}
                    <td style={{padding:"10px",textAlign:"right",fontWeight:700,color:"#4F46E5",background:"#EEF2FF"}}>{fmt(rowT)}</td>
                  </tr>);
                })}
                <tr style={{background:"#f7f8fc",borderTop:"2px solid #e0e0e0"}}>
                  <td style={{padding:"10px",fontWeight:800,color:"#333"}}>Total</td>
                  {allMonths.map(m=>{const v=expenses.filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+e.price,0);return<td key={m} style={{padding:"10px",textAlign:"right",fontWeight:700}}>{v>0?fmt(v):'S$0.00'}</td>;})}
                  <td style={{padding:"10px",textAlign:"right",fontWeight:800,color:"#4F46E5",background:"#EEF2FF"}}>{fmt(expenses.reduce((s,e)=>s+e.price,0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>}
    </div>
  );
}

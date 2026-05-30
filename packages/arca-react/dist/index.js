"use strict";"use client";var _=Object.defineProperty;var sr=Object.getOwnPropertyDescriptor;var lr=Object.getOwnPropertyNames;var dr=Object.prototype.hasOwnProperty;var pr=(e,a)=>{for(var c in a)_(e,c,{get:a[c],enumerable:!0})},gr=(e,a,c,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let i of lr(a))!dr.call(e,i)&&i!==c&&_(e,i,{get:()=>a[i],enumerable:!(o=sr(a,i))||o.enumerable});return e};var br=e=>gr(_({},"__esModule",{value:!0}),e);var ur={};pr(ur,{ArcaClient:()=>U,ArcaPricingTable:()=>tr,ArcaProvider:()=>Z,createArcaClient:()=>or,useArca:()=>I,useArcaPerks:()=>ar});module.exports=br(ur);var R=require("react");var E="https://api-arca.vercel.app";var J=require("react/jsx-runtime"),G=(0,R.createContext)(null),Z=({apiKey:e,children:a})=>{let c=(0,R.useMemo)(()=>({apiKey:e,portalUrl:E,isConfigured:!!e}),[e]);return(0,J.jsx)(G.Provider,{value:c,children:a})},$=()=>{let e=(0,R.useContext)(G);if(!e)throw new Error("Arca components must be used within a ArcaProvider");return e};var k=require("react"),x=require("lucide-react");var z=require("react");var I=(e,a)=>{let{apiKey:c,portalUrl:o}=$(),[i,u]=(0,z.useState)({status:"NONE",remainingSeconds:0,tierIds:[],loading:!!a,error:null});return(0,z.useEffect)(()=>{if(!e||!a)return;(async()=>{try{u(m=>({...m,loading:!0,error:null}));let f=new URL(`${o}/api/sdk/plan/${e}`);f.searchParams.set("userId",a);let l=await fetch(f.toString(),{headers:{"x-api-key":c}}),n=await l.json();if(!l.ok)throw new Error(n.error||"Failed to fetch subscription status");if(n.subscription){let m=n.subscription.tierId,h=n.subscription.tierIds||(m?[m]:[]);u({status:n.subscription.status,remainingSeconds:n.subscription.remainingSeconds,tierId:m,tierIds:h,loading:!1,error:null})}else u(m=>({...m,status:"NONE",tierIds:[],loading:!1}))}catch(f){let l=f instanceof Error?f.message:"Unknown error";u(n=>({...n,loading:!1,error:l}))}})()},[e,a,c,o]),(0,z.useEffect)(()=>{if(i.remainingSeconds<=0||i.status!=="ACTIVE")return;let A=setInterval(()=>{u(f=>{let l=Math.max(f.remainingSeconds-1,0);return{...f,remainingSeconds:l,status:l<=0?"EXPIRED":"ACTIVE",tierIds:l<=0?[]:f.tierIds}})},1e3);return()=>clearInterval(A)},[i.remainingSeconds,i.status]),i};var Q=require("clsx"),Y=require("tailwind-merge");function b(...e){return(0,Y.twMerge)((0,Q.clsx)(e))}function rr(e){return(Number(e)/1e6).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function er(e){let a=Number(e),c=Math.floor(a/86400);if(c>=1)return`${c} day${c!==1?"s":""}`;let o=Math.floor(a/3600);return o>=1?`${o}h`:`${Math.max(Math.floor(a/60),1)}m`}function F(e){let a=Math.floor(e/86400),c=Math.floor(e%86400/3600),o=Math.floor(e%3600/60),i=e%60;return a>0?`${a}d ${c}h ${o}m`:`${c}h ${o}m ${i}s`}var r=require("react/jsx-runtime"),tr=({planId:e,userId:a,redirectUrl:c,appearance:o,className:i,style:u,hideBranding:A=!1,recommendedTierId:f,customLabels:l,classNames:n,renderHeader:m,renderFooter:h,renderTierButton:v})=>{let{apiKey:B,portalUrl:N}=$(),[C,ir]=(0,k.useState)(null),[nr,H]=(0,k.useState)(!0),[D,O]=(0,k.useState)(null),S=I(e,a),d=(o?.theme||"dark")==="dark",t={primary:o?.variables?.colorPrimary||(d?"#ffffff":"#000000"),error:o?.variables?.colorError||"#ef4444",background:o?.variables?.backgroundColor||(d?"#0a0a0a":"#ffffff"),text:o?.variables?.textColor||(d?"#ffffff":"#000000"),muted:d?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",border:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",cardBg:d?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",radius:o?.variables?.borderRadius||"4px",font:o?.variables?.fontFamily||"Inter, sans-serif",padding:o?.variables?.cardPadding||"40px",gap:o?.variables?.gap||"24px",hoverBorder:d?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.18)",activeBorder:d?"#ffffff":"#000000",recommendedBorder:d?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",btnText:d?"#09090b":"#ffffff",btnHoverBg:d?"#e4e4e7":"#27272a",btnActiveBorder:d?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)",btnActiveText:d?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)",badgeBgRec:d?"#18181b":"#f4f4f5",badgeBorderRec:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",badgeTextRec:d?"#f4f4f5":"#18181b",badgeBgActive:d?"#ffffff":"#000000",badgeTextActive:d?"#09090b":"#ffffff",skeletonBg:d?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",errorBg:d?"#09090b":"#fbfbfb"};(0,k.useEffect)(()=>{if(!e)return;(async()=>{try{H(!0),O(null);let g=`${N}/api/sdk/plan/${e}`,y=await fetch(g,{headers:{"x-api-key":B}}),s=await y.json();if(!y.ok)throw{message:s.error||"Plan load failed",code:y.status.toString()};ir(s.plan)}catch(g){let y=g instanceof Error?g.message:"Unknown error",s=g&&typeof g=="object"&&"code"in g&&typeof g.code=="string"?g.code:"FETCH_ERROR";O({message:y,code:s})}finally{H(!1)}})()},[e,B,N]);let j=p=>{let g=encodeURIComponent(c||window.location.href),y=`${N}/pay/${e}?userId=${a||""}&redirectUrl=${g}&apiKey=${B||""}`;window.location.href=y},P=S.status==="ACTIVE"&&S.remainingSeconds>0,K=(0,k.useMemo)(()=>{if(!P||!C)return 0;let p=C.tiers.filter(g=>S.tierIds.includes(g.id));return p.length>0?Math.max(...p.map(g=>Number(g.price))):0},[P,C,S.tierIds]),L=`
    .arca-container-cls {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .arca-grid-cls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--arca-gap);
      justify-content: center;
      padding: 20px 0;
      box-sizing: border-box;
    }
    .arca-card-cls {
      flex: 1 1 320px;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      background-color: var(--arca-card-bg);
      border: 1px solid var(--arca-border-color);
      border-radius: var(--arca-radius);
      padding: var(--arca-padding);
      position: relative;
      box-sizing: border-box;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .arca-card-cls:hover {
      border-color: var(--arca-hover-border);
    }
    .arca-card-rec-cls {
      border-color: var(--arca-rec-border);
    }
    .arca-card-active-cls {
      border-color: var(--arca-active-border);
    }
    .arca-btn-cls {
      margin-top: 32px;
      width: 100%;
      height: 48px;
      border-radius: var(--arca-radius);
      border: none;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      box-sizing: border-box;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .arca-btn-active-cls {
      background-color: transparent;
      color: var(--arca-btn-active-text);
      cursor: default;
      border: 1px solid var(--arca-btn-active-border);
    }
    .arca-btn-primary-cls {
      background-color: var(--arca-primary);
      color: var(--arca-btn-text-color);
    }
    .arca-btn-primary-cls:hover {
      background-color: var(--arca-btn-hover-bg);
    }
    .arca-btn-disabled-cls {
      background-color: var(--arca-border-color);
      color: var(--arca-muted-text);
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,W={"--arca-primary":t.primary,"--arca-primary-alpha-50":`${t.primary}80`,"--arca-primary-alpha-15":`${t.primary}26`,"--arca-primary-alpha-30":`${t.primary}4d`,"--arca-card-bg":t.cardBg,"--arca-border-color":t.border,"--arca-radius":t.radius,"--arca-padding":t.padding,"--arca-gap":t.gap,"--arca-btn-text-color":t.btnText,"--arca-btn-hover-bg":t.btnHoverBg,"--arca-hover-border":t.hoverBorder,"--arca-active-border":t.activeBorder,"--arca-rec-border":t.recommendedBorder,"--arca-btn-active-border":t.btnActiveBorder,"--arca-btn-active-text":t.btnActiveText,"--arca-badge-bg-rec":t.badgeBgRec,"--arca-badge-border-rec":t.badgeBorderRec,"--arca-badge-text-rec":t.badgeTextRec,"--arca-badge-bg-active":t.badgeBgActive,"--arca-badge-text-active":t.badgeTextActive,"--arca-skeleton-bg":t.skeletonBg,"--arca-error-bg":t.errorBg,"--arca-muted-text":t.muted};return nr?(0,r.jsxs)("div",{className:b("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...W,...u},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:L+`
          @keyframes arca-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .arca-pulse-el {
            animation: arca-pulse 1.8s ease-in-out infinite;
            background-color: var(--arca-skeleton-bg);
            border-radius: var(--arca-radius);
          }
        `}}),!A&&(0,r.jsxs)("div",{style:{textAlign:"center",marginBottom:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[(0,r.jsx)("div",{style:{height:"36px",width:"220px"},className:"arca-pulse-el"}),(0,r.jsx)("div",{style:{height:"18px",width:"340px"},className:"arca-pulse-el"})]}),(0,r.jsx)("div",{style:{maxWidth:"800px",height:"140px",margin:"0 auto",boxSizing:"border-box"},className:"arca-pulse-el"})]}):D?(0,r.jsxs)("div",{className:b("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...W,...u},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:L}}),(0,r.jsxs)("div",{style:{padding:"40px var(--arca-padding)",border:"1px solid var(--arca-border-color)",borderRadius:"var(--arca-radius)",textAlign:"center",maxWidth:"440px",margin:"80px auto",backgroundColor:"var(--arca-error-bg)",boxSizing:"border-box"},children:[(0,r.jsx)("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"50%",backgroundColor:`${t.error}15`,color:t.error,marginBottom:"16px"},children:(0,r.jsx)(x.AlertCircle,{size:20})}),(0,r.jsx)("p",{style:{fontSize:"11px",fontWeight:800,color:t.error,textTransform:"uppercase",letterSpacing:"1.5px",margin:0},children:D.code||"Failed to Load"}),(0,r.jsx)("p",{style:{fontSize:"13px",color:t.muted,marginTop:"8px",fontWeight:500,lineHeight:1.6,margin:"8px 0 0 0"},children:D.message}),(0,r.jsx)("button",{onClick:()=>window.location.reload(),className:"arca-btn-cls arca-btn-primary-cls",style:{marginTop:"24px",height:"40px"},children:"Retry Connection"})]})]}):(0,r.jsxs)("div",{className:b("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...W,...u},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:L}}),m?m(C||{id:e,name:"",duration:"",tiers:[]},S):!A&&(0,r.jsxs)("div",{style:{textAlign:"center",marginBottom:"60px"},children:[P&&(0,r.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"#18181b",border:"1px solid #27272a",color:"#f4f4f5",padding:"4px 10px",borderRadius:"4px",fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"24px"},children:[(0,r.jsx)(x.Check,{size:11,style:{strokeWidth:3}}),l?.subscriptionActiveHeader?l.subscriptionActiveHeader.replace("{{countdown}}",F(S.remainingSeconds)):`Subscription Active \xB7 ${F(S.remainingSeconds)} Left`]}),(0,r.jsx)("h2",{style:{fontSize:"48px",fontWeight:900,letterSpacing:"-0.04em",marginBottom:"16px",color:t.text,...o?.elements?.tierLabel},className:n?.tierLabel,children:C?.name}),(0,r.jsx)("p",{style:{color:t.muted,fontSize:"15px",fontWeight:500},children:l?.selectPlanDescription||"Select a membership tier to access the protocol."})]}),(0,r.jsx)("div",{className:b("arca-grid-cls",n?.grid),children:C?.tiers.map((p,g)=>{let y=f?p.id===f:g===1,s=P&&S.tierIds.includes(p.id),V=Number(p.price),X=P&&!s&&V>K,q=P&&!s&&V<K,w=`Get ${p.label}`;return s?w=l?.activeSubscription||"Current Plan":P?X?w=l?.upgrade||"Upgrade":q?w=l?.downgrade||"Downgrade":w=l?.changePlan||"Switch Plan":l?.getTier&&(w=l.getTier.replace("{{tierLabel}}",p.label)),(0,r.jsxs)("div",{className:b("arca-card-cls",s&&"arca-card-active-cls",!s&&y&&"arca-card-rec-cls",n?.card),style:{border:s?"1px solid var(--arca-active-border)":y?"1px solid var(--arca-rec-border)":"1px solid var(--arca-border-color)",...o?.elements?.card},children:[s&&(0,r.jsxs)("div",{className:b(n?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-active)",color:"var(--arca-badge-text-active)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:"4px",border:"1px solid var(--arca-badge-bg-active)"},children:[(0,r.jsx)(x.Check,{size:10,style:{strokeWidth:3}}),"Current Plan"]}),!s&&y&&(0,r.jsx)("div",{className:b(n?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-rec)",color:"var(--arca-badge-text-rec)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",border:"1px solid var(--arca-badge-border-rec)"},children:"Recommended"}),(0,r.jsxs)("div",{style:{flex:1},children:[(0,r.jsx)("h3",{className:b(n?.tierLabel),style:{fontSize:"24px",fontWeight:900,marginBottom:"8px",...o?.elements?.tierLabel},children:p.label}),(0,r.jsxs)("div",{className:b(n?.priceContainer),style:{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"32px",...o?.elements?.price},children:[(0,r.jsxs)("span",{className:b(n?.priceAmount),style:{fontSize:"40px",fontWeight:900},children:["$",rr(p.price)]}),(0,r.jsxs)("span",{className:b(n?.priceMuted),style:{fontSize:"14px",color:t.muted,fontWeight:700},children:["/ ",er(C?.duration||"0")]})]}),(0,r.jsx)("div",{className:b(n?.featuresList),style:{borderTop:"1px solid var(--arca-border-color)",paddingTop:"24px"},children:p.features.map((M,cr)=>(0,r.jsxs)("div",{className:b("arca-feat-item",n?.featureItem),style:{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"flex-start"},children:[(0,r.jsx)("div",{style:{marginTop:"4px",flexShrink:0},children:(0,r.jsx)(x.Check,{size:12,style:{color:s?"var(--arca-active-border)":"var(--arca-muted-text)"}})}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:b(n?.featureTitle),style:{fontSize:"13.5px",fontWeight:700,margin:0,lineHeight:"1.4"},children:M.title}),M.description&&(0,r.jsx)("p",{className:b(n?.featureDescription),style:{fontSize:"11.5px",color:t.muted,marginTop:"2px",lineHeight:"1.4",margin:0},children:M.description})]})]},cr))})]}),v?v(p,{isActive:P,isCurrent:s,isDisabled:s,isUpgrade:X,isDowngrade:q,label:w},()=>j(p.id)):(0,r.jsxs)("button",{onClick:()=>!s&&j(p.id),disabled:s,className:b("arca-btn-cls",s?"arca-btn-active-cls":"arca-btn-primary-cls",n?.button),style:{backgroundColor:s?"transparent":"var(--arca-primary)",color:s?"var(--arca-btn-active-text)":"var(--arca-btn-text-color)",border:s?"1px solid var(--arca-btn-active-border)":"none",...o?.elements?.button},children:[w,!s&&(0,r.jsx)(x.ArrowRight,{size:13,style:{strokeWidth:2.5}}),s&&(0,r.jsx)(x.Check,{size:13,style:{strokeWidth:3}})]})]},p.id)})}),h?h():!A&&(0,r.jsxs)("div",{style:{marginTop:"60px",textAlign:"center",opacity:.35,display:"flex",justifyContent:"center",gap:"20px",alignItems:"center"},children:[(0,r.jsx)("p",{style:{fontSize:"10px",fontWeight:900,textTransform:"uppercase",letterSpacing:"2px",margin:0},children:"Powered by Arca Pay"}),(0,r.jsx)(x.Lock,{size:11}),(0,r.jsx)(x.Zap,{size:11})]})]})};var T=require("react");var ar=(e,a)=>{let{apiKey:c,portalUrl:o}=$(),i=I(e,a),[u,A]=(0,T.useState)(null),[f,l]=(0,T.useState)(!0);return(0,T.useEffect)(()=>{if(!e)return;(async()=>{try{l(!0);let h=`${o}/api/sdk/plan/${e}`,v=await fetch(h,{headers:{"x-api-key":c}}),B=await v.json();v.ok&&A(B.plan)}catch(h){console.error("Failed to fetch plan in useArcaPerks",h)}finally{l(!1)}})()},[e,c,o]),{perks:(0,T.useMemo)(()=>{if(i.loading||f)return;if(i.status!=="ACTIVE"||i.tierIds.length===0||!u)return null;let m=new Date(Date.now()+i.remainingSeconds*1e3);return u.tiers.filter(v=>i.tierIds.includes(v.id)).map(v=>({tierId:v.id,tierName:v.label,features:v.features,expiryDate:m}))},[i.loading,i.status,i.tierIds,i.remainingSeconds,u,f]),loading:i.loading||f,error:i.error}};var U=class{apiKey;baseUrl;constructor(a,c){this.apiKey=a,this.baseUrl=(c?.baseUrl||E).replace(/\/$/,"")}async getSubscriptionStatus(a,c){if(!a)throw new Error("planId is required");if(!c)throw new Error("userId is required");let o=new URL(`${this.baseUrl}/api/sdk/plan/${a}`);o.searchParams.set("userId",c);let i=await fetch(o.toString(),{headers:{"x-api-key":this.apiKey}}),u=await i.json();if(!i.ok)throw new Error(u?.error||"Failed to fetch subscription status");return u?.subscription||{status:"NONE",remainingSeconds:0,tierIds:[]}}};function or(e,a){return new U(e,a)}0&&(module.exports={ArcaClient,ArcaPricingTable,ArcaProvider,createArcaClient,useArca,useArcaPerks});

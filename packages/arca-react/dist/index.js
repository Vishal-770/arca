"use strict";"use client";var D=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var J=Object.getOwnPropertyNames;var Q=Object.prototype.hasOwnProperty;var Y=(e,o)=>{for(var c in o)D(e,c,{get:o[c],enumerable:!0})},rr=(e,o,c,a)=>{if(o&&typeof o=="object"||typeof o=="function")for(let i of J(o))!Q.call(e,i)&&i!==c&&D(e,i,{get:()=>o[i],enumerable:!(a=q(o,i))||a.enumerable});return e};var er=e=>rr(D({},"__esModule",{value:!0}),e);var sr={};Y(sr,{ArcaPricingTable:()=>or,ArcaProvider:()=>tr,useArca:()=>E,useArcaPerks:()=>nr});module.exports=er(sr);var g=require("react"),v=require("lucide-react"),_=require("clsx"),K=require("tailwind-merge"),r=require("react/jsx-runtime");function f(...e){return(0,K.twMerge)((0,_.clsx)(e))}var O=(0,g.createContext)(null),tr=({apiKey:e,children:o})=>{let c="https://arca-pay.vercel.app",a=(0,g.useMemo)(()=>({apiKey:e,portalUrl:c,isConfigured:!!e}),[e]);return(0,r.jsx)(O.Provider,{value:a,children:o})},N=()=>{let e=(0,g.useContext)(O);if(!e)throw new Error("Arca components must be used within a ArcaProvider");return e},E=(e,o)=>{let{apiKey:c,portalUrl:a}=N(),[i,x]=(0,g.useState)({status:"NONE",remainingSeconds:0,tierIds:[],loading:!!o,error:null});return(0,g.useEffect)(()=>{if(!e||!o)return;(async()=>{try{x(m=>({...m,loading:!0,error:null}));let u=new URL(`${a}/api/sdk/plan/${e}`);u.searchParams.set("userId",o);let l=await fetch(u.toString(),{headers:{"x-api-key":c}}),n=await l.json();if(!l.ok)throw new Error(n.error||"Failed to fetch subscription status");if(n.subscription){let m=n.subscription.tierId,S=n.subscription.tierIds||(m?[m]:[]);x({status:n.subscription.status,remainingSeconds:n.subscription.remainingSeconds,tierId:m,tierIds:S,loading:!1,error:null})}else x(m=>({...m,status:"NONE",tierIds:[],loading:!1}))}catch(u){let l=u instanceof Error?u.message:"Unknown error";x(n=>({...n,loading:!1,error:l}))}})()},[e,o,c,a]),(0,g.useEffect)(()=>{if(i.remainingSeconds<=0||i.status!=="ACTIVE")return;let A=setInterval(()=>{x(u=>{let l=Math.max(u.remainingSeconds-1,0);return{...u,remainingSeconds:l,status:l<=0?"EXPIRED":"ACTIVE",tierIds:l<=0?[]:u.tierIds}})},1e3);return()=>clearInterval(A)},[i.remainingSeconds,i.status]),i};function ar(e){return(Number(e)/1e6).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function ir(e){let o=Number(e),c=Math.floor(o/86400);if(c>=1)return`${c} day${c!==1?"s":""}`;let a=Math.floor(o/3600);return a>=1?`${a}h`:`${Math.max(Math.floor(o/60),1)}m`}function j(e){let o=Math.floor(e/86400),c=Math.floor(e%86400/3600),a=Math.floor(e%3600/60),i=e%60;return o>0?`${o}d ${c}h ${a}m`:`${c}h ${a}m ${i}s`}var or=({planId:e,userId:o,redirectUrl:c,appearance:a,className:i,style:x,hideBranding:A=!1,recommendedTierId:u,customLabels:l,classNames:n,renderHeader:m,renderFooter:S,renderTierButton:h})=>{let{apiKey:w,portalUrl:R}=N(),[P,X]=(0,g.useState)(null),[G,W]=(0,g.useState)(!0),[I,U]=(0,g.useState)(null),k=E(e,o),d=(a?.theme||"dark")==="dark",t={primary:a?.variables?.colorPrimary||(d?"#ffffff":"#000000"),error:a?.variables?.colorError||"#ef4444",background:a?.variables?.backgroundColor||(d?"#0a0a0a":"#ffffff"),text:a?.variables?.textColor||(d?"#ffffff":"#000000"),muted:d?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",border:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",cardBg:d?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",radius:a?.variables?.borderRadius||"4px",font:a?.variables?.fontFamily||"Inter, sans-serif",padding:a?.variables?.cardPadding||"40px",gap:a?.variables?.gap||"24px",hoverBorder:d?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.18)",activeBorder:d?"#ffffff":"#000000",recommendedBorder:d?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",btnText:d?"#09090b":"#ffffff",btnHoverBg:d?"#e4e4e7":"#27272a",btnActiveBorder:d?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)",btnActiveText:d?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)",badgeBgRec:d?"#18181b":"#f4f4f5",badgeBorderRec:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",badgeTextRec:d?"#f4f4f5":"#18181b",badgeBgActive:d?"#ffffff":"#000000",badgeTextActive:d?"#09090b":"#ffffff",skeletonBg:d?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",errorBg:d?"#09090b":"#fbfbfb"};(0,g.useEffect)(()=>{if(!e)return;(async()=>{try{W(!0),U(null);let b=`${R}/api/sdk/plan/${e}`,y=await fetch(b,{headers:{"x-api-key":w}}),s=await y.json();if(!y.ok)throw{message:s.error||"Plan load failed",code:y.status.toString()};X(s.plan)}catch(b){let y=b instanceof Error?b.message:"Unknown error",s=b&&typeof b=="object"&&"code"in b&&typeof b.code=="string"?b.code:"FETCH_ERROR";U({message:y,code:s})}finally{W(!1)}})()},[e,w,R]);let M=p=>{let b=encodeURIComponent(c||window.location.href),y=`${R}/pay/${e}?userId=${o||""}&redirectUrl=${b}&apiKey=${w||""}`;window.location.href=y},C=k.status==="ACTIVE"&&k.remainingSeconds>0,L=(0,g.useMemo)(()=>{if(!C||!P)return 0;let p=P.tiers.filter(b=>k.tierIds.includes(b.id));return p.length>0?Math.max(...p.map(b=>Number(b.price))):0},[C,P,k.tierIds]),B=`
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
  `,z={"--arca-primary":t.primary,"--arca-primary-alpha-50":`${t.primary}80`,"--arca-primary-alpha-15":`${t.primary}26`,"--arca-primary-alpha-30":`${t.primary}4d`,"--arca-card-bg":t.cardBg,"--arca-border-color":t.border,"--arca-radius":t.radius,"--arca-padding":t.padding,"--arca-gap":t.gap,"--arca-btn-text-color":t.btnText,"--arca-btn-hover-bg":t.btnHoverBg,"--arca-hover-border":t.hoverBorder,"--arca-active-border":t.activeBorder,"--arca-rec-border":t.recommendedBorder,"--arca-btn-active-border":t.btnActiveBorder,"--arca-btn-active-text":t.btnActiveText,"--arca-badge-bg-rec":t.badgeBgRec,"--arca-badge-border-rec":t.badgeBorderRec,"--arca-badge-text-rec":t.badgeTextRec,"--arca-badge-bg-active":t.badgeBgActive,"--arca-badge-text-active":t.badgeTextActive,"--arca-skeleton-bg":t.skeletonBg,"--arca-error-bg":t.errorBg,"--arca-muted-text":t.muted};return G?(0,r.jsxs)("div",{className:f("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...z,...x},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:B+`
          @keyframes arca-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .arca-pulse-el {
            animation: arca-pulse 1.8s ease-in-out infinite;
            background-color: var(--arca-skeleton-bg);
            border-radius: var(--arca-radius);
          }
        `}}),!A&&(0,r.jsxs)("div",{style:{textAlign:"center",marginBottom:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[(0,r.jsx)("div",{style:{height:"36px",width:"220px"},className:"arca-pulse-el"}),(0,r.jsx)("div",{style:{height:"18px",width:"340px"},className:"arca-pulse-el"})]}),(0,r.jsx)("div",{style:{maxWidth:"800px",height:"140px",margin:"0 auto",boxSizing:"border-box"},className:"arca-pulse-el"})]}):I?(0,r.jsxs)("div",{className:f("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...z,...x},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:B}}),(0,r.jsxs)("div",{style:{padding:"40px var(--arca-padding)",border:"1px solid var(--arca-border-color)",borderRadius:"var(--arca-radius)",textAlign:"center",maxWidth:"440px",margin:"80px auto",backgroundColor:"var(--arca-error-bg)",boxSizing:"border-box"},children:[(0,r.jsx)("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"50%",backgroundColor:`${t.error}15`,color:t.error,marginBottom:"16px"},children:(0,r.jsx)(v.AlertCircle,{size:20})}),(0,r.jsx)("p",{style:{fontSize:"11px",fontWeight:800,color:t.error,textTransform:"uppercase",letterSpacing:"1.5px",margin:0},children:I.code||"Failed to Load"}),(0,r.jsx)("p",{style:{fontSize:"13px",color:t.muted,marginTop:"8px",fontWeight:500,lineHeight:1.6,margin:"8px 0 0 0"},children:I.message}),(0,r.jsx)("button",{onClick:()=>window.location.reload(),className:"arca-btn-cls arca-btn-primary-cls",style:{marginTop:"24px",height:"40px"},children:"Retry Connection"})]})]}):(0,r.jsxs)("div",{className:f("arca-container-cls",i,n?.container),style:{fontFamily:t.font,color:t.text,...z,...x},children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:B}}),m?m(P||{id:e,name:"",duration:"",tiers:[]},k):!A&&(0,r.jsxs)("div",{style:{textAlign:"center",marginBottom:"60px"},children:[C&&(0,r.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"#18181b",border:"1px solid #27272a",color:"#f4f4f5",padding:"4px 10px",borderRadius:"4px",fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"24px"},children:[(0,r.jsx)(v.Check,{size:11,style:{strokeWidth:3}}),l?.subscriptionActiveHeader?l.subscriptionActiveHeader.replace("{{countdown}}",j(k.remainingSeconds)):`Subscription Active \xB7 ${j(k.remainingSeconds)} Left`]}),(0,r.jsx)("h2",{style:{fontSize:"48px",fontWeight:900,letterSpacing:"-0.04em",marginBottom:"16px",color:t.text,...a?.elements?.tierLabel},className:n?.tierLabel,children:P?.name}),(0,r.jsx)("p",{style:{color:t.muted,fontSize:"15px",fontWeight:500},children:l?.selectPlanDescription||"Select a membership tier to access the protocol."})]}),(0,r.jsx)("div",{className:f("arca-grid-cls",n?.grid),children:P?.tiers.map((p,b)=>{let y=u?p.id===u:b===1,s=C&&k.tierIds.includes(p.id),F=Number(p.price),H=C&&!s&&F>L,V=C&&!s&&F<L,T=`Get ${p.label}`;return s?T=l?.activeSubscription||"Current Plan":C?H?T=l?.upgrade||"Upgrade":V?T=l?.downgrade||"Downgrade":T=l?.changePlan||"Switch Plan":l?.getTier&&(T=l.getTier.replace("{{tierLabel}}",p.label)),(0,r.jsxs)("div",{className:f("arca-card-cls",s&&"arca-card-active-cls",!s&&y&&"arca-card-rec-cls",n?.card),style:{border:s?"1px solid var(--arca-active-border)":y?"1px solid var(--arca-rec-border)":"1px solid var(--arca-border-color)",...a?.elements?.card},children:[s&&(0,r.jsxs)("div",{className:f(n?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-active)",color:"var(--arca-badge-text-active)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:"4px",border:"1px solid var(--arca-badge-bg-active)"},children:[(0,r.jsx)(v.Check,{size:10,style:{strokeWidth:3}}),"Current Plan"]}),!s&&y&&(0,r.jsx)("div",{className:f(n?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-rec)",color:"var(--arca-badge-text-rec)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",border:"1px solid var(--arca-badge-border-rec)"},children:"Recommended"}),(0,r.jsxs)("div",{style:{flex:1},children:[(0,r.jsx)("h3",{className:f(n?.tierLabel),style:{fontSize:"24px",fontWeight:900,marginBottom:"8px",...a?.elements?.tierLabel},children:p.label}),(0,r.jsxs)("div",{className:f(n?.priceContainer),style:{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"32px",...a?.elements?.price},children:[(0,r.jsxs)("span",{className:f(n?.priceAmount),style:{fontSize:"40px",fontWeight:900},children:["$",ar(p.price)]}),(0,r.jsxs)("span",{className:f(n?.priceMuted),style:{fontSize:"14px",color:t.muted,fontWeight:700},children:["/ ",ir(P?.duration||"0")]})]}),(0,r.jsx)("div",{className:f(n?.featuresList),style:{borderTop:"1px solid var(--arca-border-color)",paddingTop:"24px"},children:p.features.map(($,Z)=>(0,r.jsxs)("div",{className:f("arca-feat-item",n?.featureItem),style:{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"flex-start"},children:[(0,r.jsx)("div",{style:{marginTop:"4px",flexShrink:0},children:(0,r.jsx)(v.Check,{size:12,style:{color:s?"var(--arca-active-border)":"var(--arca-muted-text)"}})}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:f(n?.featureTitle),style:{fontSize:"13.5px",fontWeight:700,margin:0,lineHeight:"1.4"},children:$.title}),$.description&&(0,r.jsx)("p",{className:f(n?.featureDescription),style:{fontSize:"11.5px",color:t.muted,marginTop:"2px",lineHeight:"1.4",margin:0},children:$.description})]})]},Z))})]}),h?h(p,{isActive:C,isCurrent:s,isDisabled:s,isUpgrade:H,isDowngrade:V,label:T},()=>M(p.id)):(0,r.jsxs)("button",{onClick:()=>!s&&M(p.id),disabled:s,className:f("arca-btn-cls",s?"arca-btn-active-cls":"arca-btn-primary-cls",n?.button),style:{backgroundColor:s?"transparent":"var(--arca-primary)",color:s?"var(--arca-btn-active-text)":"var(--arca-btn-text-color)",border:s?"1px solid var(--arca-btn-active-border)":"none",...a?.elements?.button},children:[T,!s&&(0,r.jsx)(v.ArrowRight,{size:13,style:{strokeWidth:2.5}}),s&&(0,r.jsx)(v.Check,{size:13,style:{strokeWidth:3}})]})]},p.id)})}),S?S():!A&&(0,r.jsxs)("div",{style:{marginTop:"60px",textAlign:"center",opacity:.35,display:"flex",justifyContent:"center",gap:"20px",alignItems:"center"},children:[(0,r.jsx)("p",{style:{fontSize:"10px",fontWeight:900,textTransform:"uppercase",letterSpacing:"2px",margin:0},children:"Powered by Arca Pay"}),(0,r.jsx)(v.Lock,{size:11}),(0,r.jsx)(v.Zap,{size:11})]})]})},nr=(e,o)=>{let{apiKey:c,portalUrl:a}=N(),i=E(e,o),[x,A]=(0,g.useState)(null),[u,l]=(0,g.useState)(!0);return(0,g.useEffect)(()=>{if(!e)return;(async()=>{try{l(!0);let S=`${a}/api/sdk/plan/${e}`,h=await fetch(S,{headers:{"x-api-key":c}}),w=await h.json();h.ok&&A(w.plan)}catch(S){console.error("Failed to fetch plan in useArcaPerks",S)}finally{l(!1)}})()},[e,c,a]),{perks:(0,g.useMemo)(()=>{if(i.loading||u)return;if(i.status!=="ACTIVE"||i.tierIds.length===0||!x)return null;let m=new Date(Date.now()+i.remainingSeconds*1e3);return x.tiers.filter(h=>i.tierIds.includes(h.id)).map(h=>({tierId:h.id,tierName:h.label,features:h.features,expiryDate:m}))},[i.loading,i.status,i.tierIds,i.remainingSeconds,x,u]),loading:i.loading||u,error:i.error}};0&&(module.exports={ArcaPricingTable,ArcaProvider,useArca,useArcaPerks});

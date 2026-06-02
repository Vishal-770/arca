"use client";import{createContext as rr,useContext as er,useMemo as tr}from"react";var I="https://api-arca.vercel.app";import{jsx as or}from"react/jsx-runtime";var V=rr(null),ar=({apiKey:e,children:n})=>{let s=tr(()=>({apiKey:e,portalUrl:I,isConfigured:!!e}),[e]);return or(V.Provider,{value:s,children:n})},T=()=>{let e=er(V);if(!e)throw new Error("Arca components must be used within a ArcaProvider");return e};import{useEffect as sr,useMemo as lr,useState as D}from"react";import{Zap as dr,Lock as pr,ArrowRight as gr,AlertCircle as br,Check as B}from"lucide-react";import{useEffect as X,useState as ir}from"react";var w=(e,n)=>{let{apiKey:s,portalUrl:t}=T(),[i,f]=ir({status:"NONE",remainingSeconds:0,tierIds:[],loading:!!n,error:null});return X(()=>{if(!e||!n)return;(async()=>{try{f(x=>({...x,loading:!0,error:null}));let m=new URL(`${t}/api/sdk/plan/${e}`);m.searchParams.set("userId",n);let l=await fetch(m.toString(),{headers:{"x-api-key":s}}),o=await l.json();if(!l.ok)throw new Error(o.error||"Failed to fetch subscription status");if(o.subscription){let x=o.subscription.tierId,y=o.subscription.tierIds||(x?[x]:[]);f({status:o.subscription.status,remainingSeconds:o.subscription.remainingSeconds,tierId:x,tierIds:y,loading:!1,error:null})}else f(x=>({...x,status:"NONE",tierIds:[],loading:!1}))}catch(m){let l=m instanceof Error?m.message:"Unknown error";f(o=>({...o,loading:!1,error:l}))}})()},[e,n,s,t]),X(()=>{if(i.remainingSeconds<=0||i.status!=="ACTIVE")return;let A=setInterval(()=>{f(m=>{let l=Math.max(m.remainingSeconds-1,0);return{...m,remainingSeconds:l,status:l<=0?"EXPIRED":"ACTIVE",tierIds:l<=0?[]:m.tierIds}})},1e3);return()=>clearInterval(A)},[i.remainingSeconds,i.status]),i};import{clsx as nr}from"clsx";import{twMerge as cr}from"tailwind-merge";function b(...e){return cr(nr(e))}function q(e){return(Number(e)/1e6).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function G(e){let n=Number(e),s=Math.floor(n/86400);if(s>=1)return`${s} day${s!==1?"s":""}`;let t=Math.floor(n/3600);return t>=1?`${t}h`:`${Math.max(Math.floor(n/60),1)}m`}function L(e){let n=Math.floor(e/86400),s=Math.floor(e%86400/3600),t=Math.floor(e%3600/60),i=e%60;return n>0?`${n}d ${s}h ${t}m`:`${s}h ${t}m ${i}s`}import{jsx as a,jsxs as u}from"react/jsx-runtime";var ur=({planId:e,userId:n,redirectUrl:s,appearance:t,className:i,style:f,hideBranding:A=!1,recommendedTierId:m,customLabels:l,classNames:o,renderHeader:x,renderFooter:y,renderTierButton:v})=>{let{apiKey:R,portalUrl:W}=T(),[P,J]=D(null),[Q,M]=D(!0),[z,_]=D(null),S=w(e,n),d=(t?.theme||"dark")==="dark",r={primary:t?.variables?.colorPrimary||(d?"#ffffff":"#000000"),error:t?.variables?.colorError||"#ef4444",background:t?.variables?.backgroundColor||(d?"#0a0a0a":"#ffffff"),text:t?.variables?.textColor||(d?"#ffffff":"#000000"),muted:d?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",border:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",cardBg:d?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",radius:t?.variables?.borderRadius||"4px",font:t?.variables?.fontFamily||"Inter, sans-serif",padding:t?.variables?.cardPadding||"40px",gap:t?.variables?.gap||"24px",hoverBorder:d?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.18)",activeBorder:d?"#ffffff":"#000000",recommendedBorder:d?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",btnText:d?"#09090b":"#ffffff",btnHoverBg:d?"#e4e4e7":"#27272a",btnActiveBorder:d?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)",btnActiveText:d?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)",badgeBgRec:d?"#18181b":"#f4f4f5",badgeBorderRec:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",badgeTextRec:d?"#f4f4f5":"#18181b",badgeBgActive:d?"#ffffff":"#000000",badgeTextActive:d?"#09090b":"#ffffff",skeletonBg:d?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",errorBg:d?"#09090b":"#fbfbfb"};sr(()=>{if(!e)return;(async()=>{try{M(!0),_(null);let g=`${W}/api/sdk/plan/${e}`,h=await fetch(g,{headers:{"x-api-key":R}}),c=await h.json();if(!h.ok)throw{message:c.error||"Plan load failed",code:h.status.toString()};J(c.plan)}catch(g){let h=g instanceof Error?g.message:"Unknown error",c=g&&typeof g=="object"&&"code"in g&&typeof g.code=="string"?g.code:"FETCH_ERROR";_({message:h,code:c})}finally{M(!1)}})()},[e,R,W]);let F=p=>{let g=encodeURIComponent(s||window.location.href),h=`https://arca7.vercel.app/pay/${e}?userId=${n||""}&redirectUrl=${g}`;window.location.href=h},C=S.status==="ACTIVE"&&S.remainingSeconds>0,H=lr(()=>{if(!C||!P)return 0;let p=P.tiers.filter(g=>S.tierIds.includes(g.id));return p.length>0?Math.max(...p.map(g=>Number(g.price))):0},[C,P,S.tierIds]),U=`
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
  `,E={"--arca-primary":r.primary,"--arca-primary-alpha-50":`${r.primary}80`,"--arca-primary-alpha-15":`${r.primary}26`,"--arca-primary-alpha-30":`${r.primary}4d`,"--arca-card-bg":r.cardBg,"--arca-border-color":r.border,"--arca-radius":r.radius,"--arca-padding":r.padding,"--arca-gap":r.gap,"--arca-btn-text-color":r.btnText,"--arca-btn-hover-bg":r.btnHoverBg,"--arca-hover-border":r.hoverBorder,"--arca-active-border":r.activeBorder,"--arca-rec-border":r.recommendedBorder,"--arca-btn-active-border":r.btnActiveBorder,"--arca-btn-active-text":r.btnActiveText,"--arca-badge-bg-rec":r.badgeBgRec,"--arca-badge-border-rec":r.badgeBorderRec,"--arca-badge-text-rec":r.badgeTextRec,"--arca-badge-bg-active":r.badgeBgActive,"--arca-badge-text-active":r.badgeTextActive,"--arca-skeleton-bg":r.skeletonBg,"--arca-error-bg":r.errorBg,"--arca-muted-text":r.muted};return Q?u("div",{className:b("arca-container-cls",i,o?.container),style:{fontFamily:r.font,color:r.text,...E,...f},children:[a("style",{dangerouslySetInnerHTML:{__html:U+`
          @keyframes arca-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .arca-pulse-el {
            animation: arca-pulse 1.8s ease-in-out infinite;
            background-color: var(--arca-skeleton-bg);
            border-radius: var(--arca-radius);
          }
        `}}),!A&&u("div",{style:{textAlign:"center",marginBottom:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[a("div",{style:{height:"36px",width:"220px"},className:"arca-pulse-el"}),a("div",{style:{height:"18px",width:"340px"},className:"arca-pulse-el"})]}),a("div",{style:{maxWidth:"800px",height:"140px",margin:"0 auto",boxSizing:"border-box"},className:"arca-pulse-el"})]}):z?u("div",{className:b("arca-container-cls",i,o?.container),style:{fontFamily:r.font,color:r.text,...E,...f},children:[a("style",{dangerouslySetInnerHTML:{__html:U}}),u("div",{style:{padding:"40px var(--arca-padding)",border:"1px solid var(--arca-border-color)",borderRadius:"var(--arca-radius)",textAlign:"center",maxWidth:"440px",margin:"80px auto",backgroundColor:"var(--arca-error-bg)",boxSizing:"border-box"},children:[a("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"50%",backgroundColor:`${r.error}15`,color:r.error,marginBottom:"16px"},children:a(br,{size:20})}),a("p",{style:{fontSize:"11px",fontWeight:800,color:r.error,textTransform:"uppercase",letterSpacing:"1.5px",margin:0},children:z.code||"Failed to Load"}),a("p",{style:{fontSize:"13px",color:r.muted,marginTop:"8px",fontWeight:500,lineHeight:1.6,margin:"8px 0 0 0"},children:z.message}),a("button",{onClick:()=>window.location.reload(),className:"arca-btn-cls arca-btn-primary-cls",style:{marginTop:"24px",height:"40px"},children:"Retry Connection"})]})]}):u("div",{className:b("arca-container-cls",i,o?.container),style:{fontFamily:r.font,color:r.text,...E,...f},children:[a("style",{dangerouslySetInnerHTML:{__html:U}}),x?x(P||{id:e,name:"",duration:"",tiers:[]},S):!A&&u("div",{style:{textAlign:"center",marginBottom:"60px"},children:[C&&u("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"#18181b",border:"1px solid #27272a",color:"#f4f4f5",padding:"4px 10px",borderRadius:"4px",fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"24px"},children:[a(B,{size:11,style:{strokeWidth:3}}),l?.subscriptionActiveHeader?l.subscriptionActiveHeader.replace("{{countdown}}",L(S.remainingSeconds)):`Subscription Active \xB7 ${L(S.remainingSeconds)} Left`]}),a("h2",{style:{fontSize:"48px",fontWeight:900,letterSpacing:"-0.04em",marginBottom:"16px",color:r.text,...t?.elements?.tierLabel},className:o?.tierLabel,children:P?.name}),a("p",{style:{color:r.muted,fontSize:"15px",fontWeight:500},children:l?.selectPlanDescription||"Select a membership tier to access the protocol."})]}),a("div",{className:b("arca-grid-cls",o?.grid),children:P?.tiers.map((p,g)=>{let h=m?p.id===m:g===1,c=C&&S.tierIds.includes(p.id),O=Number(p.price),j=C&&!c&&O>H,K=C&&!c&&O<H,k=`Get ${p.label}`;return c?k=l?.activeSubscription||"Current Plan":C?j?k=l?.upgrade||"Upgrade":K?k=l?.downgrade||"Downgrade":k=l?.changePlan||"Switch Plan":l?.getTier&&(k=l.getTier.replace("{{tierLabel}}",p.label)),u("div",{className:b("arca-card-cls",c&&"arca-card-active-cls",!c&&h&&"arca-card-rec-cls",o?.card),style:{border:c?"1px solid var(--arca-active-border)":h?"1px solid var(--arca-rec-border)":"1px solid var(--arca-border-color)",...t?.elements?.card},children:[c&&u("div",{className:b(o?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-active)",color:"var(--arca-badge-text-active)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:"4px",border:"1px solid var(--arca-badge-bg-active)"},children:[a(B,{size:10,style:{strokeWidth:3}}),"Current Plan"]}),!c&&h&&a("div",{className:b(o?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-rec)",color:"var(--arca-badge-text-rec)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",border:"1px solid var(--arca-badge-border-rec)"},children:"Recommended"}),u("div",{style:{flex:1},children:[a("h3",{className:b(o?.tierLabel),style:{fontSize:"24px",fontWeight:900,marginBottom:"8px",...t?.elements?.tierLabel},children:p.label}),u("div",{className:b(o?.priceContainer),style:{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"32px",...t?.elements?.price},children:[u("span",{className:b(o?.priceAmount),style:{fontSize:"40px",fontWeight:900},children:["$",q(p.price)]}),u("span",{className:b(o?.priceMuted),style:{fontSize:"14px",color:r.muted,fontWeight:700},children:["/ ",G(P?.duration||"0")]})]}),a("div",{className:b(o?.featuresList),style:{borderTop:"1px solid var(--arca-border-color)",paddingTop:"24px"},children:p.features.map((N,Y)=>u("div",{className:b("arca-feat-item",o?.featureItem),style:{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"flex-start"},children:[a("div",{style:{marginTop:"4px",flexShrink:0},children:a(B,{size:12,style:{color:c?"var(--arca-active-border)":"var(--arca-muted-text)"}})}),u("div",{children:[a("p",{className:b(o?.featureTitle),style:{fontSize:"13.5px",fontWeight:700,margin:0,lineHeight:"1.4"},children:N.title}),N.description&&a("p",{className:b(o?.featureDescription),style:{fontSize:"11.5px",color:r.muted,marginTop:"2px",lineHeight:"1.4",margin:0},children:N.description})]})]},Y))})]}),v?v(p,{isActive:C,isCurrent:c,isDisabled:c,isUpgrade:j,isDowngrade:K,label:k},()=>F(p.id)):u("button",{onClick:()=>!c&&F(p.id),disabled:c,className:b("arca-btn-cls",c?"arca-btn-active-cls":"arca-btn-primary-cls",o?.button),style:{backgroundColor:c?"transparent":"var(--arca-primary)",color:c?"var(--arca-btn-active-text)":"var(--arca-btn-text-color)",border:c?"1px solid var(--arca-btn-active-border)":"none",...t?.elements?.button},children:[k,!c&&a(gr,{size:13,style:{strokeWidth:2.5}}),c&&a(B,{size:13,style:{strokeWidth:3}})]})]},p.id)})}),y?y():!A&&u("div",{style:{marginTop:"60px",textAlign:"center",opacity:.35,display:"flex",justifyContent:"center",gap:"20px",alignItems:"center"},children:[a("p",{style:{fontSize:"10px",fontWeight:900,textTransform:"uppercase",letterSpacing:"2px",margin:0},children:"Powered by Arca Pay"}),a(pr,{size:11}),a(dr,{size:11})]})]})};import{useEffect as fr,useMemo as mr,useState as Z}from"react";var xr=(e,n)=>{let{apiKey:s,portalUrl:t}=T(),i=w(e,n),[f,A]=Z(null),[m,l]=Z(!0);return fr(()=>{if(!e)return;(async()=>{try{l(!0);let y=`${t}/api/sdk/plan/${e}`,v=await fetch(y,{headers:{"x-api-key":s}}),R=await v.json();v.ok&&A(R.plan)}catch(y){console.error("Failed to fetch plan in useArcaPerks",y)}finally{l(!1)}})()},[e,s,t]),{perks:mr(()=>{if(i.loading||m)return;if(i.status!=="ACTIVE"||i.tierIds.length===0||!f)return null;let x=new Date(Date.now()+i.remainingSeconds*1e3);return f.tiers.filter(v=>i.tierIds.includes(v.id)).map(v=>({tierId:v.id,tierName:v.label,features:v.features,expiryDate:x}))},[i.loading,i.status,i.tierIds,i.remainingSeconds,f,m]),loading:i.loading||m,error:i.error}};var $=class{apiKey;baseUrl;constructor(n,s){this.apiKey=n,this.baseUrl=(s?.baseUrl||I).replace(/\/$/,"")}async getSubscriptionStatus(n,s){if(!n)throw new Error("planId is required");if(!s)throw new Error("userId is required");let t=new URL(`${this.baseUrl}/api/sdk/plan/${n}`);t.searchParams.set("userId",s);let i=await fetch(t.toString(),{headers:{"x-api-key":this.apiKey}}),f=await i.json();if(!i.ok)throw new Error(f?.error||"Failed to fetch subscription status");return f?.subscription||{status:"NONE",remainingSeconds:0,tierIds:[]}}};function vr(e,n){return new $(e,n)}export{$ as ArcaClient,ur as ArcaPricingTable,ar as ArcaProvider,vr as createArcaClient,w as useArca,xr as useArcaPerks};

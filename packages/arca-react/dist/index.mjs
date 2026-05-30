"use client";import{createContext as q,useContext as J,useEffect as I,useState as T,useMemo as E}from"react";import{Zap as Q,Lock as Y,ArrowRight as rr,AlertCircle as er,Check as R}from"lucide-react";import{clsx as tr}from"clsx";import{twMerge as ar}from"tailwind-merge";import{jsx as t,jsxs as p}from"react/jsx-runtime";function f(...e){return ar(tr(e))}var K=q(null),ur=({apiKey:e,children:l})=>{let b="https://arca-pay.vercel.app",a=E(()=>({apiKey:e,portalUrl:b,isConfigured:!!e}),[e]);return t(K.Provider,{value:a,children:l})},W=()=>{let e=J(K);if(!e)throw new Error("Arca components must be used within a ArcaProvider");return e},O=(e,l)=>{let{apiKey:b,portalUrl:a}=W(),[n,x]=T({status:"NONE",remainingSeconds:0,tierIds:[],loading:!!l,error:null});return I(()=>{if(!e||!l)return;(async()=>{try{x(m=>({...m,loading:!0,error:null}));let u=new URL(`${a}/api/sdk/plan/${e}`);u.searchParams.set("userId",l);let s=await fetch(u.toString(),{headers:{"x-api-key":b}}),i=await s.json();if(!s.ok)throw new Error(i.error||"Failed to fetch subscription status");if(i.subscription){let m=i.subscription.tierId,y=i.subscription.tierIds||(m?[m]:[]);x({status:i.subscription.status,remainingSeconds:i.subscription.remainingSeconds,tierId:m,tierIds:y,loading:!1,error:null})}else x(m=>({...m,status:"NONE",tierIds:[],loading:!1}))}catch(u){let s=u instanceof Error?u.message:"Unknown error";x(i=>({...i,loading:!1,error:s}))}})()},[e,l,b,a]),I(()=>{if(n.remainingSeconds<=0||n.status!=="ACTIVE")return;let S=setInterval(()=>{x(u=>{let s=Math.max(u.remainingSeconds-1,0);return{...u,remainingSeconds:s,status:s<=0?"EXPIRED":"ACTIVE",tierIds:s<=0?[]:u.tierIds}})},1e3);return()=>clearInterval(S)},[n.remainingSeconds,n.status]),n};function ir(e){return(Number(e)/1e6).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function or(e){let l=Number(e),b=Math.floor(l/86400);if(b>=1)return`${b} day${b!==1?"s":""}`;let a=Math.floor(l/3600);return a>=1?`${a}h`:`${Math.max(Math.floor(l/60),1)}m`}function _(e){let l=Math.floor(e/86400),b=Math.floor(e%86400/3600),a=Math.floor(e%3600/60),n=e%60;return l>0?`${l}d ${b}h ${a}m`:`${b}h ${a}m ${n}s`}var fr=({planId:e,userId:l,redirectUrl:b,appearance:a,className:n,style:x,hideBranding:S=!1,recommendedTierId:u,customLabels:s,classNames:i,renderHeader:m,renderFooter:y,renderTierButton:v})=>{let{apiKey:w,portalUrl:B}=W(),[C,X]=T(null),[G,U]=T(!0),[z,M]=T(null),A=O(e,l),c=(a?.theme||"dark")==="dark",r={primary:a?.variables?.colorPrimary||(c?"#ffffff":"#000000"),error:a?.variables?.colorError||"#ef4444",background:a?.variables?.backgroundColor||(c?"#0a0a0a":"#ffffff"),text:a?.variables?.textColor||(c?"#ffffff":"#000000"),muted:c?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)",border:c?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",cardBg:c?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",radius:a?.variables?.borderRadius||"4px",font:a?.variables?.fontFamily||"Inter, sans-serif",padding:a?.variables?.cardPadding||"40px",gap:a?.variables?.gap||"24px",hoverBorder:c?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.18)",activeBorder:c?"#ffffff":"#000000",recommendedBorder:c?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.35)",btnText:c?"#09090b":"#ffffff",btnHoverBg:c?"#e4e4e7":"#27272a",btnActiveBorder:c?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)",btnActiveText:c?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)",badgeBgRec:c?"#18181b":"#f4f4f5",badgeBorderRec:c?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",badgeTextRec:c?"#f4f4f5":"#18181b",badgeBgActive:c?"#ffffff":"#000000",badgeTextActive:c?"#09090b":"#ffffff",skeletonBg:c?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",errorBg:c?"#09090b":"#fbfbfb"};I(()=>{if(!e)return;(async()=>{try{U(!0),M(null);let g=`${B}/api/sdk/plan/${e}`,h=await fetch(g,{headers:{"x-api-key":w}}),o=await h.json();if(!h.ok)throw{message:o.error||"Plan load failed",code:h.status.toString()};X(o.plan)}catch(g){let h=g instanceof Error?g.message:"Unknown error",o=g&&typeof g=="object"&&"code"in g&&typeof g.code=="string"?g.code:"FETCH_ERROR";M({message:h,code:o})}finally{U(!1)}})()},[e,w,B]);let L=d=>{let g=encodeURIComponent(b||window.location.href),h=`${B}/pay/${e}?userId=${l||""}&redirectUrl=${g}&apiKey=${w||""}`;window.location.href=h},k=A.status==="ACTIVE"&&A.remainingSeconds>0,F=E(()=>{if(!k||!C)return 0;let d=C.tiers.filter(g=>A.tierIds.includes(g.id));return d.length>0?Math.max(...d.map(g=>Number(g.price))):0},[k,C,A.tierIds]),$=`
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
  `,D={"--arca-primary":r.primary,"--arca-primary-alpha-50":`${r.primary}80`,"--arca-primary-alpha-15":`${r.primary}26`,"--arca-primary-alpha-30":`${r.primary}4d`,"--arca-card-bg":r.cardBg,"--arca-border-color":r.border,"--arca-radius":r.radius,"--arca-padding":r.padding,"--arca-gap":r.gap,"--arca-btn-text-color":r.btnText,"--arca-btn-hover-bg":r.btnHoverBg,"--arca-hover-border":r.hoverBorder,"--arca-active-border":r.activeBorder,"--arca-rec-border":r.recommendedBorder,"--arca-btn-active-border":r.btnActiveBorder,"--arca-btn-active-text":r.btnActiveText,"--arca-badge-bg-rec":r.badgeBgRec,"--arca-badge-border-rec":r.badgeBorderRec,"--arca-badge-text-rec":r.badgeTextRec,"--arca-badge-bg-active":r.badgeBgActive,"--arca-badge-text-active":r.badgeTextActive,"--arca-skeleton-bg":r.skeletonBg,"--arca-error-bg":r.errorBg,"--arca-muted-text":r.muted};return G?p("div",{className:f("arca-container-cls",n,i?.container),style:{fontFamily:r.font,color:r.text,...D,...x},children:[t("style",{dangerouslySetInnerHTML:{__html:$+`
          @keyframes arca-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .arca-pulse-el {
            animation: arca-pulse 1.8s ease-in-out infinite;
            background-color: var(--arca-skeleton-bg);
            border-radius: var(--arca-radius);
          }
        `}}),!S&&p("div",{style:{textAlign:"center",marginBottom:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},children:[t("div",{style:{height:"36px",width:"220px"},className:"arca-pulse-el"}),t("div",{style:{height:"18px",width:"340px"},className:"arca-pulse-el"})]}),t("div",{style:{maxWidth:"800px",height:"140px",margin:"0 auto",boxSizing:"border-box"},className:"arca-pulse-el"})]}):z?p("div",{className:f("arca-container-cls",n,i?.container),style:{fontFamily:r.font,color:r.text,...D,...x},children:[t("style",{dangerouslySetInnerHTML:{__html:$}}),p("div",{style:{padding:"40px var(--arca-padding)",border:"1px solid var(--arca-border-color)",borderRadius:"var(--arca-radius)",textAlign:"center",maxWidth:"440px",margin:"80px auto",backgroundColor:"var(--arca-error-bg)",boxSizing:"border-box"},children:[t("div",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"50%",backgroundColor:`${r.error}15`,color:r.error,marginBottom:"16px"},children:t(er,{size:20})}),t("p",{style:{fontSize:"11px",fontWeight:800,color:r.error,textTransform:"uppercase",letterSpacing:"1.5px",margin:0},children:z.code||"Failed to Load"}),t("p",{style:{fontSize:"13px",color:r.muted,marginTop:"8px",fontWeight:500,lineHeight:1.6,margin:"8px 0 0 0"},children:z.message}),t("button",{onClick:()=>window.location.reload(),className:"arca-btn-cls arca-btn-primary-cls",style:{marginTop:"24px",height:"40px"},children:"Retry Connection"})]})]}):p("div",{className:f("arca-container-cls",n,i?.container),style:{fontFamily:r.font,color:r.text,...D,...x},children:[t("style",{dangerouslySetInnerHTML:{__html:$}}),m?m(C||{id:e,name:"",duration:"",tiers:[]},A):!S&&p("div",{style:{textAlign:"center",marginBottom:"60px"},children:[k&&p("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",backgroundColor:"#18181b",border:"1px solid #27272a",color:"#f4f4f5",padding:"4px 10px",borderRadius:"4px",fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"24px"},children:[t(R,{size:11,style:{strokeWidth:3}}),s?.subscriptionActiveHeader?s.subscriptionActiveHeader.replace("{{countdown}}",_(A.remainingSeconds)):`Subscription Active \xB7 ${_(A.remainingSeconds)} Left`]}),t("h2",{style:{fontSize:"48px",fontWeight:900,letterSpacing:"-0.04em",marginBottom:"16px",color:r.text,...a?.elements?.tierLabel},className:i?.tierLabel,children:C?.name}),t("p",{style:{color:r.muted,fontSize:"15px",fontWeight:500},children:s?.selectPlanDescription||"Select a membership tier to access the protocol."})]}),t("div",{className:f("arca-grid-cls",i?.grid),children:C?.tiers.map((d,g)=>{let h=u?d.id===u:g===1,o=k&&A.tierIds.includes(d.id),H=Number(d.price),V=k&&!o&&H>F,j=k&&!o&&H<F,P=`Get ${d.label}`;return o?P=s?.activeSubscription||"Current Plan":k?V?P=s?.upgrade||"Upgrade":j?P=s?.downgrade||"Downgrade":P=s?.changePlan||"Switch Plan":s?.getTier&&(P=s.getTier.replace("{{tierLabel}}",d.label)),p("div",{className:f("arca-card-cls",o&&"arca-card-active-cls",!o&&h&&"arca-card-rec-cls",i?.card),style:{border:o?"1px solid var(--arca-active-border)":h?"1px solid var(--arca-rec-border)":"1px solid var(--arca-border-color)",...a?.elements?.card},children:[o&&p("div",{className:f(i?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-active)",color:"var(--arca-badge-text-active)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:"4px",border:"1px solid var(--arca-badge-bg-active)"},children:[t(R,{size:10,style:{strokeWidth:3}}),"Current Plan"]}),!o&&h&&t("div",{className:f(i?.badge),style:{position:"absolute",top:"-10px",left:"50%",transform:"translateX(-50%)",backgroundColor:"var(--arca-badge-bg-rec)",color:"var(--arca-badge-text-rec)",padding:"3px 12px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",border:"1px solid var(--arca-badge-border-rec)"},children:"Recommended"}),p("div",{style:{flex:1},children:[t("h3",{className:f(i?.tierLabel),style:{fontSize:"24px",fontWeight:900,marginBottom:"8px",...a?.elements?.tierLabel},children:d.label}),p("div",{className:f(i?.priceContainer),style:{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"32px",...a?.elements?.price},children:[p("span",{className:f(i?.priceAmount),style:{fontSize:"40px",fontWeight:900},children:["$",ir(d.price)]}),p("span",{className:f(i?.priceMuted),style:{fontSize:"14px",color:r.muted,fontWeight:700},children:["/ ",or(C?.duration||"0")]})]}),t("div",{className:f(i?.featuresList),style:{borderTop:"1px solid var(--arca-border-color)",paddingTop:"24px"},children:d.features.map((N,Z)=>p("div",{className:f("arca-feat-item",i?.featureItem),style:{display:"flex",gap:"12px",marginBottom:"16px",alignItems:"flex-start"},children:[t("div",{style:{marginTop:"4px",flexShrink:0},children:t(R,{size:12,style:{color:o?"var(--arca-active-border)":"var(--arca-muted-text)"}})}),p("div",{children:[t("p",{className:f(i?.featureTitle),style:{fontSize:"13.5px",fontWeight:700,margin:0,lineHeight:"1.4"},children:N.title}),N.description&&t("p",{className:f(i?.featureDescription),style:{fontSize:"11.5px",color:r.muted,marginTop:"2px",lineHeight:"1.4",margin:0},children:N.description})]})]},Z))})]}),v?v(d,{isActive:k,isCurrent:o,isDisabled:o,isUpgrade:V,isDowngrade:j,label:P},()=>L(d.id)):p("button",{onClick:()=>!o&&L(d.id),disabled:o,className:f("arca-btn-cls",o?"arca-btn-active-cls":"arca-btn-primary-cls",i?.button),style:{backgroundColor:o?"transparent":"var(--arca-primary)",color:o?"var(--arca-btn-active-text)":"var(--arca-btn-text-color)",border:o?"1px solid var(--arca-btn-active-border)":"none",...a?.elements?.button},children:[P,!o&&t(rr,{size:13,style:{strokeWidth:2.5}}),o&&t(R,{size:13,style:{strokeWidth:3}})]})]},d.id)})}),y?y():!S&&p("div",{style:{marginTop:"60px",textAlign:"center",opacity:.35,display:"flex",justifyContent:"center",gap:"20px",alignItems:"center"},children:[t("p",{style:{fontSize:"10px",fontWeight:900,textTransform:"uppercase",letterSpacing:"2px",margin:0},children:"Powered by Arca Pay"}),t(Y,{size:11}),t(Q,{size:11})]})]})},xr=(e,l)=>{let{apiKey:b,portalUrl:a}=W(),n=O(e,l),[x,S]=T(null),[u,s]=T(!0);return I(()=>{if(!e)return;(async()=>{try{s(!0);let y=`${a}/api/sdk/plan/${e}`,v=await fetch(y,{headers:{"x-api-key":b}}),w=await v.json();v.ok&&S(w.plan)}catch(y){console.error("Failed to fetch plan in useArcaPerks",y)}finally{s(!1)}})()},[e,b,a]),{perks:E(()=>{if(n.loading||u)return;if(n.status!=="ACTIVE"||n.tierIds.length===0||!x)return null;let m=new Date(Date.now()+n.remainingSeconds*1e3);return x.tiers.filter(v=>n.tierIds.includes(v.id)).map(v=>({tierId:v.id,tierName:v.label,features:v.features,expiryDate:m}))},[n.loading,n.status,n.tierIds,n.remainingSeconds,x,u]),loading:n.loading||u,error:n.error}};export{fr as ArcaPricingTable,ur as ArcaProvider,O as useArca,xr as useArcaPerks};

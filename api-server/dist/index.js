"use strict";var W=Object.create;var _=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var X=Object.getOwnPropertyNames;var z=Object.getPrototypeOf,J=Object.prototype.hasOwnProperty;var Z=(t,e,r,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of X(e))!J.call(t,s)&&s!==r&&_(t,s,{get:()=>e[s],enumerable:!(n=V(e,s))||n.enumerable});return t};var h=(t,e,r)=>(r=t!=null?W(z(t)):{},Z(e||!t||!t.__esModule?_(r,"default",{value:t,enumerable:!0}):r,t));var v=h(require("express")),Y=h(require("cors")),K=h(require("dotenv"));var U=require("express");var P=h(require("dotenv"));P.default.config();var T=process.env.SUBGRAPH_URL||process.env.NEXT_PUBLIC_SUBGRAPH_URL||"";T||console.warn("WARNING: SUBGRAPH_URL is not defined in environment variables");async function d(t,e){let r=await fetch(T,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:t,variables:e})});if(!r.ok)throw new Error(`Subgraph query failed with status ${r.status}`);let n=await r.json();if(n.errors?.length)throw new Error(n.errors.map(s=>s.message).join("; "));if(!n.data)throw new Error("Subgraph response did not include data");return n.data}function D(){return Math.floor(Date.now()/1e3)}function S(t){if(t==null)return 0;if(typeof t=="number")return Number.isFinite(t)?t:0;let e=Number(t);return Number.isFinite(e)?e:0}function c(t){return t.toLowerCase()}var N=h(require("dotenv"));N.default.config();var bt=process.env.SUBSCRIPTION_GATEWAY_ADDRESS??process.env.NEXT_PUBLIC_SUBSCRIPTION_GATEWAY_ADDRESS??"0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2",ht=process.env.ARC_USDC_ADDRESS??process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS??"0x3600000000000000000000000000000000000000",mt=process.env.ARC_RPC_URL??process.env.NEXT_PUBLIC_ARC_RPC_URL??"https://rpc.testnet.arc.network",tt=process.env.IPFS_GATEWAY_BASE??process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE??"https://ipfs.filebase.io/ipfs/";function et(t){return t.startsWith("ipfs://")?t:`ipfs://${t}`}function f(t){let e=et(t);return`${tt}${e.replace("ipfs://","")}`}var x=(0,U.Router)(),rt=`
  query GetPlan($planId: ID!) {
    plan(id: $planId) {
      id
      duration
      ipfsHash
      active
      tiers(where: { active: true }) {
        tierId
        price
        label
        active
      }
      seller { id }
    }
  }
`,nt=`
  query SubscriptionsByUserId($planId: Bytes!, $userId: String!) {
    subscriptionStates(
      where: { plan_: { id: $planId }, lastBuyerData: $userId }
      first: 1
      orderBy: updatedAt
      orderDirection: desc
    ) {
      status
      lastEndTime
      lastTierId
    }
    subscribeds(
      where: { planId: $planId, buyerData: $userId }
    ) {
      tierId
      endTime
    }
  }
`;x.get("/plan/:planId",async(t,e)=>{let{planId:r}=t.params,n=t.query.userId,s=t.headers["x-api-key"];try{if(!s||!s.startsWith("mp_live_")&&!s.startsWith("mp_test_"))return e.status(401).json({error:"Invalid or missing Arca API Key",code:"UNAUTHORIZED"});let a=await d(rt,{planId:c(r)});if(!a.plan)return e.status(404).json({error:"Plan not found"});let u=null;try{let l=await fetch(f(a.plan.ipfsHash));u=l.ok?await l.json():null}catch(l){console.warn("Failed to fetch plan metadata from IPFS:",l),u=null}let o=null;if(n){let l=await d(nt,{planId:c(r),userId:n});if(l.subscriptionStates?.[0]){let i=l.subscriptionStates[0],g=S(i.lastEndTime),w=D(),C=Math.max(g-w,0),E=C>0&&i.status==="ACTIVE",Q=(l.subscribeds??[]).filter(A=>S(A.endTime)>=w),m=Array.from(new Set(Q.map(A=>A.tierId)));E&&i.lastTierId&&!m.includes(i.lastTierId)&&m.push(i.lastTierId),o={status:E||m.length>0?"ACTIVE":"EXPIRED",remainingSeconds:C,tierId:i.lastTierId,tierIds:m}}}return e.json({plan:{id:a.plan.id,name:u?.name||a.plan.id,duration:a.plan.duration,brand:u?.brand,tiers:a.plan.tiers.map(l=>{let i=u?.tiers?.find(g=>g.label===l.label);return{id:l.tierId,label:l.label,price:l.price,features:i?.features||[]}})},subscription:o})}catch(a){return console.error("[GET /api/sdk/plan/:planId]",a),e.status(500).json({error:"Internal Server Error"})}});var B=x;var M=require("express");var j=require("mongodb"),G=h(require("dotenv"));G.default.config();var $=process.env.MONGODB_URI,L=process.env.MONGODB_DB;if(!$)throw new Error("Please define the MONGODB_URI environment variable");if(!L)throw new Error("Please define the MONGODB_DB environment variable");var y=null,I=null;async function k(){if(y&&I)return{client:y,db:I};let t=await j.MongoClient.connect($),e=t.db(L);return y=t,I=e,{client:t,db:e}}var R=require("crypto");function F(t){return(0,R.createHash)("sha256").update(t).digest("hex")}async function O(t,e,r){let n=t.headers["x-api-key"];if(!n||typeof n!="string")return e.status(401).json({error:"Missing or invalid x-api-key header"});try{let{db:s}=await k(),a=F(n.trim()),u=await s.collection("api_keys").findOne({keyHash:a,revokedAt:null});if(!u)return e.status(401).json({error:"Unauthorized: Invalid or revoked API key"});s.collection("api_keys").updateOne({_id:u._id},{$set:{lastUsedAt:new Date}}).catch(o=>console.error("Failed to update lastUsedAt",o)),t.userId=u.userId,t.merchantAddress=u.merchantAddress,r()}catch(s){return console.error("API Key Validation Error:",s),e.status(500).json({error:"Internal Server Error"})}}var p=(0,M.Router)();p.use(O);var st=`
  query MerchantPlans($seller: String!) {
    plans(where: { seller: $seller }) {
      id
    }
  }
`,at=`
  query PlanMetadata($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      ipfsHash
    }
  }
`,ot=`
  query CheckPlanOwner($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
    }
  }
`,it=`
  query PlanSubscribers($planId: String!) {
    subscriptionStates(where: { plan: $planId }, orderBy: lastEndTime, orderDirection: desc) {
      id
      subscriber { id }
      status
      lastEndTime
      totalSpent
      lastBuyerData
    }
  }
`,lt=`
  query PlanAnalytics($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      duration
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      createdAt
      updatedAt
      tiers {
        tierId
        price
        label
        active
      }
    }
  }
`,ut=`
  query SellerMetrics($id: Bytes!) {
    seller(id: $id) {
      id
      planCount
      activePlanCount
      subscriptionCount
      totalGrossRevenue
      totalNetRevenue
      totalFeeContributed
    }
  }
`;p.get("/wallet",async(t,e)=>{let{merchantAddress:r}=t;return r?e.json({success:!0,walletAddress:r}):e.status(404).json({error:"No wallet address associated with this key"})});p.get("/plans",async(t,e)=>{let{merchantAddress:r}=t;if(!r)return e.status(404).json({error:"No wallet address associated with this key"});try{let n=c(r),a=((await d(st,{seller:n})).plans??[]).map(u=>u.id);return e.json({success:!0,plans:a})}catch(n){return console.error("[GET /api/v1/plans]",n),e.status(500).json({error:"Internal Server Error"})}});p.get("/plans/:id",async(t,e)=>{let{merchantAddress:r}=t,{id:n}=t.params;if(!r)return e.status(404).json({error:"No wallet address associated with this key"});try{let s=c(r),a=c(n),o=(await d(at,{id:a})).plan;if(!o)return e.status(404).json({error:"Plan not found"});if(o.seller.id.toLowerCase()!==s)return e.status(403).json({error:"Forbidden: You do not own this plan"});let l=null;try{let i=await fetch(f(o.ipfsHash));l=i.ok?await i.json():null}catch(i){console.warn("Failed to fetch plan metadata from IPFS:",i),l=null}return e.json({success:!0,planId:o.id,metadata:l})}catch(s){return console.error("[GET /api/v1/plans/:id]",s),e.status(500).json({error:"Internal Server Error"})}});p.get("/plans/:id/subscribers",async(t,e)=>{let{merchantAddress:r}=t,{id:n}=t.params;if(!r)return e.status(404).json({error:"No wallet address associated with this key"});try{let s=c(r),a=c(n),u=await d(ot,{id:a});if(!u.plan)return e.status(404).json({error:"Plan not found"});if(u.plan.seller.id.toLowerCase()!==s)return e.status(403).json({error:"Forbidden: You do not own this plan"});let l=((await d(it,{planId:a})).subscriptionStates??[]).map(i=>({subscriptionId:i.id,buyerAddress:i.subscriber.id,buyerData:i.lastBuyerData,status:i.status,lastEndTime:i.lastEndTime,totalSpent:i.totalSpent}));return e.json({success:!0,subscribers:l})}catch(s){return console.error("[GET /api/v1/plans/:id/subscribers]",s),e.status(500).json({error:"Internal Server Error"})}});p.get("/plans/:id/analytics",async(t,e)=>{let{merchantAddress:r}=t,{id:n}=t.params;if(!r)return e.status(404).json({error:"No wallet address associated with this key"});try{let s=c(r),a=c(n),o=(await d(lt,{id:a})).plan;return o?o.seller.id.toLowerCase()!==s?e.status(403).json({error:"Forbidden: You do not own this plan"}):e.json({success:!0,analytics:{planId:o.id,active:o.active,subscriptionCount:o.subscriptionCount,totalGrossVolume:o.totalGrossVolume,totalFeesCollected:o.totalFeesCollected,netRevenue:(BigInt(o.totalGrossVolume)-BigInt(o.totalFeesCollected)).toString(),lastSubscriptionAt:o.lastSubscriptionAt,createdAt:o.createdAt,updatedAt:o.updatedAt,tiers:o.tiers}}):e.status(404).json({error:"Plan not found"})}catch(s){return console.error("[GET /api/v1/plans/:id/analytics]",s),e.status(500).json({error:"Internal Server Error"})}});p.get("/analytics",async(t,e)=>{let{merchantAddress:r}=t;if(!r)return e.status(404).json({error:"No wallet address associated with this key"});try{let n=c(r),a=(await d(ut,{id:n})).seller;return a?e.json({success:!0,analytics:{sellerId:a.id,planCount:a.planCount,activePlanCount:a.activePlanCount,subscriptionCount:a.subscriptionCount,totalGrossRevenue:a.totalGrossRevenue,totalNetRevenue:a.totalNetRevenue,totalFeeContributed:a.totalFeeContributed}}):e.json({success:!0,analytics:{sellerId:n,planCount:0,activePlanCount:0,subscriptionCount:0,totalGrossRevenue:"0",totalNetRevenue:"0",totalFeeContributed:"0"}})}catch(n){return console.error("[GET /api/v1/analytics]",n),e.status(500).json({error:"Internal Server Error"})}});var H=p;K.default.config();var b=(0,v.default)(),q=process.env.PORT||3001;b.use((0,Y.default)({origin:"*"}));b.use(v.default.json());b.use((t,e,r)=>{console.log(`[${new Date().toISOString()}] ${t.method} ${t.originalUrl}`),r()});b.use("/api/sdk",B);b.use("/api/v1",H);b.get("/health",(t,e)=>{e.json({status:"OK",timestamp:new Date})});b.use((t,e,r,n)=>{console.error("Unhandled Server Error:",t),r.status(500).json({error:"Internal Server Error"})});b.listen(q,()=>{console.log(`\u26A1 Arca SDK & Consumer API Gateway is running on port ${q}`)});

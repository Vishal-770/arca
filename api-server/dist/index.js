"use strict";var J=Object.create;var U=Object.defineProperty;var ee=Object.getOwnPropertyDescriptor;var te=Object.getOwnPropertyNames;var re=Object.getPrototypeOf,se=Object.prototype.hasOwnProperty;var ne=(t,e,o,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of te(e))!se.call(t,r)&&r!==o&&U(t,r,{get:()=>e[r],enumerable:!(s=ee(e,r))||s.enumerable});return t};var I=(t,e,o)=>(o=t!=null?J(re(t)):{},ne(e||!t||!t.__esModule?U(o,"default",{value:t,enumerable:!0}):o,t));var C=I(require("express")),X=I(require("cors")),z=I(require("dotenv"));var B=require("express");var L=I(require("dotenv"));L.default.config();var E=process.env.SUBGRAPH_URL||process.env.NEXT_PUBLIC_SUBGRAPH_URL||"";E||console.warn("WARNING: SUBGRAPH_URL is not defined in environment variables");var c=class extends Error{statusCode;code;details;constructor(e,o,s,r){super(e),this.name="SubgraphError",this.code=o,this.statusCode=s,this.details=r}};async function R(t,e){if(!E)throw new c("Subgraph URL is not configured","SUBGRAPH_NOT_CONFIGURED",500);let o=await fetch(E,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:t,variables:e})});if(!o.ok)throw new c(`Subgraph responded with status ${o.status}`,"SUBGRAPH_UNAVAILABLE",502,{status:o.status});let s=await o.json();if(s.errors?.length)throw new c("Subgraph returned errors for the query","SUBGRAPH_QUERY_ERROR",502,s.errors.map(r=>r.message));if(!s.data)throw new c("Subgraph response did not include data","SUBGRAPH_EMPTY_RESPONSE",502);return s.data}function x(){return Math.floor(Date.now()/1e3)}function _(t){if(t==null)return 0;if(typeof t=="number")return Number.isFinite(t)?t:0;let e=Number(t);return Number.isFinite(e)?e:0}function p(t){return t.toLowerCase()}var O=I(require("dotenv"));O.default.config();var be=process.env.SUBSCRIPTION_GATEWAY_ADDRESS??process.env.NEXT_PUBLIC_SUBSCRIPTION_GATEWAY_ADDRESS??"0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2",ge=process.env.ARC_USDC_ADDRESS??process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS??"0x3600000000000000000000000000000000000000",Se=process.env.ARC_RPC_URL??process.env.NEXT_PUBLIC_ARC_RPC_URL??"https://rpc.testnet.arc.network",oe=process.env.IPFS_GATEWAY_BASE??process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE??"https://ipfs.filebase.io/ipfs/";function ae(t){return t.startsWith("ipfs://")?t:`ipfs://${t}`}function b(t){let e=ae(t);return`${oe}${e.replace("ipfs://","")}`}function j(t){return/^0x[a-fA-F0-9]{40}$/.test(t)}var G=(0,B.Router)();function ie(t){return/^0x[a-fA-F0-9]{40}$/.test(t)||/^0x[a-fA-F0-9]{64}$/.test(t)}var le=`
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
`,de=`
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
`;G.get("/plan/:planId",async(t,e)=>{let{planId:o}=t.params,s=t.query.userId,r=t.headers["x-api-key"];try{if(!r||!r.startsWith("mp_live_")&&!r.startsWith("mp_test_"))return e.status(401).json({error:"Invalid or missing Arca API Key",code:"UNAUTHORIZED"});if(!o||!ie(o))return e.status(400).json({error:"Invalid planId format",code:"INVALID_PLAN_ID"});let n=s?.trim();if(s!==void 0&&(!n||n.length>256))return e.status(400).json({error:"Invalid userId",code:"INVALID_USER_ID"});let a=await R(le,{planId:p(o)});if(!a.plan)return e.status(404).json({error:"Plan not found",code:"PLAN_NOT_FOUND"});let u=null;try{let d=await fetch(b(a.plan.ipfsHash));u=d.ok?await d.json():null}catch(d){console.warn("Failed to fetch plan metadata from IPFS:",d),u=null}let i=null;if(n){let d=await R(de,{planId:p(o),userId:n});if(d.subscriptionStates?.[0]){let l=d.subscriptionStates[0],g=_(l.lastEndTime),D=x(),v=Math.max(g-D,0),w=v>0&&l.status==="ACTIVE",Z=(d.subscribeds??[]).filter(S=>_(S.endTime)>=D),h=Array.from(new Set(Z.map(S=>S.tierId)));w&&l.lastTierId&&!h.includes(l.lastTierId)&&h.push(l.lastTierId),i={status:w||h.length>0?"ACTIVE":"EXPIRED",remainingSeconds:v,tierId:l.lastTierId,tierIds:h}}}return e.json({plan:{id:a.plan.id,name:u?.name||a.plan.id,duration:a.plan.duration,brand:u?.brand,tiers:a.plan.tiers.map(d=>{let l=u?.tiers?.find(g=>g.label===d.label);return{id:d.tierId,label:d.label,price:d.price,features:l?.features||[]}})},subscription:i})}catch(n){return console.error("[GET /api/sdk/plan/:planId]",n),n instanceof c?e.status(n.statusCode).json({error:n.message,code:n.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});var k=G;var K=require("express");var F=require("mongodb"),$=I(require("dotenv"));$.default.config();var H=process.env.MONGODB_URI,M=process.env.MONGODB_DB;if(!H)throw new Error("Please define the MONGODB_URI environment variable");if(!M)throw new Error("Please define the MONGODB_DB environment variable");var y=null,N=null;async function V(){if(y&&N)return{client:y,db:N};let t=await F.MongoClient.connect(H),e=t.db(M);return y=t,N=e,{client:t,db:e}}var P=require("crypto");function q(t){return(0,P.createHash)("sha256").update(t).digest("hex")}async function Y(t,e,o){let s=t.headers["x-api-key"];if(!s||typeof s!="string")return e.status(401).json({error:"Missing or invalid x-api-key header",code:"MISSING_API_KEY"});let r=s.trim();if(!r.startsWith("mp_live_")&&!r.startsWith("mp_test_"))return e.status(400).json({error:"Malformed API key",code:"INVALID_API_KEY_FORMAT"});try{let{db:n}=await V(),a=q(r),u=await n.collection("api_keys").findOne({keyHash:a,revokedAt:null});if(!u)return e.status(401).json({error:"Unauthorized: Invalid or revoked API key",code:"UNAUTHORIZED"});n.collection("api_keys").updateOne({_id:u._id},{$set:{lastUsedAt:new Date}}).catch(i=>console.error("Failed to update lastUsedAt",i)),t.userId=u.userId,t.merchantAddress=u.merchantAddress,o()}catch(n){return console.error("API Key Validation Error:",n),e.status(503).json({error:"Authentication service unavailable",code:"AUTH_SERVICE_UNAVAILABLE"})}}var A=(0,K.Router)();function T(t){return/^0x[a-fA-F0-9]{40}$/.test(t)||/^0x[a-fA-F0-9]{64}$/.test(t)}function m(t){return t?j(t)?{ok:!0,merchantAddress:t}:{ok:!1,status:400,error:"Invalid wallet address on API key",code:"INVALID_WALLET_ADDRESS"}:{ok:!1,status:404,error:"No wallet address associated with this key",code:"WALLET_NOT_FOUND"}}A.use(Y);var ue=`
  query MerchantPlans($seller: String!) {
    plans(where: { seller: $seller }) {
      id
    }
  }
`,ce=`
  query PlanMetadata($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      ipfsHash
    }
  }
`,pe=`
  query CheckPlanOwner($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
    }
  }
`,Re=`
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
`,Ae=`
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
`,fe=`
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
`;A.get("/wallet",async(t,e)=>{let{merchantAddress:o}=t,s=m(o);return s.ok?e.json({success:!0,walletAddress:s.merchantAddress}):e.status(s.status).json({error:s.error,code:s.code})});A.get("/plans",async(t,e)=>{let{merchantAddress:o}=t,s=m(o);if(!s.ok)return e.status(s.status).json({error:s.error,code:s.code});try{let r=p(s.merchantAddress),a=((await R(ue,{seller:r})).plans??[]).map(u=>u.id);return e.json({success:!0,plans:a})}catch(r){return console.error("[GET /api/v1/plans]",r),r instanceof c?e.status(r.statusCode).json({error:r.message,code:r.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});A.get("/plans/:id",async(t,e)=>{let{merchantAddress:o}=t,{id:s}=t.params,r=m(o);if(!r.ok)return e.status(r.status).json({error:r.error,code:r.code});if(!s||!T(s))return e.status(400).json({error:"Invalid plan id",code:"INVALID_PLAN_ID"});try{let n=p(r.merchantAddress),a=p(s),i=(await R(ce,{id:a})).plan;if(!i)return e.status(404).json({error:"Plan not found",code:"PLAN_NOT_FOUND"});if(i.seller.id.toLowerCase()!==n)return e.status(403).json({error:"Forbidden: You do not own this plan",code:"FORBIDDEN"});let d=null;try{let l=await fetch(b(i.ipfsHash));d=l.ok?await l.json():null}catch(l){console.warn("Failed to fetch plan metadata from IPFS:",l),d=null}return e.json({success:!0,planId:i.id,metadata:d})}catch(n){return console.error("[GET /api/v1/plans/:id]",n),n instanceof c?e.status(n.statusCode).json({error:n.message,code:n.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});A.get("/plans/:id/subscribers",async(t,e)=>{let{merchantAddress:o}=t,{id:s}=t.params,r=m(o);if(!r.ok)return e.status(r.status).json({error:r.error,code:r.code});if(!s||!T(s))return e.status(400).json({error:"Invalid plan id",code:"INVALID_PLAN_ID"});try{let n=p(r.merchantAddress),a=p(s),u=await R(pe,{id:a});if(!u.plan)return e.status(404).json({error:"Plan not found",code:"PLAN_NOT_FOUND"});if(u.plan.seller.id.toLowerCase()!==n)return e.status(403).json({error:"Forbidden: You do not own this plan",code:"FORBIDDEN"});let d=((await R(Re,{planId:a})).subscriptionStates??[]).map(l=>({subscriptionId:l.id,buyerAddress:l.subscriber.id,buyerData:l.lastBuyerData,status:l.status,lastEndTime:l.lastEndTime,totalSpent:l.totalSpent}));return e.json({success:!0,subscribers:d})}catch(n){return console.error("[GET /api/v1/plans/:id/subscribers]",n),n instanceof c?e.status(n.statusCode).json({error:n.message,code:n.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});A.get("/plans/:id/analytics",async(t,e)=>{let{merchantAddress:o}=t,{id:s}=t.params,r=m(o);if(!r.ok)return e.status(r.status).json({error:r.error,code:r.code});if(!s||!T(s))return e.status(400).json({error:"Invalid plan id",code:"INVALID_PLAN_ID"});try{let n=p(r.merchantAddress),a=p(s),i=(await R(Ae,{id:a})).plan;return i?i.seller.id.toLowerCase()!==n?e.status(403).json({error:"Forbidden: You do not own this plan",code:"FORBIDDEN"}):e.json({success:!0,analytics:{planId:i.id,active:i.active,subscriptionCount:i.subscriptionCount,totalGrossVolume:i.totalGrossVolume,totalFeesCollected:i.totalFeesCollected,netRevenue:(BigInt(i.totalGrossVolume)-BigInt(i.totalFeesCollected)).toString(),lastSubscriptionAt:i.lastSubscriptionAt,createdAt:i.createdAt,updatedAt:i.updatedAt,tiers:i.tiers}}):e.status(404).json({error:"Plan not found",code:"PLAN_NOT_FOUND"})}catch(n){return console.error("[GET /api/v1/plans/:id/analytics]",n),n instanceof c?e.status(n.statusCode).json({error:n.message,code:n.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});A.get("/analytics",async(t,e)=>{let{merchantAddress:o}=t,s=m(o);if(!s.ok)return e.status(s.status).json({error:s.error,code:s.code});try{let r=p(s.merchantAddress),a=(await R(fe,{id:r})).seller;return a?e.json({success:!0,analytics:{sellerId:a.id,planCount:a.planCount,activePlanCount:a.activePlanCount,subscriptionCount:a.subscriptionCount,totalGrossRevenue:a.totalGrossRevenue,totalNetRevenue:a.totalNetRevenue,totalFeeContributed:a.totalFeeContributed}}):e.json({success:!0,analytics:{sellerId:r,planCount:0,activePlanCount:0,subscriptionCount:0,totalGrossRevenue:"0",totalNetRevenue:"0",totalFeeContributed:"0"}})}catch(r){return console.error("[GET /api/v1/analytics]",r),r instanceof c?e.status(r.statusCode).json({error:r.message,code:r.code}):e.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})}});var W=A;z.default.config();var f=(0,C.default)(),Q=process.env.PORT||3001;f.use((0,X.default)({origin:"*"}));f.use(C.default.json());f.use((t,e,o)=>{console.log(`[${new Date().toISOString()}] ${t.method} ${t.originalUrl}`),o()});f.use("/api/sdk",k);f.use("/api/v1",W);f.get("/health",(t,e)=>{e.json({status:"OK",timestamp:new Date})});f.use((t,e,o,s)=>{console.error("Unhandled Server Error:",t),o.status(500).json({error:"Internal Server Error",code:"INTERNAL_SERVER_ERROR"})});f.listen(Q,()=>{console.log(`\u26A1 Arca SDK & Consumer API Gateway is running on port ${Q}`)});

"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity, Mail, Github, Linkedin, Twitter, ChevronDown, ArrowRight } from "lucide-react";
import Lenis from 'lenis';
import { motion, AnimatePresence } from "framer-motion";
import BootScreen from "@/components/BootScreen";
import CardSwap, { Card } from "@/components/CardSwap";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal";

import AppPreview from "@/components/AppPreview";
import ApiShowcase from "@/components/ApiShowcase";

const SubscriptionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="3" width="16" height="18" rx="3.5" strokeWidth="2.2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="13" y2="12" />
    <circle cx="16" cy="16" r="3" fill="#050505" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

const SettlementIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 8l9-5 9 5H3z" />
    <line x1="6" y1="11" x2="6" y2="17" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="18" y1="11" x2="18" y2="17" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <line x1="3" y1="17" x2="21" y2="17" />
    <path d="M4 17v2h16v-2" />
  </svg>
);

const Soc2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-[#3b82f6]"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" />
    <path d="M12 14v-3" />
  </svg>
);

const MicaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-[#3b82f6]"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </svg>
);

const BsaAmlIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-[#3b82f6]"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20M5.8 5.8l12.4 12.4M5.8 18.2L18.2 5.8" />
  </svg>
);

const GdprIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-[#3b82f6]"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LandingPage() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [booted, setBooted] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState("Overview");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />

      <AnimatePresence>
        {booted && (
          <motion.div
            key="page"
            className="dark relative w-full bg-[#000000] font-space-grotesk overflow-x-hidden"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
      
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-[#000000]">
      
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          
          {/* Simple dark overlay */}
          <div className="absolute inset-0 bg-[#000000]/60 z-10" />
          
          {/* Seamless bottom fade to match the next section's background */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-[#000000] via-[#000000]/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Navbar Implementation - Clean */}
        <header 
          className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 lg:px-10 lg:py-6 flex items-center justify-between transition-all duration-300 ease-in-out bg-transparent ${
            isNavVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image src="/logo.png" alt="Arca Logo" fill className="object-contain dark:invert" unoptimized />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#ffffff] font-serif">Arca</span>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/login" className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#ffffff]/10 px-6 text-sm font-semibold text-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] transition-colors">
              <span>Launch App</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-center w-full px-8 sm:px-16 lg:pl-36 lg:pr-12 xl:pl-64 xl:pr-16 pb-20 pt-32 lg:pt-40">
          <div className="flex flex-col items-start text-left max-w-4xl w-full">
            
            {/* Left Side: Typography & CTAs */}
            <div className="flex flex-col items-start text-left relative z-30 w-full">
              <div className="flex flex-col mb-10 relative">
                <motion.h1 
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] text-foreground font-serif"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="block">USDC-Native</span>
                  <span className="block text-primary">Membership</span>
                  <span className="block">Infrastructure.</span>
                </motion.h1>
                
                <motion.p 
                  className="mt-8 text-base sm:text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  Integrate beautiful, predictable subscription checkouts in seconds. Zero friction, drop-in React SDK widgets powered by Circle Programmable Wallets, CCTP, and the Arc blockchain.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <Link href="/login" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md">
                  <span>Open Console</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5px]" />
                </Link>
                <Link href="/docs" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full border border-border bg-card/35 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <span>Explore Docs</span>
                </Link>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div 
                className="mt-14 flex items-center gap-6 opacity-60"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              >
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Powered by</span>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-foreground tracking-wide">Circle</span>
                  <span className="text-sm font-bold text-foreground tracking-wide">Arc</span>
                  <span className="text-sm font-bold text-foreground tracking-wide">CCTP</span>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>


      {/* Protocol Features Section */}
      <section id="features" className="relative w-full bg-[#000000] py-24 lg:py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 flex flex-col gap-6 max-w-2xl w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Protocol Architecture</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] font-serif">
            USDC-Native. <br/><span className="text-[#3b82f6]">Arc-Powered.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Arca is the membership infrastructure for the Arc network. By combining Circle&apos;s Programmable Wallets with CCTP bridging, we&apos;ve eliminated gas complexity, allowing users to pay entirely in USDC while developers enjoy sub-second finality.
          </p>
          <div className="grid grid-cols-2 gap-8 mt-4 lg:mt-8">
             <div className="flex flex-col gap-2 border-l border-[#ffffff]/10 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffffff]">USDC Gas</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-semibold">Native Execution</span>
             </div>
             <div className="flex flex-col gap-2 border-l border-[#ffffff]/10 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffffff]">CCTP</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-semibold">Unified Liquidity</span>
             </div>
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:flex flex-1 w-full items-center justify-center relative mt-16 lg:mt-0 h-112.5 lg:h-150 pointer-events-none"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="relative w-[320px] h-50 z-10 lg:right-10 pointer-events-auto perspective-[2000px]">
            <CardSwap width={320} height={200} cardDistance={40} verticalDistance={50}>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">CCTP Bridge</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">15+ Chains</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Bridging Fee</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">0.<span className="text-[#a1a1aa]">00</span> <span className="text-xl text-[#a1a1aa] font-medium tracking-normal">USDC</span></div>
                </div>
              </Card>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">MPC Wallets</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">Non-Custodial</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Key Management</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">Circle<span className="text-xl text-[#a1a1aa] font-medium tracking-normal ml-1">SDK</span></div>
                </div>
              </Card>
              <Card className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#3b82f6]"/> 
                    <span className="text-sm font-semibold tracking-wide">Execution</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 bg-[#ffffff]/5 border border-[#ffffff]/10 px-2.5 py-1 rounded-full">Arc Network</span>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs font-semibold tracking-wide mb-1">Finality</div>
                  <div className="text-4xl font-bold tracking-tighter text-[#ffffff]">&lt; 1.<span className="text-[#a1a1aa]">0s</span></div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="compliance" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden border-t border-[#ffffff]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,#3b82f608,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Content column */}
            <div className="flex flex-col lg:col-span-4 max-w-md">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.18em] mb-4">Enterprise Trust</span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-medium tracking-tight text-white leading-[1.1] font-serif">
                Security. Compliance.<br/>Reliability. Built-in.
              </h2>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed font-normal">
                ARCA meets the highest standards of security and compliance so you can build with confidence.
              </p>
              <Link href="https://arca.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] text-sm font-semibold mt-6 transition-colors group">
                <span>View security</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
            
            {/* Right Horizontal Layout column */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-0 w-full relative">
              {[
                { name: "SOC 2 Type II", desc: "MPC Insulated", icon: Soc2Icon },
                { name: "EU MiCA", desc: "Circle USDC Rails", icon: MicaIcon },
                { name: "BSA / AML", desc: "OFAC Filtered", icon: BsaAmlIcon },
                { name: "GDPR Compliant", desc: "Zero PII Ledger", icon: GdprIcon },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col items-center text-center px-4 ${
                      idx !== 0 ? "md:border-l md:border-white/10" : ""
                    }`}
                  >
                    <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5 transition-all duration-300 mb-5">
                      <Icon className="h-6 w-6 text-[#3b82f6] stroke-[2px]" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight">{item.name}</span>
                    <span className="text-zinc-500 text-xs font-semibold mt-1">{item.desc}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <AppPreview />
      </motion.div>

      {/* Multi-Chain Bridge Showcase Section */}
      <section id="bridge" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20">
        
        <motion.div
          className="relative z-10 flex flex-col items-center text-center mb-16 gap-6"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-zinc-300 text-xs font-semibold tracking-wide">Interoperability Layer</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] max-w-4xl font-serif">
            Bridge USDC <br/><span className="text-zinc-500">Across Every Chain</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl max-w-3xl mt-4">
            Arca integrates natively with Circle CCTP to provide seamless, secure, and instant USDC transfers across 15+ testnet ecosystems. No wrappers, no compromises.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {[
            { name: "Arc Testnet", icon: "/arc-logo.png" },
            { name: "Base Sepolia", icon: "/base-sepolia.png" },
            { name: "Arbitrum Sepolia", icon: "https://ethglobal.storage/static/faucet/arbitrum-sepolia.png" },
            { name: "Avalanche Fuji", icon: "/avalanche-logo.png" },
            { name: "ETH Sepolia", icon: "/seoplia-logo.png" },
            { name: "OP Sepolia", icon: "/op-logo.png" },
            { name: "Polygon Amoy", icon: "/polygon-logo.png" },
            { name: "Unichain", icon: "https://ethglobal.storage/static/faucet/unichain.png" },
            { name: "Linea Sepolia", icon: "https://ethglobal.storage/static/faucet/linea-sepolia.png" },
            { name: "Sei Testnet", icon: "/sei-logo.png" },
            { name: "World Chain", icon: "https://ethglobal.storage/static/faucet/world-chain-sepolia.png" },
            { name: "Ink Testnet", icon: "https://inkonchain.com/logo/ink-mark-light.webp" },
            { name: "XDC Apothem", icon: "/xdc-faucet-logo.png" },
            { name: "Monad Testnet", icon: "https://ethglobal.storage/static/faucet/monad-testnet.png" },
            { name: "Codex Testnet", icon: "/codex-logo.png" },
          ].map((chain, i) => (
            <div 
              key={i} 
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#ffffff]/5 transition-colors"
            >
              <div className="relative w-10 h-10 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                 <Image src={chain.icon} alt={chain.name} fill className="object-contain" />
              </div>
              <span className="text-xs font-semibold text-zinc-400 text-center">
                {chain.name}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
           <Link href="/dashboard/bridge" className="flex h-14 px-8 items-center justify-center gap-2 rounded-full bg-[#ffffff] text-sm font-bold text-[#000000] hover:opacity-90 transition-opacity">
              <span>Open Bridge Console</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
           </Link>
        </motion.div>
      </section>

      {/* Protocol Economics Section */}
      <section className="relative w-full bg-[#000000] py-24 lg:py-40 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20 relative z-10">
          <motion.div
            className="flex-1 flex flex-col gap-6 w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
              <span className="text-zinc-300 text-xs font-semibold tracking-wide">Fee Transparency</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#ffffff] leading-[1.1] font-serif">
              Pure Efficiency. <br/>
              <span className="text-[#3b82f6]">Zero Waste.</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4 max-w-xl">
              Traditional payment rails eat into your margins with hidden fees and expensive gas costs. Arca redefines protocol economics.
            </p>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Coins className="w-32 h-32 text-[#3b82f6] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#3b82f6] transition-colors duration-500">$0.00</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Fee</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Eliminate secondary gas tokens. Arc uses USDC as native gas for predictable, low-cost execution.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Zap className="w-32 h-32 text-[#3b82f6] -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-[#ffffff] mb-4 group-hover:text-[#3b82f6] transition-colors duration-500">Instant</div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Sub-Second Finality</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Subscriptions and bridges confirm in under 1 second, providing a true Web2-like experience.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-[#050505] border border-[#ffffff]/10 hover:bg-[#0a0a0f] hover:border-[#3b82f6]/30 transition-all duration-500 md:col-span-2"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-[#3b82f6]/0 via-[#3b82f6]/5 to-[#3b82f6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Globe className="w-48 h-48 text-[#3b82f6] -mr-16 -mt-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10 group-hover:border-[#3b82f6]/30 transition-colors duration-500">
                     <Globe className="h-6 w-6 text-[#ffffff] group-hover:text-[#3b82f6] transition-colors duration-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-[#ffffff]">Unified Liquidity</div>
                </div>
                <h4 className="text-xl font-bold text-[#ffffff] mb-2 tracking-tight">Native Circle CCTP Integration</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-lg">No wrapped assets. Move canonical USDC seamlessly between Ethereum, Base, Polygon, and 15+ others via official burn-and-mint logic.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section id="developers" className="relative w-full bg-[#000000] py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center relative perspective-[2000px]"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
          <Terminal className="bg-[#050505] border border-[#ffffff]/10 shadow-2xl h-[520px] w-full max-w-3xl">
            <TypingAnimation delay={500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono">
              &gt; npm install arca-react
            </TypingAnimation>
            <AnimatedSpan delay={1500} className="text-[#3b82f6] text-xs sm:text-sm font-mono mt-2 block">
              ✔ Package installed successfully
            </AnimatedSpan>
            
            <TypingAnimation delay={2500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono mt-6 block">
              &gt; cat components/Pricing.tsx
            </TypingAnimation>
            
            <AnimatedSpan delay={3500} className="text-zinc-300 text-xs sm:text-sm font-mono mt-2 block whitespace-pre-wrap leading-relaxed">
              <span className="text-[#ff7b72]">import</span> {'{'} <span className="text-[#d2a8ff]">ArcaPricingTable</span> {'}'} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">&apos;arca-react&apos;</span>;
              <br/><br/>
              <span className="text-[#ff7b72]">export default function</span> <span className="text-[#d2a8ff]">Page</span>() {'{'}
              <br/>
              {'  '}<span className="text-[#ff7b72]">return</span> (
              <br/>
              {'    '}&lt;<span className="text-[#7ee787]">ArcaPricingTable</span> 
              <br/>
              {'      '}planId=<span className="text-[#a5d6ff]">&quot;0x123...&quot;</span> 
              <br/>
              {'      '}userId=<span className="text-[#a5d6ff]">&quot;user_1&quot;</span> 
              <br/>
              {'    '}/&gt;
              <br/>
              {'  '});
              <br/>
              {'}'}
            </AnimatedSpan>
          </Terminal>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col gap-6 max-w-2xl w-full mt-16 lg:mt-0"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-full w-fit mb-2">
            <span className="text-[#3b82f6] text-xs font-semibold tracking-wide">Drop-in Checkout SDK</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] leading-tight font-serif">
            One-Click Payments. <br/><span className="text-[#3b82f6]">Integrates in Seconds.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Arca offers a zero-friction, pre-built checkout widget for your client application. Drop in a single React component to accept USDC subscriptions instantly, with automatic wallet provisioning, passkey security, native bridging, and real-time access gating.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/docs" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full bg-[#3b82f6] text-sm font-bold text-[#ffffff] hover:opacity-90 transition-opacity">
              <span>Explore SDK Docs</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ApiShowcase />
      </motion.div>

      {/* Infrastructure & Resources Bento Grid Section */}
      <section id="infrastructure" className="relative w-full bg-[#000000] py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 border-t border-white/5 overflow-hidden">
        {/* Subtle radial glow background to blend with other sections */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,#3b82f608,transparent_70%)] pointer-events-none" />
        
        {/* Architectural Grid Background to add premium depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col mb-16 gap-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#3b82f6]">Infrastructure & Resources</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-[#ffffff] font-serif">
              Built for Scale. <br/>Equipped for Developers.
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-base md:text-lg">
              Explore our global network architecture, real-time transaction intelligence layer, and interactive documentation hubs.
            </p>
          </div>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            
            {/* Tile 1: Real-time Analytics (col-span-1 lg:col-span-7) */}
            <div className="relative group overflow-hidden rounded-3xl border border-[#ffffff]/10 bg-[#050505] p-8 lg:p-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 hover:bg-[#07070c] hover:border-[#3b82f6]/20 transition-all duration-500 min-h-[360px] col-span-1 lg:col-span-7">
              {/* Card Inner Glow */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_-20%,#3b82f605,transparent_50%) pointer-events-none" />
              
              <div className="flex flex-col flex-1 max-w-sm relative z-10 justify-between h-full">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3b82f6]">Real-time Analytics</span>
                  <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mt-4 leading-tight font-serif">
                    Data that moves<br/>at the speed of<br/>your business.
                  </h3>
                  <p className="text-zinc-400 text-xs font-medium mt-3 leading-relaxed max-w-[90%]">
                    Real-time insights into payments, subscriptions, settlements, and revenue performance.
                  </p>
                </div>
                
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] text-xs font-semibold mt-8 transition-colors group/link w-fit">
                  <span>Explore analytics</span>
                  <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </div>
              
              {/* Visual Analytics Widget */}
              <div className="flex flex-col gap-4 w-full max-w-[220px] shrink-0 select-none bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative z-10 group-hover:border-[#3b82f6]/10 transition-colors duration-500">
                {/* Volume Chart */}
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Total volume (USD)</span>
                  <span className="text-xl font-bold tracking-tight text-white mt-1">$24,530,890</span>
                  <span className="text-[8px] font-bold text-[#10b981] mt-0.5 flex items-center gap-0.5">
                    ↑ 18.4% <span className="text-zinc-500 font-medium">vs last month</span>
                  </span>
                  
                  {/* Glowing Green line */}
                  <svg className="w-full h-10 stroke-[#10b981] fill-none mt-2" viewBox="0 0 160 50">
                    <defs>
                      <linearGradient id="chart-glow-green-bento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 40 Q 20 25 40 35 T 80 15 T 120 25 T 160 5" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 0 40 Q 20 25 40 35 T 80 15 T 120 25 T 160 5 L 160 50 L 0 50 Z" fill="url(#chart-glow-green-bento)" strokeWidth="0" />
                  </svg>
                </div>
                
                <div className="h-[1px] bg-white/5" />
                
                {/* Success Rate */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Success rate</span>
                    <span className="text-base font-bold tracking-tight text-white mt-0.5">98.72%</span>
                  </div>
                  
                  <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="100" strokeDashoffset="12.8" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="100" strokeDashoffset="50" strokeLinecap="round" />
                    </svg>
                    <span className="text-[7px] font-bold text-zinc-400">98%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 2: Global Coverage (col-span-1 lg:col-span-5) */}
            <div className="relative group overflow-hidden rounded-3xl border border-[#ffffff]/10 bg-[#050505] p-8 lg:p-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 hover:bg-[#07070c] hover:border-[#3b82f6]/20 transition-all duration-500 min-h-[360px] col-span-1 lg:col-span-5">
              {/* Card Inner Glow */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_-20%,#3b82f605,transparent_50%) pointer-events-none" />
              
              <div className="flex flex-col flex-1 max-w-sm relative z-10 justify-between h-full">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3b82f6]">Global Coverage</span>
                  <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mt-4 leading-tight font-serif">
                    A truly global<br/>infrastructure.
                  </h3>
                  <p className="text-zinc-400 text-xs font-medium mt-3 leading-relaxed max-w-[90%]">
                    Local presence. Global reach. Built to support businesses and users everywhere.
                  </p>
                </div>
                
                <Link href="https://arca.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] text-xs font-semibold mt-8 transition-colors group/link w-fit">
                  <span>View all regions</span>
                  <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </div>
              
              {/* Minimalist Globe graphic */}
              <div className="relative w-full max-w-[160px] h-[160px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500 shrink-0 mx-auto select-none pointer-events-none relative z-10">
                <Image src="/globle.png" alt="Global Coverage" fill className="object-contain" />
              </div>
            </div>

            {/* Tile 3: Interactive Developer Documentation (col-span-1 lg:col-span-12) */}
            <div className="relative overflow-hidden rounded-3xl border border-[#ffffff]/10 bg-[#050505] p-8 lg:p-10 col-span-1 lg:col-span-12">
              {/* Card Inner Glow */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_-10%,#3b82f603,transparent_40%) pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
                
                {/* Left Side: Sidebar documentation context */}
                <div className="lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3b82f6]">Documentation Hub</span>
                    <h3 className="text-3xl font-normal tracking-tight text-white mt-4 leading-tight font-serif">
                      Everything you need.<br/>All in one place.
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium mt-4 leading-relaxed max-w-sm">
                      From drop-in pricing tables to deep JSON REST references, our interactive guides help you ship compliant billing lifecycles in minutes.
                    </p>
                  </div>
                  
                  {/* Desktop tabs menu */}
                  <div className="hidden lg:flex flex-col gap-1 mt-8 max-w-xs pr-4 border-r border-white/5">
                    {[
                      { id: "Overview", label: "Overview" },
                      { id: "Quickstart", label: "Quickstart" },
                      { id: "API Reference", label: "API Reference" },
                      { id: "Guides", label: "Guides" },
                      { id: "SDKs", label: "SDKs" },
                      { id: "Webhooks", label: "Webhooks" },
                      { id: "Changelog", label: "Changelog" }
                    ].map((tab) => {
                      const isActive = activeDocTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDocTab(tab.id)}
                          className={`flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
                            isActive 
                              ? "bg-white/5 text-[#3b82f6] pl-5" 
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Mobile tabs menu */}
                  <div className="flex lg:hidden gap-1.5 overflow-x-auto py-4 mt-6 no-scrollbar shrink-0">
                    {[
                      { id: "Overview", label: "Overview" },
                      { id: "Quickstart", label: "Quickstart" },
                      { id: "API Reference", label: "API" },
                      { id: "Guides", label: "Guides" },
                      { id: "SDKs", label: "SDKs" },
                      { id: "Webhooks", label: "Webhooks" },
                      { id: "Changelog", label: "Changelog" }
                    ].map((tab) => {
                      const isActive = activeDocTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDocTab(tab.id)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                            isActive 
                              ? "bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20" 
                              : "bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Active tab details and structural sub-cards */}
                <div className="lg:col-span-8 flex flex-col justify-center min-h-[300px] lg:pl-8">
                  {(() => {
                    const currentTab = [
                      {
                        id: "Overview",
                        title: "Overview",
                        desc: "ARCA provides the financial infrastructure APIs you need to build scalable, compliant, and reliable commerce experiences.",
                        cards: [
                          { title: "Subscriptions API", desc: "Manage plans, customers, and billing workflows.", icon: SubscriptionsIcon },
                          { title: "Settlement API", desc: "Move money globally with stablecoin rails.", icon: SettlementIcon }
                        ]
                      },
                      {
                        id: "Quickstart",
                        title: "Quickstart",
                        desc: "Deploy your first payment button and provision a merchant wallet in less than five minutes with our quickstart template.",
                        cards: [
                          { title: "React Starter", desc: "Clone the Next.js starter repository.", icon: Zap },
                          { title: "Deploy Script", desc: "One-click deployment script to Vercel.", icon: ArrowUpRight }
                        ]
                      },
                      {
                        id: "API Reference",
                        title: "API Reference",
                        desc: "Deep dive into our robust JSON REST APIs for programmatically triggering transfers, managing plans, and auditing webhooks.",
                        cards: [
                          { title: "REST Endpoints", desc: "Explore secure POST and GET endpoints.", icon: LayoutGrid },
                          { title: "Auth Header", desc: "Read about Bearer token security schemes.", icon: Shield }
                        ]
                      },
                      {
                        id: "Guides",
                        title: "Guides",
                        desc: "Step-by-step walkthroughs to design custom subscriber onboarding flows, trial periods, and tier upgrades.",
                        cards: [
                          { title: "Tier Upgrades", desc: "Implement prorated billing mechanics.", icon: Globe },
                          { title: "Trial Flows", desc: "Configure zero-upfront trial periods.", icon: Activity }
                        ]
                      },
                      {
                        id: "SDKs",
                        title: "SDKs",
                        desc: "Pre-packaged TypeScript, Go, and Python libraries to abstract wallet operations, gas relays, and event validations.",
                        cards: [
                          { title: "TypeScript SDK", desc: "Import direct browser client wrappers.", icon: Mail },
                          { title: "Go Library", desc: "Integrate high-speed server execution.", icon: Zap }
                        ]
                      },
                      {
                        id: "Webhooks",
                        title: "Webhooks",
                        desc: "Subscribe to transaction-state change events and instantly deliver updates to your database upon successful bridge settlement.",
                        cards: [
                          { title: "Webhook Events", desc: "Listen for charge.succeeded and bridge.completed.", icon: Globe },
                          { title: "Payload Validation", desc: "Verify cryptographic SHA-256 signatures.", icon: Shield }
                        ]
                      },
                      {
                        id: "Changelog",
                        title: "Changelog",
                        desc: "Track the latest protocol upgrades, new chain integrations, and security patches for our relayer nodes.",
                        cards: [
                          { title: "v2.4 Release", desc: "Multi-party computation enhancements.", icon: Shield },
                          { title: "Sei Support", desc: "Seamless Sei Network testnet bridging.", icon: Zap }
                        ]
                      }
                    ].find(t => t.id === activeDocTab) || {
                      title: "Overview",
                      desc: "ARCA provides the financial infrastructure APIs you need.",
                      cards: []
                    };
                    
                    return (
                      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        <div>
                          <h4 className="text-xl font-bold tracking-tight text-white">{currentTab.title}</h4>
                          <p className="text-zinc-400 text-xs font-semibold leading-relaxed mt-2.5 max-w-xl">{currentTab.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          {currentTab.cards.map((card, i) => {
                            const IconComponent = card.icon;
                            return (
                              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 hover:bg-[#09090e] hover:border-[#3b82f6]/20 transition-all duration-300 items-center">
                                <div className="h-10 w-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                                  <IconComponent className="h-5 w-5 stroke-[2.2]" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">{card.title}</span>
                                  <span className="text-zinc-400 text-[10px] font-semibold leading-normal mt-1">{card.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Link href="https://arca.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] text-xs font-semibold mt-4 transition-colors group/link w-fit">
                          <span>Go to documentation</span>
                          <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                        </Link>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-[#000000] pt-24 pb-12 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden border-t border-white/5">
        
        {/* Subtle background glow to blend with the rest of the page */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#3b82f604,transparent_50%)] pointer-events-none" />
        
        {/* Abstract thin curved network arcs in the background - matching the uploaded image */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 lg:opacity-60 overflow-hidden">
          <svg className="absolute w-[200%] h-[200%] lg:w-[150%] lg:h-[150%] top-[-30%] left-[-25%] stroke-white/[0.04] fill-none" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 500 C 300 200, 700 250, 1000 150" strokeWidth="0.75" />
            <path d="M 0 420 C 400 100, 600 350, 1000 100" strokeWidth="0.75" />
            <path d="M 0 350 C 250 50, 800 200, 1000 300" strokeWidth="0.75" />
            <path d="M 0 280 C 500 450, 700 50, 1000 220" strokeWidth="0.75" />
            
            {/* Small glowing dots placed precisely on key intersection points */}
            <circle cx="280" cy="355" r="1.5" className="fill-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <circle cx="510" cy="275" r="2" className="fill-[#3b82f6]/60 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <circle cx="740" cy="205" r="1.5" className="fill-white/30" />
            <circle cx="890" cy="245" r="2" className="fill-white/50" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
            
            {/* Left Block: Brand, CTA, and Description */}
            <div className="flex flex-col gap-6 lg:col-span-5 pr-0 lg:pr-8">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="Arca Logo" fill className="object-contain dark:invert" unoptimized />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#ffffff] font-serif">Arca</span>
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-4 leading-[1.15] font-serif">
                  The future of commerce <br/>runs on <span className="text-[#3b82f6]">ARCA</span>.
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                  Integrate beautiful, predictable USDC subscriptions in seconds. Zero friction checkouts powered by Circle MPC wallets and unified liquidity.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-zinc-200 transition-all duration-300 shadow-md">
                  Start building
                </Link>
                <Link href="https://arca.vercel.app/docs" target="_blank" className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/5 transition-all duration-300">
                  Explore Docs
                </Link>
              </div>
            </div>

            {/* Right Block: Platform, Developers, Stay Updated */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:col-span-7">
              
              {/* Platform Column */}
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Platform</h4>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Subscriptions</Link>
                  <Link href="/dashboard/wallet" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Settlement</Link>
                  <Link href="/dashboard/smart-bridge" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Orchestration</Link>
                  <Link href="/dashboard/autopay" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Treasury</Link>
                  <Link href="#features" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Pricing</Link>
                </div>
              </div>

              {/* Developers Column */}
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Developers</h4>
                <div className="flex flex-col gap-3">
                  <Link href="https://arca.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Documentation</Link>
                  <Link href="https://arca.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">API Reference</Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">SDKs / GitHub</Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Changelog</Link>
                  <Link href="https://testnet.arcscan.net" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Status</Link>
                </div>
              </div>

              {/* Newsletter & Socials Column */}
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Stay updated</h4>
                <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                  Get updates on new products, features, and more.
                </p>
                <div className="relative flex items-center w-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 rounded-lg overflow-hidden focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/10 mt-1">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-transparent px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 outline-none"
                  />
                  <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black hover:bg-zinc-200 transition-colors mr-1 shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Social Media Links */}
                <div className="flex items-center gap-4 mt-2">
                  <Link href="https://twitter.com" target="_blank" className="text-zinc-400 hover:text-white transition-colors duration-200">
                    <Twitter className="h-4 w-4" />
                  </Link>
                  <Link href="https://linkedin.com" target="_blank" className="text-zinc-400 hover:text-white transition-colors duration-200">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-zinc-400 hover:text-white transition-colors duration-200">
                    <Github className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Copyright & Selector Bar */}
          <div className="relative pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <span className="text-zinc-500 text-xs font-medium">
                © 2026 ARCA. All rights reserved.
              </span>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors">Privacy</Link>
                <Link href="#" className="text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors">Terms</Link>
                <Link href="#" className="text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors">Security</Link>
              </div>
            </div>
            
            <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-medium transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>English</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

        </div>
      </footer>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
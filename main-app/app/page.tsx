"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Zap, Shield, Globe, Coins, Activity, Mail, Github, Linkedin, Twitter, ChevronDown, ArrowRight, Check, Clock, ShieldCheck, Code2, RefreshCw, MoreHorizontal, Calendar, User, Wallet, Package, Fingerprint, Sliders, Lock, Key } from "lucide-react";
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
    className="h-6 w-6 text-ring"
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
    className="h-6 w-6 text-ring"
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
    className="h-6 w-6 text-ring"
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
    className="h-6 w-6 text-ring"
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
  const [activeSecurityTab, setActiveSecurityTab] = useState("passkey");

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
            className="dark relative w-full bg-background font-space-grotesk overflow-x-hidden"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
      
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background">
      
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
          <div className="absolute inset-0 bg-background/60 z-10" />
          
          {/* Seamless bottom fade to match the next section's background */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />
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
            <span className="text-xl font-bold tracking-tight text-foreground font-serif">Arca</span>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/login" className="flex h-10 items-center justify-center gap-2 rounded-full bg-foreground/10 px-6 text-sm font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors">
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
                <Link href="/login" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full bg-ring text-white font-semibold text-sm hover:bg-ring/90 transition-colors">
                  <span>Open Console</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5px]" />
                </Link>
                <Link href="/docs" className="flex h-12 px-6 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors">
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
      <section id="features" className="relative w-full bg-background py-24 lg:py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 flex flex-col gap-6 max-w-2xl w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >

          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-foreground font-serif">
            USDC-Native. <br/><span className="text-ring">Arc-Powered.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Arca is the membership infrastructure for the Arc network. By combining Circle&apos;s Programmable Wallets with CCTP bridging, we&apos;ve eliminated gas complexity, allowing users to pay entirely in USDC while developers enjoy sub-second finality.
          </p>
          <div className="grid grid-cols-2 gap-8 mt-4 lg:mt-8">
             <div className="flex flex-col gap-2 border-l border-border/40 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">USDC Gas</span>
                <span className="text-zinc-500 text-xs sm:text-sm font-semibold">Native Execution</span>
             </div>
             <div className="flex flex-col gap-2 border-l border-border/40 pl-4 lg:pl-6">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">CCTP</span>
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
              <Card className="bg-card border border-border/40 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-ring"/> 
                    <span className="text-sm font-semibold tracking-wide">CCTP Bridge</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border/40 px-2.5 py-1 rounded-full">15+ Chains</span>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-semibold tracking-wide mb-1">Bridging Fee</div>
                  <div className="text-4xl font-bold tracking-tighter text-foreground">0.<span className="text-muted-foreground/60">00</span> <span className="text-xl text-muted-foreground/60 font-medium tracking-normal">USDC</span></div>
                </div>
              </Card>
              <Card className="bg-card border border-border/40 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-ring"/> 
                    <span className="text-sm font-semibold tracking-wide">MPC Wallets</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border/40 px-2.5 py-1 rounded-full">Non-Custodial</span>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-semibold tracking-wide mb-1">Key Management</div>
                  <div className="text-4xl font-bold tracking-tighter text-foreground">Circle<span className="text-xl text-muted-foreground/60 font-medium tracking-normal ml-1">SDK</span></div>
                </div>
              </Card>
              <Card className="bg-card border border-border/40 shadow-2xl rounded-2xl flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-foreground">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-ring"/> 
                    <span className="text-sm font-semibold tracking-wide">Execution</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border/40 px-2.5 py-1 rounded-full">Arc Network</span>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-semibold tracking-wide mb-1">Finality</div>
                  <div className="text-4xl font-bold tracking-tighter text-foreground">&lt; 1.<span className="text-muted-foreground/60">0s</span></div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="compliance" className="relative w-full bg-background py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Content column */}
            <div className="flex flex-col lg:col-span-4 max-w-md">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.18em] mb-4">Enterprise Trust</span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-medium tracking-tight text-foreground leading-[1.1] font-serif">
                Security. Compliance.<br/>Reliability. Built-in.
              </h2>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed font-normal">
                ARCA meets the highest standards of security and compliance so you can build with confidence.
              </p>
              <Link href="https://arca7.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-ring hover:text-ring/80 text-sm font-semibold mt-6 transition-colors group">
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
                      idx !== 0 ? "md:border-l md:border-border/10" : ""
                    }`}
                  >
                    <div className="h-14 w-14 rounded-full border border-border/40 flex items-center justify-center bg-muted hover:border-ring/40 hover:bg-ring/5 transition-all duration-300 mb-5">
                      <Icon className="h-6 w-6 text-ring stroke-[2px]" />
                    </div>
                    <span className="text-foreground font-bold text-sm tracking-tight">{item.name}</span>
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

      {/* Interactive Modular Wallet Security Section */}
      <section id="wallet-security" className="relative w-full bg-background py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header Area */}
          <div className="flex flex-col mb-16 max-w-3xl">
            <span className="text-ring text-xs font-bold uppercase tracking-[0.2em] mb-4">Secure By Design</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] font-serif">
              Modular wallets. <br/>Security that adapts <span className="text-ring">to you.</span>
            </h2>
            <p className="text-zinc-400 font-medium text-base sm:text-lg mt-6 leading-relaxed">
              You own your assets. We provide the tools to keep them protected — your way, not ours.
            </p>
          </div>

          {/* Bento-style Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Vertical Interactive Options (col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {[
                {
                  id: "passkey",
                  title: "Passkey Login",
                  tag: "Recommended",
                  desc: "Passwordless, phishing-resistant sign-in with biometrics or device PIN.",
                  icon: Fingerprint,
                },
                {
                  id: "security-key",
                  title: "Security Key",
                  desc: "Use a hardware key (USB or NFC) for strong, physical-layer protection.",
                  icon: Key,
                },
                {
                  id: "recovery",
                  title: "Recovery Phrase",
                  desc: "Back up your wallet with a standard cryptographic seed phrase you control.",
                  icon: Shield,
                },
                {
                  id: "mfa",
                  title: "Multi-factor Authentication",
                  desc: "Add an extra verification step (OTP, Authenticator) for critical smart contract actions.",
                  icon: ShieldCheck,
                },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeSecurityTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSecurityTab(tab.id)}
                    className={`group text-left flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 relative ${
                      isActive
                        ? "bg-muted/40 border-ring/30 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)]"
                        : "bg-muted/10 border-border/10 hover:bg-muted/20 hover:border-border/30"
                    }`}
                  >
                    {/* Left colored accent bar matching screenshot */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] rounded-l-2xl transition-all duration-300 ${
                      isActive ? "bg-ring" : "bg-transparent group-hover:bg-zinc-700/30"
                    }`} />

                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-ring/10 text-ring" : "bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300"
                    }`}>
                      <TabIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold tracking-tight transition-colors ${
                          isActive ? "text-foreground" : "text-zinc-400 group-hover:text-zinc-200"
                        }`}>
                          {tab.title}
                        </span>
                        {tab.tag && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-ring bg-ring/10 px-2 py-0.5 rounded-full">
                            {tab.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 leading-relaxed font-medium">
                        {tab.desc}
                      </span>
                    </div>
                    <ArrowRight className={`h-4 w-4 shrink-0 transition-all duration-300 mt-1 ${
                      isActive ? "text-ring translate-x-1" : "text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5"
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Two Bento Cards (col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* Card 1: Secure. Seamless. Self-Custodial (Top Card) */}
              <div className="bg-card border border-border/30 rounded-[2rem] p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-center overflow-hidden min-h-[380px] relative shadow-2xl">
                <div className="flex-1 flex flex-col gap-6 relative z-10 w-full">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                      Secure. Seamless. Self-Custodial.
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      Advanced security standards that protect your assets at every layer.
                    </p>
                  </div>

                  <div className="flex flex-col gap-5 mt-2">
                    {[
                      {
                        title: "Key Isolation",
                        desc: "Your private keys are isolated and never leave your device.",
                        icon: Lock,
                        color: "text-[#a855f7] bg-[#a855f7]/10",
                      },
                      {
                        title: "Transaction Simulation",
                        desc: "Simulate and review transactions before you sign.",
                        icon: LayoutGrid,
                        color: "text-ring bg-ring/10",
                      },
                      {
                        title: "Policy Controls",
                        desc: "Set limits, approvals, and custom security rules.",
                        icon: ShieldCheck,
                        color: "text-[#10b981] bg-[#10b981]/10",
                      },
                    ].map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${feature.color}`}>
                            <FeatureIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground leading-none">{feature.title}</span>
                            <span className="text-xs text-zinc-500 leading-normal font-medium mt-1">{feature.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right/Visual part of Card 1: Beautiful 3D illustration provided by user */}
                <div className="w-full md:w-[320px] lg:w-[350px] aspect-square flex items-center justify-center relative select-none shrink-0">
                  {/* Glowing purple ambient background behind the graphic */}
                  <div className="absolute inset-4 rounded-full bg-ring/10 blur-[60px]" />
                  
                  {/* Embedded Visual Masterpiece (User provided high-quality image) */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center p-2 transition-transform hover:scale-[1.02] duration-500">
                    <Image
                      src="/modular-security.png"
                      alt="Modular Smart Wallet Security Stack"
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: One Wallet. Any Chain. Any App (Bottom Card) */}
              <div className="bg-card/40 border border-border/20 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative shadow-lg min-h-[250px]">
                
                {/* Glowing subtle mesh background in the card */}
                <div className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" className="text-ring" />
                  </svg>
                </div>

                {/* Network world connectivity overlay */}
                <div className="absolute right-0 bottom-0 top-0 w-full md:w-2/3 opacity-[0.08] pointer-events-none select-none">
                  <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" stroke="currentColor">
                    <path d="M150 150 Q 300 80, 450 150 T 750 150" strokeWidth="1.5" strokeDasharray="5 5" className="text-ring"/>
                    <path d="M200 200 Q 400 120, 600 200" strokeWidth="1.5" className="text-ring"/>
                    <circle cx="150" cy="150" r="4" fill="currentColor" className="text-ring" />
                    <circle cx="450" cy="150" r="3" fill="currentColor" className="text-ring" />
                    <circle cx="750" cy="150" r="5" fill="currentColor" className="text-ring" />
                    <circle cx="200" cy="200" r="4" fill="currentColor" className="text-ring" />
                    <circle cx="600" cy="200" r="3" fill="currentColor" className="text-ring" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col gap-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground font-serif">
                      One wallet. Any chain. Any app.
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      Use your modular wallet across all your favorite chains and applications.
                    </p>
                  </div>

                  {/* Chain/Network row icons using real high-fidelity circular logo assets */}
                  <div className="flex items-center gap-3.5 mt-2">
                    {[
                      { name: "Ethereum", icon: "/seoplia-logo.png" },
                      { name: "Arc Network", icon: "/arc-logo.png" },
                      { name: "Avalanche", icon: "/avalanche-logo.png" },
                      { name: "Polygon", icon: "/polygon-logo.png" },
                      { name: "Arbitrum", icon: "/arbitrum-logo.png" },
                    ].map((chain, idx) => (
                      <div key={idx} className="h-10 w-10 rounded-full border border-border/40 bg-zinc-950 p-2 flex items-center justify-center shadow-md relative hover:scale-110 hover:border-ring/50 transition-all duration-300">
                        <Image
                          src={chain.icon}
                          alt={chain.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    ))}
                    <div className="h-10 w-10 rounded-full border border-border/10 bg-zinc-900/50 flex items-center justify-center text-sm font-mono font-bold text-zinc-500 cursor-default">
                      +
                    </div>
                    <div className="text-xs font-mono text-zinc-500 ml-1">
                      and more
                    </div>
                  </div>
                </div>

                {/* Bottom row in Card 2 with Globe access badge */}
                <div className="relative z-10 mt-8 pt-4 border-t border-border/10 flex justify-between items-center w-full">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
                    <Globe className="h-4.5 w-4.5 text-zinc-500" />
                    <span>Global Access</span>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider font-bold text-ring bg-ring/5 border border-ring/10 px-3 py-1 rounded-full uppercase">
                    Available Anywhere, Anytime
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Grid: 4-Column Feature Row with dividers exactly like screenshot */}
          <div className="mt-20 pt-12 border-t border-border/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "You're in control",
                desc: "We never store your private keys or recovery phrases.",
                icon: Lock,
                color: "bg-[#a855f7]/10 text-[#a855f7]",
              },
              {
                title: "Modular & flexible",
                desc: "Add or remove security modules anytime to fit your needs.",
                icon: LayoutGrid,
                color: "bg-ring/10 text-ring",
              },
              {
                title: "Open & interoperable",
                desc: "Built with open standards. Built for the future.",
                icon: Code2,
                color: "bg-[#3b82f6]/10 text-[#3b82f6]",
              },
              {
                title: "Works everywhere",
                desc: "Any chain. Any device. Any application.",
                icon: Globe,
                color: "bg-[#10b981]/10 text-[#10b981]",
              },
            ].map((feature, idx) => {
              const HighlightIcon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-4 group ${
                    idx !== 0 ? "lg:border-l lg:border-border/10 lg:pl-8" : ""
                  }`}
                >
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${feature.color} transition-transform group-hover:scale-105 duration-300`}>
                    <HighlightIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground transition-colors group-hover:text-ring">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Multi-Chain Bridge Showcase Section */}
      <section id="bridge" className="relative w-full bg-background py-24 lg:py-32 px-6 sm:px-12 lg:px-20 z-20">
        
        <motion.div
          className="relative z-10 flex flex-col items-center text-center mb-16 gap-6"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >

          <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-foreground max-w-4xl font-serif">
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
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-background border border-border/40 hover:bg-background/80 transition-colors"
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
           <Link href="/dashboard/bridge" className="flex h-14 px-8 items-center justify-center gap-2 rounded-full bg-ring text-sm font-bold text-white hover:bg-ring/90 transition-colors">
              <span>Open Bridge Console</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
           </Link>
        </motion.div>
      </section>

      {/* Protocol Economics Section */}
      <section className="relative w-full bg-background py-24 lg:py-40 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20 relative z-10">
          <motion.div
            className="flex-1 flex flex-col gap-6 w-full"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >

            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[1.1] font-serif">
              Pure Efficiency. <br/>
              <span className="text-ring">Zero Waste.</span>
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4 max-w-xl">
              Traditional payment rails eat into your margins with hidden fees and expensive gas costs. Arca redefines protocol economics.
            </p>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-background border border-border/40 hover:bg-background/80 hover:border-ring/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Coins className="w-32 h-32 text-ring -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-foreground mb-4 group-hover:text-ring transition-colors duration-500">$0.00</div>
                <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">Native Fee</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Eliminate secondary gas tokens. Arc uses USDC as native gas for predictable, low-cost execution.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-background border border-border/40 hover:bg-background/80 hover:border-ring/30 transition-all duration-500"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Zap className="w-32 h-32 text-ring -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-bold tracking-tighter text-foreground mb-4 group-hover:text-ring transition-colors duration-500">Instant</div>
                <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">Sub-Second Finality</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[90%]">Subscriptions and bridges confirm in under 1 second, providing a true Web2-like experience.</p>
              </div>
            </motion.div>
            
            <motion.div
              className="group relative overflow-hidden p-8 rounded-3xl bg-background border border-border/40 hover:bg-background/80 hover:border-ring/30 transition-all duration-500 md:col-span-2"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-ring/0 via-ring/5 to-ring/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Globe className="w-48 h-48 text-ring -mr-16 -mt-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/40 group-hover:border-ring/30 transition-colors duration-500">
                     <Globe className="h-6 w-6 text-foreground group-hover:text-ring transition-colors duration-500" />
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-foreground">Unified Liquidity</div>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">Native Circle CCTP Integration</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-lg">No wrapped assets. Move canonical USDC seamlessly between Ethereum, Base, Polygon, and 15+ others via official burn-and-mint logic.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section id="developers" className="relative w-full bg-background py-32 z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-6 sm:px-12 lg:px-20 w-full">
          <motion.div
            className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center relative perspective-[2000px]"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
          <Terminal className="bg-background border border-border/40 shadow-2xl h-[520px] w-full max-w-3xl">
            <TypingAnimation delay={500} duration={30} className="text-zinc-500 text-xs sm:text-sm font-mono">
              &gt; npm install arca-react
            </TypingAnimation>
            <AnimatedSpan delay={1500} className="text-ring text-xs sm:text-sm font-mono mt-2 block">
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
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-tight font-serif">
            One-Click Payments. <br/><span className="text-ring">Integrates in Seconds.</span>
          </h2>
          <p className="text-zinc-400 font-medium leading-relaxed text-lg md:text-xl mt-2 lg:mt-4">
            Arca offers a zero-friction, pre-built checkout widget for your client application. Drop in a single React component to accept USDC subscriptions instantly, with automatic wallet provisioning, passkey security, native bridging, and real-time access gating.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/docs" className="flex h-14 w-full sm:w-auto px-8 items-center justify-center gap-2 rounded-full bg-ring text-sm font-bold text-white hover:bg-ring/90 transition-colors">
              <span>Explore SDK Docs</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
            </Link>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Relocated Subscription Showcase Section - High-Fidelity Professional Console Simulator */}
      <section className="relative w-full bg-background py-28 lg:py-36 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start relative z-10">
          
          {/* Left Column: Premium Editorial Typography & Details */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-foreground leading-[1.05] font-serif">
                Subscriptions <br />built for the <span className="text-ring font-semibold">internet</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                Arca is a USDC-native subscription protocol designed for modern applications. Simple to integrate, powerful to scale.
              </p>
            </div>

            {/* Premium Vertical Editorial Benefits List */}
            <div className="flex flex-col gap-8">
              {[
                { number: "01", title: "USDC Native", desc: "Direct, borderless settlements with zero gas complexity. Paid entirely in stablecoins." },
                { number: "02", title: "Flexible Billing", desc: "Predictable subscription checkouts with custom frequencies, trials, and grace periods." },
                { number: "03", title: "Secure by Design", desc: "Smart contract automated renewals, non-custodial custody, and active dunning protection." }
              ].map((item) => (
                <div key={item.number} className="flex gap-6 items-start group">
                  <span className="text-xs font-mono font-bold tracking-widest text-ring/60 pt-1 transition-colors group-hover:text-ring">
                    {item.number}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-foreground tracking-tight">{item.title}</span>
                    <span className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-medium">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-row items-center gap-6 mt-4">
              <Link href="/login" className="flex h-12 px-7 items-center justify-center gap-2 rounded-full bg-ring text-white text-xs font-bold uppercase tracking-wider hover:bg-ring/90 transition-all cursor-pointer shadow-lg shadow-ring/5">
                <span>Start Building</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="text-ring hover:text-ring/80 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer ml-1 transition-colors">
                <span>Explore SDK Docs</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity, State-of-the-Art Interactive Subscription Console */}
          <motion.div
            className="lg:col-span-7 w-full"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div className="flex flex-col gap-8 w-full bg-muted/15 rounded-3xl p-8 sm:p-10 relative overflow-hidden select-none">
              {/* Subtle background visual highlights */}
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[30%] bg-ring rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
              
              {/* Console Header bar */}
              <div className="flex items-center justify-between pb-6 border-b border-border/10">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-ring animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.25em] text-ring uppercase font-bold">LIVE SUBSCRIPTION CONSOLE</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">STATE: ACTIVE_RUN</span>
              </div>

              {/* Console Core Section Layout: Two-Column details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Panel A: Core Plan State & Ledger Table (col-span-7) */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  
                  {/* Active Wallet detail */}
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Onchain Account</span>
                    <span className="text-sm font-mono font-bold text-foreground mt-1 tracking-tight">0x8a3c...7f2e</span>
                  </div>

                  {/* Pricing detail */}
                  <div className="flex items-center gap-4 py-3 px-4 bg-muted/30 rounded-2xl w-fit">
                    <div className="h-10 w-10 rounded-full bg-ring/10 flex items-center justify-center text-ring shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Pro Plan</span>
                        <span className="text-[8px] font-mono font-bold text-ring bg-ring/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Live</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">29.00 USDC / Month</div>
                    </div>
                  </div>

                  {/* Micro Ledger of transactions */}
                  <div className="flex flex-col gap-3 mt-2">
                    <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Payment History Ledger</span>
                    
                    <div className="flex flex-col gap-2">
                      {[
                        { date: "May 25, 2024", hash: "0x4a9d...b38e", amount: "29.00 USDC", status: "Settled" },
                        { date: "Apr 25, 2024", hash: "0x1f2c...d74c", amount: "29.00 USDC", status: "Settled" }
                      ].map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all text-[11px] font-mono text-zinc-300">
                          <span className="text-zinc-500">{tx.date}</span>
                          <span className="font-semibold text-zinc-400">{tx.hash}</span>
                          <span className="font-bold text-foreground">{tx.amount}</span>
                          <span className="text-ring font-bold flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-ring" />
                            {tx.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Panel B: Smart Contract Automated Lifecycle Timeline (col-span-5) */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Smart Contract Engine</span>
                  
                  {/* Vertical Timeline State Machine */}
                  <div className="relative flex flex-col gap-6 pl-5 border-l border-border/10">
                    
                    {/* Stepper Active Line progress */}
                    <div className="absolute left-[-1px] top-2 bottom-12 w-[1.5px] bg-ring/30">
                      <div className="absolute top-0 left-0 w-full h-[65%] bg-ring" />
                    </div>

                    {[
                      { step: "01", status: "INITIALIZED", desc: "Subscription state provisioned on ledger.", done: true },
                      { step: "02", status: "AUTHORIZED", desc: "Allowance confirmed via Circle CPW.", done: true },
                      { step: "03", status: "SETTLED", desc: "USDC bridged & debited successfully.", done: true },
                      { step: "04", status: "PENDING", desc: "Next automated charge on Jun 25, 2024.", done: false }
                    ].map((item, idx) => (
                      <div key={idx} className="relative flex flex-col gap-1 items-start">
                        {/* Timeline Node dot */}
                        <div className={`absolute left-[-26px] top-1 h-3.5 w-3.5 rounded-full flex items-center justify-center transition-all ${
                          item.done 
                            ? "bg-ring border-4 border-background" 
                            : "bg-muted border-4 border-background outline-[1.5px] outline outline-zinc-600 animate-pulse"
                        }`} />
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500">
                            {item.step}
                          </span>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${item.done ? "text-ring" : "text-zinc-400"}`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 leading-snug font-medium">
                          {item.desc}
                        </span>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

              {/* Panel C: Live Developer Integration State (Footer parameters) */}
              <div className="mt-4 pt-6 border-t border-border/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600">URL //</span>
                  <span className="text-foreground font-semibold">https://api.arca.io/v1/webhook</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-zinc-500">WEBHOOK_STATUS:</span>
                    <span className="text-[#10b981] font-bold">ACTIVE</span>
                  </div>
                  <Link href="/docs" className="text-ring font-bold hover:text-ring/80 transition-colors uppercase tracking-wider text-[9px] flex items-center gap-1 shrink-0">
                    Explore API
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Bottom Banner: 4-Column Feature Row */}
          <motion.div
            className="col-span-1 lg:col-span-12 mt-16 pt-10 grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {[
              {
                title: "Global",
                desc: "Borderless payments with USDC",
                icon: Globe,
              },
              {
                title: "99.99%",
                desc: "Uptime SLA. Enterprise reliability",
                icon: Zap,
              },
              {
                title: "Secure",
                desc: "Funds protected with industry best practices",
                icon: ShieldCheck,
              },
              {
                title: "Developer First",
                desc: "API-first. Webhooks. SDKs. Open source.",
                icon: Code2,
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-ring/10 flex items-center justify-center text-ring shrink-0 transition-all duration-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{feature.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-medium">{feature.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Infrastructure & Resources Bento Grid Section */}
      <section id="infrastructure" className="relative w-full bg-background pt-24 pb-16 px-6 sm:px-12 lg:px-20 z-20 overflow-hidden">
        
        {/* Subtle radial glow background to blend with other sections */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(31, 169, 156,0.08),transparent_70%)] pointer-events-none" />
        
        {/* Abstract thin curved network arcs in the background - matching the uploaded image */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 lg:opacity-60 overflow-hidden">
          <svg className="absolute w-[200%] h-[200%] lg:w-[150%] lg:h-[150%] top-[-30%] left-[-25%] stroke-white/[0.04] fill-none" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 500 C 300 200, 700 250, 1000 150" strokeWidth="0.75" />
            <path d="M 0 420 C 400 100, 600 350, 1000 100" strokeWidth="0.75" />
            <path d="M 0 350 C 250 50, 800 200, 1000 300" strokeWidth="0.75" />
            <path d="M 0 280 C 500 450, 700 50, 1000 220" strokeWidth="0.75" />
            
            {/* Small glowing dots placed precisely on key intersection points */}
            <circle cx="280" cy="355" r="1.5" className="fill-white/40 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <circle cx="510" cy="275" r="2" className="fill-ring/60 shadow-[0_0_8px_rgba(31, 169, 156,0.6)]" />
            <circle cx="740" cy="205" r="1.5" className="fill-white/30" />
            <circle cx="890" cy="245" r="2" className="fill-white/50" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ApiShowcase />
          </motion.div>

          {/* Seamless Separator divider for perfect flow continuity */}
          <div className="w-full h-[1px] bg-border/20 my-20 lg:my-28" />
          
          {/* Section Header */}
          <div className="flex flex-col mb-16 gap-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-ring">Infrastructure & Resources</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground font-serif">
              Built for Scale. <br/>Equipped for Developers.
            </h2>
            <p className="text-zinc-400 font-medium leading-relaxed text-base md:text-lg">
              Explore our global network architecture, real-time transaction intelligence layer, and interactive documentation hubs.
            </p>
          </div>

          {/* Bento Grid Container - Unified Connected Grid */}
          <div className="flex flex-col rounded-[2.5rem] border border-border/30 overflow-hidden bg-background shadow-2xl">
            
            {/* Top Row: Tile 1 & Tile 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/30 border-b border-border/30">
            
              {/* Tile 1: Real-time Analytics (col-span-1 lg:col-span-7) */}
              <div className="relative group overflow-hidden bg-background p-8 lg:p-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 hover:bg-muted/5 transition-all duration-500 min-h-[360px] col-span-1 lg:col-span-7">
                
                <div className="flex flex-col flex-1 max-w-sm relative z-10 justify-between h-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ring">Real-time Analytics</span>
                    <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground mt-4 leading-tight font-serif">
                      Data that moves<br/>at the speed of<br/>your business.
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium mt-3 leading-relaxed max-w-[90%]">
                      Real-time insights into payments, subscriptions, settlements, and revenue performance.
                    </p>
                  </div>
                  
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-ring hover:text-ring/80 text-xs font-semibold mt-8 transition-colors group/link w-fit">
                    <span>Explore analytics</span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                  </Link>
                </div>
                
                {/* Visual Analytics Widget */}
                <div className="flex flex-col gap-4 w-full max-w-[220px] shrink-0 select-none bg-background border border-border/20 rounded-2xl p-5 relative z-10 group-hover:border-ring/20 transition-colors duration-500">
                  {/* Volume Chart */}
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Total volume (USD)</span>
                    <span className="text-xl font-bold tracking-tight text-foreground mt-1">$24,530,890</span>
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
                  
                  <div className="h-[1px] bg-border/30" />
                  
                  {/* Success Rate */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-wider">Success rate</span>
                      <span className="text-base font-bold tracking-tight text-foreground mt-0.5">98.72%</span>
                    </div>
                    
                    <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="var(--ring)" strokeWidth="3" strokeDasharray="100" strokeDashoffset="12.8" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="100" strokeDashoffset="50" strokeLinecap="round" />
                      </svg>
                      <span className="text-[7px] font-bold text-zinc-400">98%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tile 2: Global Coverage (col-span-1 lg:col-span-5) */}
              <div className="relative group overflow-hidden bg-background p-8 lg:p-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 hover:bg-muted/5 transition-all duration-500 min-h-[360px] col-span-1 lg:col-span-5">
                {/* Card Inner Glow */}
                <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_-20%,rgba(31, 169, 156,0.05),transparent_50%) pointer-events-none" />
                
                <div className="flex flex-col flex-1 max-w-sm relative z-10 justify-between h-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ring">Global Coverage</span>
                    <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground mt-4 leading-tight font-serif">
                      A truly global<br/>infrastructure.
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium mt-3 leading-relaxed max-w-[90%]">
                      Local presence. Global reach. Built to support businesses and users everywhere.
                    </p>
                  </div>
                  
                  <Link href="https://arca7.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-ring hover:text-ring/80 text-xs font-semibold mt-8 transition-colors group/link w-fit">
                    <span>View all regions</span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                  </Link>
                </div>
                
                {/* Minimalist Globe graphic */}
                <div className="relative w-full max-w-[160px] h-[160px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500 shrink-0 mx-auto select-none pointer-events-none relative z-10">
                  <Image src="/globle.png" alt="Global Coverage" fill className="object-contain" />
                </div>
              </div>

            </div>

            {/* Bottom Row: Tile 3 */}
            <div className="w-full">

              {/* Tile 3: Interactive Developer Documentation */}
              <div className="relative overflow-hidden bg-background p-8 lg:p-10">
              {/* Card Inner Glow */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_-10%,rgba(31, 169, 156,0.03),transparent_40%) pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
                
                {/* Left Side: Sidebar documentation context */}
                <div className="lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ring">Documentation Hub</span>
                    <h3 className="text-3xl font-normal tracking-tight text-foreground mt-4 leading-tight font-serif">
                      Everything you need.<br/>All in one place.
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium mt-4 leading-relaxed max-w-sm">
                      From drop-in pricing tables to deep JSON REST references, our interactive guides help you ship compliant billing lifecycles in minutes.
                    </p>
                  </div>
                  
                  {/* Desktop tabs menu */}
                  <div className="hidden lg:flex flex-col gap-1 mt-8 max-w-xs pr-4 border-r border-border/40">
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
                              ? "bg-muted text-ring pl-5" 
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
                              ? "bg-ring/10 text-ring border border-ring/20" 
                              : "bg-muted text-zinc-500 hover:text-zinc-300 border border-transparent"
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
                          <h4 className="text-xl font-bold tracking-tight text-foreground">{currentTab.title}</h4>
                          <p className="text-zinc-400 text-xs font-semibold leading-relaxed mt-2.5 max-w-xl">{currentTab.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 rounded-2xl border border-border/30 overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border/30 bg-background">
                          {currentTab.cards.map((card, i) => {
                            const IconComponent = card.icon;
                            return (
                              <div key={i} className="p-6 flex gap-4 hover:bg-muted/5 transition-all duration-300 items-center">
                                <div className="h-10 w-10 rounded-xl bg-ring/10 flex items-center justify-center text-ring shrink-0">
                                  <IconComponent className="h-5 w-5 stroke-[2.2]" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground">{card.title}</span>
                                  <span className="text-zinc-400 text-[10px] font-semibold leading-normal mt-1">{card.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Link href="https://arca7.vercel.app/docs" target="_blank" className="inline-flex items-center gap-1.5 text-ring hover:text-ring/80 text-xs font-semibold mt-4 transition-colors group/link w-fit">
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

            {/* Seamless Separator divider for perfect flow continuity */}
            <div className="w-full h-[1px] bg-border/20 my-20 lg:my-28" />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
            
            {/* Left Block: Brand, CTA, and Description */}
            <div className="flex flex-col gap-6 lg:col-span-5 pr-0 lg:pr-8">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="Arca Logo" fill className="object-contain dark:invert" unoptimized />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground font-serif">Arca</span>
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-4 leading-[1.15] font-serif">
                  The future of commerce <br/>runs on <span className="text-ring">ARCA</span>.
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md">
                  Integrate beautiful, predictable USDC subscriptions in seconds. Zero friction checkouts powered by Circle MPC wallets and unified liquidity.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-full bg-ring px-6 text-sm font-semibold text-white hover:bg-ring/90 transition-all duration-300">
                  Start building
                </Link>
                <Link href="https://arca7.vercel.app/docs" target="_blank" className="inline-flex h-10 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-300">
                  Explore Docs
                </Link>
              </div>
            </div>

            {/* Right Block: Platform, Developers, Stay Updated */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:col-span-7">
              
              {/* Platform Column */}
              <div className="flex flex-col gap-4">
                <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Platform</h4>
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
                <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Developers</h4>
                <div className="flex flex-col gap-3">
                  <Link href="https://arca7.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Documentation</Link>
                  <Link href="https://arca7.vercel.app/docs" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">API Reference</Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">SDKs / GitHub</Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Changelog</Link>
                  <Link href="https://testnet.arcscan.net" target="_blank" className="text-zinc-400 text-sm hover:text-white transition-colors duration-200">Status</Link>
                </div>
              </div>

              {/* Newsletter & Socials Column */}
              <div className="flex flex-col gap-4">
                <h4 className="text-foreground font-semibold text-xs tracking-wider uppercase">Stay updated</h4>
                <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                  Get updates on new products, features, and more.
                </p>
                <div className="relative flex items-center w-full bg-muted hover:bg-muted/80 transition-all duration-300 border border-border/40 rounded-lg overflow-hidden focus-within:border-border/60 focus-within:ring-1 focus-within:ring-foreground/10 mt-1">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-transparent px-3 py-2 text-xs font-medium text-foreground placeholder-zinc-500 outline-none"
                  />
                  <button className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors mr-1 shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Social Media Links */}
                <div className="flex items-center gap-4 mt-2">
                  <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <Twitter className="h-4 w-4" />
                  </Link>
                  <Link href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <Linkedin className="h-4 w-4" />
                  </Link>
                  <Link href="https://github.com/Vishal-770/arca" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <Github className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Copyright & Selector Bar */}
          <div className="relative pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 border-t border-border/40">
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
      </section>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
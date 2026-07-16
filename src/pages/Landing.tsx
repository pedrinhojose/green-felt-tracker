import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Wallet,
  ShieldCheck,
  BarChart3,
  Calendar,
  Crown,
  Smartphone,
  ChevronRight,
  Spade,
  Club,
  Diamond,
  Heart,
  Timer,
  CreditCard,
  Check,
  Sparkles,
  Gift,
} from "lucide-react";
import chipApa from "@/assets/chip-apa.png.asset.json";
import logoCards from "@/assets/apa-logo-cards.jpg.asset.json";
import logoBadge from "@/assets/apa-logo-badge.jpg.asset.json";

const slides = [
  {
    title: "Dashboard do Clube",
    subtitle: "Visão geral em tempo real",
    accent: "from-poker-gold/30 to-emerald-500/10",
    content: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Temporada", value: "2026", tone: "text-poker-gold" },
          { label: "Jogadores", value: "42", tone: "text-emerald-400" },
          { label: "Caixinha", value: "R$ 8.4k", tone: "text-sky-400" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-white/50">{c.label}</div>
            <div className={`text-lg font-bold ${c.tone}`}>{c.value}</div>
          </div>
        ))}
        <div className="col-span-3 rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Ranking da temporada</div>
          {["Rafael Souza", "Bruno Alves", "Marina L."].map((n, i) => (
            <div key={n} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${i === 0 ? "bg-poker-gold text-poker-black" : "bg-white/10 text-white/70"}`}>{i + 1}</span>
                <span className="text-xs text-white/80">{n}</span>
              </div>
              <span className="text-xs font-mono text-poker-gold">{[248, 216, 190][i]} pts</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Torneio ao Vivo",
    subtitle: "Blinds, timer e eliminações",
    accent: "from-emerald-500/30 to-poker-gold/10",
    content: (
      <div className="space-y-3">
        <div className="rounded-lg bg-gradient-to-br from-poker-gold/20 to-transparent border border-poker-gold/30 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-poker-gold/80">Nível 6</div>
          <div className="text-4xl font-bold text-white tabular-nums">12:47</div>
          <div className="text-xs text-white/60 mt-1">Blinds 200 / 400 · Ante 50</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
            <div className="text-[10px] text-white/50">Restantes</div>
            <div className="text-xl font-bold text-emerald-400">18</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
            <div className="text-[10px] text-white/50">Prize Pool</div>
            <div className="text-xl font-bold text-poker-gold">R$ 4.200</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Caixinha & Pagamentos",
    subtitle: "Controle total do dinheiro",
    accent: "from-sky-500/30 to-poker-gold/10",
    content: (
      <div className="space-y-3">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] uppercase text-white/50">Saldo atual</div>
          <div className="text-3xl font-bold text-emerald-400">R$ 12.850,00</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-2">
          {[
            { l: "Buy-in Torneio #24", v: "+R$ 1.200", up: true },
            { l: "Jantar / Bebidas", v: "-R$ 340", up: false },
            { l: "Rebuy T#24", v: "+R$ 600", up: true },
          ].map((t) => (
            <div key={t.l} className="flex items-center justify-between text-xs">
              <span className="text-white/70">{t.l}</span>
              <span className={t.up ? "text-emerald-400 font-mono" : "text-red-400 font-mono"}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const features = [
  { icon: Trophy, title: "Torneios & Home Games", desc: "Registre buy-ins, rebuys, add-ons, eliminações e premiações com precisão de casino." },
  { icon: BarChart3, title: "Rankings & Temporadas", desc: "Pontuação inteligente atualizada em tempo real a cada mão jogada." },
  { icon: Wallet, title: "Caixinha & Pagamentos", desc: "Controle financeiro completo por temporada, jogador e evento." },
  { icon: Timer, title: "Timer de Blinds Pro", desc: "Timer profissional com níveis, breaks, alertas sonoros e janela dedicada." },
  { icon: Users, title: "Gestão de Jogadores", desc: "Perfis, fotos, histórico, aniversários e estatísticas individuais." },
  { icon: CreditCard, title: "Prêmios & Jackpot", desc: "Distribuição automática de premiações e controle de jackpot da temporada." },
  { icon: Calendar, title: "Calendário & Anfitriões", desc: "Escala de anfitriões, jogos programados e lembretes automáticos." },
  { icon: ShieldCheck, title: "Multi-Clube & Seguro", desc: "Isolamento total entre clubes com RLS e níveis de acesso." },
];

const plans = [
  {
    name: "Trial",
    tag: "3 meses grátis",
    price: "R$ 0",
    period: "por 3 meses completos",
    highlight: false,
    cta: "Começar Grátis",
    features: ["Acesso total ao sistema", "Jogadores ilimitados", "Torneios ilimitados", "Timer de blinds profissional", "App do jogador incluso", "Sem cartão de crédito"],
  },
  {
    name: "Clube",
    tag: "Mais popular",
    price: "Em breve",
    period: "após o período de trial",
    highlight: true,
    cta: "Experimentar Grátis",
    features: ["Tudo do Trial", "Rankings e temporadas ilimitadas", "Caixinha e pagamentos completos", "Backups automáticos", "Múltiplos administradores", "Suporte prioritário"],
  },
  {
    name: "Multi-Clube",
    tag: "Para redes",
    price: "Sob consulta",
    period: "vários clubes na mesma conta",
    highlight: false,
    cta: "Falar com o time",
    features: ["Tudo do plano Clube", "Múltiplas organizações", "Painel Super Admin", "Isolamento RLS entre clubes", "Onboarding dedicado", "SLA e integrações"],
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const current = slides[slide];

  return (
    <div className="min-h-screen bg-poker-black text-white overflow-x-hidden relative">
      {/* Ambient gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-poker-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px]" />
        {/* felt texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, #0d6b3a 0px, transparent 2px), radial-gradient(circle at 75% 75%, #0d6b3a 0px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating chips + cards decor */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src={chipApa.url}
          alt=""
          className="absolute -top-10 -right-20 w-72 opacity-20 rotate-12 animate-[spin_40s_linear_infinite]"
        />
        <img
          src={chipApa.url}
          alt=""
          className="absolute top-[45%] -left-24 w-56 opacity-10 -rotate-12 animate-[spin_60s_linear_infinite_reverse]"
        />
        {/* Playing cards */}
        <div className="absolute top-40 right-8 hidden lg:block animate-[float_6s_ease-in-out_infinite]">
          <PlayingCard suit="♠" value="A" tone="black" rotate={12} />
        </div>
        <div className="absolute top-64 right-24 hidden lg:block animate-[float_7s_ease-in-out_infinite_0.5s]">
          <PlayingCard suit="♥" value="K" tone="red" rotate={-8} />
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-poker-black/70 border-b border-poker-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={chipApa.url} alt="Apa Poker" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(223,198,97,0.3)]" />
            <span className="font-poppins font-bold text-lg tracking-tight">
              APA <span className="text-poker-gold">POKER</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-poker-gold transition-colors">Recursos</a>
            <a href="#player-app" className="hover:text-poker-gold transition-colors">App do Jogador</a>
            <a href="#plans" className="hover:text-poker-gold transition-colors">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white/80 hover:text-poker-gold hover:bg-white/5" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold shadow-lg shadow-poker-gold/20" onClick={() => navigate("/auth?tab=signup")}>
              Testar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-poker-gold/30 bg-poker-gold/5 px-3 py-1 mb-6 text-xs text-poker-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 MESES GRÁTIS · sem cartão de crédito</span>
            </div>
            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              O casino do seu{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-poker-gold via-amber-300 to-poker-gold bg-clip-text text-transparent">
                  clube de poker
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-poker-gold/60 to-transparent blur-sm" />
              </span>{" "}
              em um sistema profissional.
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              Torneios, rankings, caixinha, pagamentos, timer de blinds e app do jogador — a plataforma completa
              para clubes e home games que levam o jogo a sério.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold h-12 px-6 shadow-lg shadow-poker-gold/30" onClick={() => navigate("/auth?tab=signup")}>
                Cadastre e Experimente Grátis
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 border-poker-gold/40 text-white bg-white/5 hover:bg-poker-gold/10 hover:text-poker-gold" onClick={() => navigate("/auth")}>
                Já sou membro · Entrar
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-white/50">
              <div className="flex items-center gap-1.5"><Spade className="w-3 h-3 text-poker-gold" /> Multi-clube</div>
              <div className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-red-400" /> Tempo real</div>
              <div className="flex items-center gap-1.5"><Diamond className="w-3 h-3 text-sky-400" /> App do jogador</div>
              <div className="flex items-center gap-1.5"><Club className="w-3 h-3 text-emerald-400" /> RLS seguro</div>
            </div>
          </div>

          {/* Carousel mockup */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-poker-gold/20 via-emerald-500/10 to-transparent rounded-3xl blur-2xl" />
            {/* Chip behind mockup */}
            <img src={chipApa.url} alt="" className="absolute -top-16 -right-10 w-40 opacity-90 rotate-12 drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-10 animate-[float_5s_ease-in-out_infinite]" />
            <div className={`relative rounded-2xl border border-white/10 bg-gradient-to-br ${current.accent} p-1 shadow-2xl shadow-black/50 transition-all duration-700`}>
              <div className="rounded-xl bg-poker-black/80 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <div className="ml-3 text-[10px] text-white/40 font-mono">apapoker.app / {current.title.toLowerCase().replace(/\s/g, "-")}</div>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-poker-gold/70">{current.subtitle}</div>
                    <div className="text-xl font-poppins font-semibold">{current.title}</div>
                  </div>
                  <div key={slide} className="animate-fade-in">
                    {current.content}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-poker-gold" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee of features text */}
      <div className="border-y border-poker-gold/10 bg-gradient-to-r from-transparent via-poker-gold/[0.03] to-transparent py-4 overflow-hidden">
        <div className="flex gap-10 animate-[marquee_30s_linear_infinite] whitespace-nowrap text-xs uppercase tracking-[0.3em] text-white/40">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-10">
              <span>♠ Torneios</span><span>♥ Ranking</span><span>♦ Caixinha</span><span>♣ Pagamentos</span>
              <span>♠ Timer de Blinds</span><span>♥ App do Jogador</span><span>♦ Multi-Clube</span><span>♣ Backups</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-poker-gold mb-3">Tudo em um só lugar</div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold">
            Do primeiro <span className="text-poker-gold">buy-in</span> ao último <span className="text-emerald-400">chip</span>
          </h2>
          <p className="mt-4 text-white/60">
            Ferramentas criadas para quem organiza jogos de verdade — sem planilhas, sem improviso.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 hover:border-poker-gold/40 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-poker-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-poker-gold/10 border border-poker-gold/20 flex items-center justify-center mb-4 group-hover:bg-poker-gold/20 transition-colors">
                  <f.icon className="w-5 h-5 text-poker-gold" />
                </div>
                <h3 className="font-poppins font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Player App */}
      <section id="player-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="absolute -inset-10 bg-gradient-to-br from-emerald-500/20 to-poker-gold/10 rounded-full blur-3xl" />
            {/* Chip beside phone */}
            <img src={chipApa.url} alt="" className="absolute -left-6 bottom-10 w-32 opacity-90 -rotate-12 z-20 animate-[float_6s_ease-in-out_infinite] drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
            <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-gradient-to-b from-neutral-800 to-neutral-900 p-3 shadow-2xl shadow-black/60 border border-white/10">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2.3rem] bg-poker-black overflow-hidden relative">
                <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] text-white/60">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1.5 border border-white/40 rounded-sm relative">
                      <span className="absolute inset-0.5 bg-emerald-400 rounded-[1px]" />
                    </span>
                  </span>
                </div>
                <div className="px-5 pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-poker-gold/80">Olá, Rafael</div>
                  <div className="text-lg font-poppins font-semibold">Sua temporada</div>
                </div>
                <div className="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-poker-gold/20 to-transparent border border-poker-gold/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/60 uppercase">Ranking atual</div>
                      <div className="text-3xl font-bold text-poker-gold">#3</div>
                    </div>
                    <Trophy className="w-8 h-8 text-poker-gold/60" />
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-poker-gold to-amber-300" />
                  </div>
                  <div className="mt-1.5 text-[10px] text-white/50">218 / 300 pts para o topo</div>
                </div>
                <div className="mx-5 mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-[9px] uppercase text-white/50">Jogos</div>
                    <div className="text-xl font-bold">24</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-[9px] uppercase text-white/50">ITM</div>
                    <div className="text-xl font-bold text-emerald-400">67%</div>
                  </div>
                </div>
                <div className="mx-5 mt-3 rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <Calendar className="w-3 h-3" /> Próximo jogo
                  </div>
                  <div className="mt-1 text-sm font-semibold">Sábado · 20h · Casa do Bruno</div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-4 py-3 flex items-center justify-around">
                  <Trophy className="w-4 h-4 text-poker-gold" />
                  <BarChart3 className="w-4 h-4 text-white/40" />
                  <Calendar className="w-4 h-4 text-white/40" />
                  <Users className="w-4 h-4 text-white/40" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 mb-6 text-xs text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>App do Jogador · Exclusivo</span>
            </div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold leading-tight">
              Seus jogadores no comando, direto do <span className="text-emerald-400">celular</span>.
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              Cada membro do clube tem acesso próprio — limpo, rápido e focado só no <em>seu</em> clube.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Rankings em tempo real durante e após as partidas",
                "Histórico completo de torneios e home games",
                "Estatísticas pessoais: ITM, ROI, melhores posições",
                "Calendário de jogos e próximas datas",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-sm text-white/80">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-poker-gold mb-3">
            <Gift className="w-3.5 h-3.5" /> Oferta de lançamento
          </div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold">
            Cadastre e experimente <span className="text-poker-gold">totalmente grátis por 3 meses</span>
          </h2>
          <p className="mt-4 text-white/60">
            Sem cartão de crédito. Acesso completo a todos os recursos do sistema.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                p.highlight
                  ? "border-poker-gold/60 bg-gradient-to-b from-poker-gold/10 to-transparent shadow-xl shadow-poker-gold/10 scale-[1.02]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-poker-gold text-poker-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {p.tag}
                </div>
              )}
              <div className="text-xs uppercase tracking-widest text-white/50">{p.name}</div>
              {!p.highlight && <div className="text-[10px] text-poker-gold mt-1">{p.tag}</div>}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{p.price}</span>
              </div>
              <div className="text-xs text-white/50 mt-1">{p.period}</div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.highlight ? "text-poker-gold" : "text-emerald-400"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-6 h-11 font-semibold ${
                  p.highlight
                    ? "bg-poker-gold hover:bg-amber-500 text-poker-black"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                onClick={() => navigate("/auth?tab=signup")}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/40 mt-6">
          Preços dos planos pagos serão anunciados antes do fim do seu período de trial. Nenhuma cobrança sem seu aviso.
        </p>
      </section>

      {/* Logos strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center text-xs uppercase tracking-widest text-white/40 mb-8">
          Clubes que já jogam com a gente
        </div>
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-80">
          <img src={logoCards.url} alt="APA Poker" className="h-20 sm:h-24 rounded-lg object-cover" />
          <img src={chipApa.url} alt="APA Poker Chip" className="h-24 sm:h-28" />
          <img src={logoBadge.url} alt="APA Poker Badge" className="h-20 sm:h-24 rounded-lg object-cover" />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl border border-poker-gold/30 bg-gradient-to-br from-poker-gold/10 via-emerald-500/5 to-transparent p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(223,198,97,0.18),transparent_70%)]" />
          <img src={chipApa.url} alt="" className="absolute -left-10 -bottom-10 w-40 opacity-30 -rotate-12" />
          <img src={chipApa.url} alt="" className="absolute -right-10 -top-10 w-32 opacity-25 rotate-12" />
          <div className="relative">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold">
              Pronto para elevar o nível do seu clube?
            </h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto">
              Crie sua conta em menos de 1 minuto e ganhe <span className="text-poker-gold font-semibold">3 meses grátis</span> — sem cartão de crédito.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold h-12 px-6" onClick={() => navigate("/auth?tab=signup")}>
                Começar Grátis Agora
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 border-white/20 bg-white/5 hover:bg-white/10" onClick={() => navigate("/auth")}>
                Já tenho conta · Entrar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-3">
            <img src={chipApa.url} alt="Apa Poker" className="w-8 h-8" />
            <span>© {new Date().getFullYear()} Apa Poker Manager · Since 2016</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-poker-gold transition-colors">Recursos</a>
            <a href="#plans" className="hover:text-poker-gold transition-colors">Planos</a>
            <a href="#player-app" className="hover:text-poker-gold transition-colors">App</a>
            <button onClick={() => navigate("/auth")} className="hover:text-poker-gold transition-colors">Entrar</button>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--tw-rotate, 0deg)); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

function PlayingCard({ suit, value, tone, rotate = 0 }: { suit: string; value: string; tone: "red" | "black"; rotate?: number }) {
  return (
    <div
      className="w-20 h-28 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-200 shadow-2xl border border-neutral-300 relative overflow-hidden"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className={`absolute top-1.5 left-2 text-lg font-bold leading-none ${tone === "red" ? "text-red-600" : "text-neutral-900"}`}>
        {value}
        <div className="text-sm">{suit}</div>
      </div>
      <div className={`absolute bottom-1.5 right-2 text-lg font-bold leading-none rotate-180 ${tone === "red" ? "text-red-600" : "text-neutral-900"}`}>
        {value}
        <div className="text-sm">{suit}</div>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center text-4xl ${tone === "red" ? "text-red-600/80" : "text-neutral-900/80"}`}>
        {suit}
      </div>
    </div>
  );
}

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
} from "lucide-react";

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
    title: "Caixinha & Financeiro",
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
  {
    icon: Trophy,
    title: "Torneios & Home Games",
    desc: "Registre entradas, rebuys, add-ons e premiações com precisão de casino profissional.",
  },
  {
    icon: BarChart3,
    title: "Temporadas & Rankings",
    desc: "Pontuação inteligente atualizada em tempo real a cada partida da temporada.",
  },
  {
    icon: Wallet,
    title: "Caixinha & Financeiro",
    desc: "Estatísticas financeiras completas por temporada, gerais e por jogador.",
  },
  {
    icon: ShieldCheck,
    title: "Multiníveis de Acesso",
    desc: "Super Admin, admin do clube e visitantes — cada um vê exatamente o que precisa.",
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
    <div className="min-h-screen bg-poker-black text-white overflow-x-hidden">
      {/* Ambient gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-poker-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-poker-black/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-poker-gold to-amber-600 flex items-center justify-center shadow-lg shadow-poker-gold/20">
              <Spade className="w-5 h-5 text-poker-black" />
            </div>
            <span className="font-poppins font-bold text-lg">
              Apa <span className="text-poker-gold">Poker</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-poker-gold transition-colors">Recursos</a>
            <a href="#player-app" className="hover:text-poker-gold transition-colors">App do Jogador</a>
            <a href="#cta" className="hover:text-poker-gold transition-colors">Começar</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-poker-gold hover:bg-white/5"
              onClick={() => navigate("/auth")}
            >
              Entrar
            </Button>
            <Button
              className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Criar Clube
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-poker-gold/30 bg-poker-gold/5 px-3 py-1 mb-6 text-xs text-poker-gold">
              <Crown className="w-3.5 h-3.5" />
              <span>Gestão profissional para clubes de poker</span>
            </div>
            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              A gestão do seu{" "}
              <span className="bg-gradient-to-r from-poker-gold via-amber-300 to-poker-gold bg-clip-text text-transparent">
                Clube de Poker
              </span>{" "}
              e Home Games elevada ao nível profissional.
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              Torneios, rankings, caixinha e estatísticas — tudo em uma plataforma
              projetada por jogadores para clubes que levam o jogo a sério.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold h-12 px-6 shadow-lg shadow-poker-gold/20"
                onClick={() => navigate("/auth")}
              >
                Acessar Sistema
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-poker-gold/40 text-white hover:bg-poker-gold/10 hover:text-poker-gold"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Criar Novo Clube
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
            <div className={`relative rounded-2xl border border-white/10 bg-gradient-to-br ${current.accent} p-1 shadow-2xl shadow-black/50 transition-all duration-700`}>
              <div className="rounded-xl bg-poker-black/80 backdrop-blur-sm">
                {/* window chrome */}
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
            {/* dots */}
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

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-poker-gold mb-3">O que o sistema faz</div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold">
            Tudo o que seu clube precisa, em um só lugar
          </h2>
          <p className="mt-4 text-white/60">
            Ferramentas criadas para quem organiza jogos de verdade — sem planilhas, sem improviso.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 hover:border-poker-gold/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-poker-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-poker-gold/10 border border-poker-gold/20 flex items-center justify-center mb-4">
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
          {/* Phone mockup */}
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="absolute -inset-10 bg-gradient-to-br from-emerald-500/20 to-poker-gold/10 rounded-full blur-3xl" />
            <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-gradient-to-b from-neutral-800 to-neutral-900 p-3 shadow-2xl shadow-black/60 border border-white/10">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2.3rem] bg-poker-black overflow-hidden relative">
                {/* status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] text-white/60">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1.5 border border-white/40 rounded-sm relative">
                      <span className="absolute inset-0.5 bg-emerald-400 rounded-[1px]" />
                    </span>
                  </span>
                </div>
                {/* header */}
                <div className="px-5 pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-poker-gold/80">Olá, Rafael</div>
                  <div className="text-lg font-poppins font-semibold">Sua temporada</div>
                </div>
                {/* rank card */}
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
                {/* stats */}
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
                {/* next game */}
                <div className="mx-5 mt-3 rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <Calendar className="w-3 h-3" /> Próximo jogo
                  </div>
                  <div className="mt-1 text-sm font-semibold">Sábado · 20h · Casa do Bruno</div>
                </div>
                {/* nav dock */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-4 py-3 flex items-center justify-around">
                  <Trophy className="w-4 h-4 text-poker-gold" />
                  <BarChart3 className="w-4 h-4 text-white/40" />
                  <Calendar className="w-4 h-4 text-white/40" />
                  <Users className="w-4 h-4 text-white/40" />
                </div>
              </div>
            </div>
          </div>

          {/* copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 mb-6 text-xs text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>App do Jogador · Exclusivo</span>
            </div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold leading-tight">
              Seus jogadores no comando, direto do{" "}
              <span className="text-emerald-400">celular</span>.
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              Cada membro do clube tem acesso próprio como visitante — limpo, rápido e
              focado apenas nas informações do <em>seu</em> clube, sem misturar com nenhum outro.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Rankings em tempo real durante e após as partidas",
                "Histórico completo de torneios e home games jogados",
                "Estatísticas pessoais: ITM, ROI, melhores posições",
                "Calendário de jogos programados e próximas datas",
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

      {/* CTA */}
      <section id="cta" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl border border-poker-gold/30 bg-gradient-to-br from-poker-gold/10 via-emerald-500/5 to-transparent p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(223,198,97,0.15),transparent_70%)]" />
          <div className="relative">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold">
              Pronto para elevar o nível do seu clube?
            </h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto">
              Crie sua conta em menos de 1 minuto e comece a organizar torneios como um profissional.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-poker-gold hover:bg-amber-500 text-poker-black font-semibold h-12 px-6"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Criar Novo Clube
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-white/20 hover:bg-white/5"
                onClick={() => navigate("/auth")}
              >
                Já tenho conta · Entrar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-poker-gold to-amber-600 flex items-center justify-center">
              <Spade className="w-4 h-4 text-poker-black" />
            </div>
            <span>© {new Date().getFullYear()} Apa Poker Manager</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-poker-gold transition-colors">Recursos</a>
            <a href="#player-app" className="hover:text-poker-gold transition-colors">App</a>
            <button onClick={() => navigate("/auth")} className="hover:text-poker-gold transition-colors">Entrar</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

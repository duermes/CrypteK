"use client";

import {
  MessageSquare,
  Shield,
  Users,
  Zap,
  Globe,
  Lock,
  Smartphone,
  Database,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {useAccount} from "wagmi";
import {ChatInterface} from "@/components/test/interface";

export default function Home() {
  const {address, isConnected} = useAccount();
  if (isConnected && address) {
    return <ChatInterface />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CrypteK</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Características
            </a>
            <a
              href="#security"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Seguridad
            </a>
            <a
              href="#download"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Descargar
            </a>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20">
            🚀 Mensajería Web3 para LATAM
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Mensajería <span className="text-primary">E2EE</span> con
            <br />
            Privacidad <span className="text-secondary">Real</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            CrypteK es la primera aplicación de mensajería descentralizada para
            América Latina. Cifrado de extremo a extremo con Zama, media en
            Filecoin, y autenticación ENS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Smartphone className="w-5 h-5 mr-2" />
              Abrir Mini App
            </Button>
            <Button size="lg" variant="outline">
              <Shield className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Características Revolucionarias
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construido con las mejores tecnologías Web3 para garantizar tu
              privacidad y seguridad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Cifrado Zama</CardTitle>
                <CardDescription>
                  Cifrado homomórfico de última generación que protege tus
                  mensajes y votaciones grupales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Media en Filecoin</CardTitle>
                <CardDescription>
                  Almacenamiento descentralizado para fotos, videos y archivos
                  con disponibilidad garantizada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Autenticación ENS</CardTitle>
                <CardDescription>
                  Únete con tu identidad Ethereum Name Service sin necesidad de
                  números de teléfono
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Mini App en Base</CardTitle>
                <CardDescription>
                  Experiencia móvil optimizada corriendo en la red Base para
                  máxima velocidad
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Red Lisk</CardTitle>
                <CardDescription>
                  Construido en Lisk para transacciones rápidas y económicas sin
                  comprometer la seguridad
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Votaciones Grupales</CardTitle>
                <CardDescription>
                  Sistema de votación cifrado para tomar decisiones grupales de
                  forma privada y segura
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seguridad de Nivel Militar
            </h2>
            <p className="text-xl text-muted-foreground">
              Tu privacidad es nuestra prioridad. Cada mensaje está protegido
              con tecnología de vanguardia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Cifrado de Extremo a Extremo
                  </h3>
                  <p className="text-muted-foreground">
                    Solo tú y el destinatario pueden leer los mensajes. Ni
                    nosotros ni terceros tienen acceso.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Lock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cifrado Homomórfico</h3>
                  <p className="text-muted-foreground">
                    Tecnología Zama permite operaciones sobre datos cifrados sin
                    descifrarlos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Almacenamiento Descentralizado
                  </h3>
                  <p className="text-muted-foreground">
                    Tus archivos están distribuidos en la red Filecoin, sin
                    puntos únicos de falla.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">100% Privado</h3>
                <p className="text-muted-foreground mb-6">
                  Cero metadatos almacenados. Cero tracking. Cero acceso a
                  terceros.
                </p>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Auditado por Seguridad
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Únete a la Revolución de la Mensajería
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sé parte de la primera generación de usuarios que experimenta la
            verdadera privacidad digital en LATAM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Smartphone className="w-5 h-5 mr-2" />
              Abrir Mini App
            </Button>
            <Button size="lg" variant="outline">
              Conectar Wallet
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Compatible con ENS • Disponible en Base • Construido en Lisk
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">CrypteK</span>
              </div>
              <p className="text-muted-foreground">
                Mensajería E2EE para LATAM con privacidad real y tecnología
                blockchain.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Características
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Seguridad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Desarrolladores</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentación
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Comunidad</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CrypteK. Construido con ❤️ para LATAM.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

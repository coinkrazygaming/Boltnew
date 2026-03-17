import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Code, Zap, Globe, Sparkles, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-border/50 backdrop-blur-md bg-background/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-accent" size={24} />
            <span className="font-semibold text-lg text-foreground">Bolt</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              How it Works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Launch IDE
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm text-accent">AI-Powered Development</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Build Apps With
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-400">
              {" "}
              AI Magic
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A browser-native development environment that feels like a superpower. Generate, edit, and deploy
            full-stack applications in real-time using natural language.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Start Building
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image/Mock */}
          <div className="pt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 blur-3xl opacity-30 -z-10" />
            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Code className="mx-auto text-accent opacity-50" size={48} />
                  <p className="text-muted-foreground">Your IDE preview appears here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need to Build
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete development environment optimized for the modern web
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI Code Generation</h3>
              <p className="text-muted-foreground">
                Describe what you want to build in plain English. Our AI generates production-ready code instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Code className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Live Code Editor</h3>
              <p className="text-muted-foreground">
                Full-featured IDE with syntax highlighting, auto-complete, and instant preview. All in your browser.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Globe className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">One-Click Deploy</h3>
              <p className="text-muted-foreground">
                Deploy your apps instantly to production. Share live links with anyone. No configuration needed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Instant Preview</h3>
              <p className="text-muted-foreground">
                See your changes instantly with hot reload. Your app updates as you type, no refresh needed.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Code className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Multi-Stack Support</h3>
              <p className="text-muted-foreground">
                Build with React, Vue, Svelte, or vanilla JS. Choose your favorite framework and libraries.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="border border-border rounded-lg p-8 bg-card hover:border-accent/50 transition hover:shadow-lg hover:shadow-accent/10">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Github className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Git Integration</h3>
              <p className="text-muted-foreground">
                Save your projects to GitHub. Collaborate with your team. Full version control built-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to build your next idea
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Describe Your Idea</h3>
              <p className="text-muted-foreground">
                Tell our AI what you want to build. Be specific. The more detail, the better the result.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI Builds Your App</h3>
              <p className="text-muted-foreground">
                Watch as our AI generates code, installs dependencies, and starts the dev server in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Edit & Deploy</h3>
              <p className="text-muted-foreground">
                Make changes, iterate instantly. Deploy with one click when you're ready to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Build Magic?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join developers who are building the future of web development
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Launch IDE Now
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-accent" size={20} />
                <span className="font-semibold text-foreground">Bolt</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build web apps with AI in your browser
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-accent transition">
                  <Github size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-accent transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-accent transition">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Bolt. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

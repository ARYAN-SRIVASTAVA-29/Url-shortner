import { BarChart3, Shield, Zap, Globe, Users, Settings } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track clicks, geographic data, referrers, and user behavior with detailed insights.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Row-level security, user authentication, and secure data handling for business use.",
  },
  {
    icon: Zap,
    title: "High Performance",
    description: "Fast redirects with global CDN distribution and optimized database queries.",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own branded domains for professional link sharing and brand consistency.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Collaborate with team members, share analytics, and manage permissions.",
  },
  {
    icon: Settings,
    title: "API Integration",
    description: "RESTful API for seamless integration with your existing tools and workflows.",
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl text-foreground mb-4 font-serif">Enterprise-Grade Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for businesses that need reliable, scalable, and secure URL management solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const stats = [
  { label: "URLs Shortened", value: "10M+", description: "Links processed daily" },
  { label: "Global Redirects", value: "50M+", description: "Monthly click-throughs" },
  { label: "Enterprise Clients", value: "500+", description: "Companies trust us" },
  { label: "Uptime", value: "99.9%", description: "Guaranteed availability" },
]

export function StatsSection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 font-serif">{stat.value}</div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

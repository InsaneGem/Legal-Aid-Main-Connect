const stats = [
  { value: '10K+', label: 'Clients Served' },
  { value: '500+', label: 'Verified Lawyers' },
  { value: '50K+', label: 'Consultations' },
  { value: '4.9', label: 'Average Rating' },
];

export const StatsSection = () => {
  return (
    <section className="py-20 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


import React from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Alexandre Santos',
    date: 'Novembro 2023',
    quote: 'Todo processo extremamente profissional, a comunicação é totalmente transparente e o serviço é de qualidade surpreendente. Desde o primeir'
  },
  {
    id: 2,
    name: 'Patricia Almeida',
    date: 'Janeiro 2024',
    quote: 'Superou minhas expectativas! Meu carro parece novo, o atendimento foi impecável e o preço muito justo pelo serviço prestado.'
  },
  {
    id: 3,
    name: 'Carlos Mendes',
    date: 'Março 2024',
    quote: 'Profissionais altamente qualificados, atendimento pontual e resultado final impressionante. Recomendo para qualquer um que valorize seu veículo.'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">O Que Nossos Clientes Dizem</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(testimonial => (
            <div 
              key={testimonial.id}
              className="bg-card p-6 rounded-lg border border-border"
            >
              <blockquote className="text-lg mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import StepIndicator from '@/components/StepIndicator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LocationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  needsAddress: boolean;
}

// Location options
const locationOptions: LocationOption[] = [
  {
    id: 'loja',
    title: 'Atendimento na Loja',
    description: 'Traga seu veículo até nossa loja para receber o serviço',
    icon: '🏪',
    needsAddress: false
  },
  {
    id: 'domicilio',
    title: 'Atendimento a Domicílio',
    description: 'Nossos profissionais vão até você para realizar o serviço',
    icon: '🏠',
    needsAddress: true
  }
];

const SelectLocation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};
  
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBack = () => {
    navigate('/agendar/veiculo', { state: bookingData });
  };
  
  const handleContinue = () => {
    const selectedLocationObj = locationOptions.find(opt => opt.id === selectedLocation);
    
    // Add validation if address is needed but not provided
    
    navigate('/agendar/confirmar', { 
      state: { 
        ...bookingData,
        selectedLocation: selectedLocationObj,
        address: selectedLocationObj?.needsAddress ? address : null
      } 
    });
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2 text-center">Onde você deseja receber o serviço?</h1>
      
      <StepIndicator 
        steps={["Serviços", "Data e Hora", "Veículo", "Local", "Confirmar"]} 
        currentStep={4} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {locationOptions.map(option => (
          <div
            key={option.id}
            className={`
              border-2 rounded-lg p-6 cursor-pointer transition-all
              ${selectedLocation === option.id
                ? 'border-brand-red'
                : 'border-border hover:border-brand-red/50'
              }
            `}
            onClick={() => setSelectedLocation(option.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-4">{option.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
              <p className="text-muted-foreground text-sm">{option.description}</p>
              
              {option.id === 'loja' && (
                <div className="mt-4 text-sm">
                  <p>Av. Castro Alves - Res. Pedro Miranda, Sen. Canedo - GO, 75262-541</p>
                </div>
              )}
              
              {option.id === 'domicilio' && (
                <div className="mt-4 text-sm">
                  <p>Informações de endereço serão solicitadas na próxima etapa</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedLocation === 'domicilio' && (
        <div className="bg-card p-6 rounded-lg mb-8 animate-fade-in">
          <h3 className="text-lg font-medium mb-4">Endereço para Atendimento</h3>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="street">Endereço Completo</Label>
              <Input
                id="street"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                placeholder="Rua, número, complemento"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="Estado"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={address.zipCode}
                onChange={handleInputChange}
                placeholder="CEP"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instructions">
                Instruções Especiais (Opcional)
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={address.instructions}
                onChange={handleInputChange}
                placeholder="Qualquer solicitação ou instrução especial para seu agendamento"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleBack}
          variant="outline"
        >
          Voltar
        </Button>
        
        <Button 
          onClick={handleContinue}
          className="bg-brand-red hover:bg-brand-red/90"
          disabled={!selectedLocation}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default SelectLocation;

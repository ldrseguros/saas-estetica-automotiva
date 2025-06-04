import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import API from "@/utils/apiService";
import { Loader2 } from "lucide-react";

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  intervalStarts: string;
  intervalEnds: string;
  hasInterval: boolean;
}

const daysOfWeek = [
  { id: "monday", label: "Segunda-feira" },
  { id: "tuesday", label: "Terça-feira" },
  { id: "wednesday", label: "Quarta-feira" },
  { id: "thursday", label: "Quinta-feira" },
  { id: "friday", label: "Sexta-feira" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

// Default hours
const defaultHours: BusinessHour[] = daysOfWeek.map((day) => ({
  day: day.id,
  isOpen: day.id !== "sunday", // Fechado aos domingos por padrão
  openTime: "09:00",
  closeTime: "18:00",
  intervalStarts: "12:00",
  intervalEnds: "13:00",
  hasInterval: true,
}));

const BusinessHoursSettings: React.FC = () => {
  const [businessHours, setBusinessHours] =
    useState<BusinessHour[]>(defaultHours);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [slotDuration, setSlotDuration] = useState<number>(30); // Duração do slot em minutos

  useEffect(() => {
    const fetchBusinessHours = async () => {
      setLoading(true);
      try {
        const response = await API.get("/admin/settings/business-hours");

        if (response.data && Array.isArray(response.data.hours)) {
          setBusinessHours(response.data.hours);
          setSlotDuration(response.data.slotDuration || 30);
        } else {
          // Usar horas padrão se a API não retornar dados
          console.warn("API returned invalid format, using default hours");
        }
      } catch (error) {
        console.error("Failed to fetch business hours:", error);
        toast({
          title: "Erro ao carregar horários",
          description:
            "Não foi possível carregar os horários de funcionamento.",
          variant: "destructive",
        });
        // Continuar usando horas padrão
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  const handleToggleDay = (dayId: string) => {
    setBusinessHours((prev) =>
      prev.map((day) =>
        day.day === dayId ? { ...day, isOpen: !day.isOpen } : day
      )
    );
  };

  const handleToggleInterval = (dayId: string) => {
    setBusinessHours((prev) =>
      prev.map((day) =>
        day.day === dayId ? { ...day, hasInterval: !day.hasInterval } : day
      )
    );
  };

  const handleTimeChange = (dayId: string, field: string, value: string) => {
    setBusinessHours((prev) =>
      prev.map((day) => (day.day === dayId ? { ...day, [field]: value } : day))
    );
  };

  const handleSlotDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSlotDuration(value);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await API.post("/admin/settings/business-hours", {
        hours: businessHours,
        slotDuration,
      });

      toast({
        title: "Configurações salvas",
        description:
          "Os horários de funcionamento foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error("Failed to save business hours:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os horários de funcionamento.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <span className="ml-3">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Horário de Funcionamento</CardTitle>
        <CardDescription>
          Configure os horários de funcionamento e disponibilidade para
          agendamentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="slotDuration">
              Duração dos Agendamentos (minutos)
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="slotDuration"
                value={slotDuration}
                onChange={handleSlotDurationChange}
                className="w-24"
                type="number"
                min="5"
                max="120"
              />
              <span className="text-sm text-muted-foreground">
                Define a duração padrão de cada slot de horário disponível.
              </span>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Horário de Funcionamento</h3>

            <div className="space-y-6">
              {businessHours.map((day) => (
                <div
                  key={day.day}
                  className="grid grid-cols-1 gap-4 pt-4 border-t first:border-0 first:pt-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`open-${day.day}`}
                        checked={day.isOpen}
                        onCheckedChange={() => handleToggleDay(day.day)}
                      />
                      <Label
                        htmlFor={`open-${day.day}`}
                        className="font-medium"
                      >
                        {daysOfWeek.find((d) => d.id === day.day)?.label}
                      </Label>
                    </div>
                    {!day.isOpen && (
                      <span className="text-sm text-muted-foreground">
                        Fechado
                      </span>
                    )}
                  </div>

                  {day.isOpen && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`openTime-${day.day}`}>
                            Horário de Abertura
                          </Label>
                          <Input
                            id={`openTime-${day.day}`}
                            type="time"
                            value={day.openTime}
                            onChange={(e) =>
                              handleTimeChange(
                                day.day,
                                "openTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`closeTime-${day.day}`}>
                            Horário de Fechamento
                          </Label>
                          <Input
                            id={`closeTime-${day.day}`}
                            type="time"
                            value={day.closeTime}
                            onChange={(e) =>
                              handleTimeChange(
                                day.day,
                                "closeTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`interval-${day.day}`}
                            checked={day.hasInterval}
                            onCheckedChange={() =>
                              handleToggleInterval(day.day)
                            }
                          />
                          <Label htmlFor={`interval-${day.day}`}>
                            Possui intervalo de almoço ou pausa
                          </Label>
                        </div>

                        {day.hasInterval && (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                              <Label htmlFor={`intervalStarts-${day.day}`}>
                                Início do Intervalo
                              </Label>
                              <Input
                                id={`intervalStarts-${day.day}`}
                                type="time"
                                value={day.intervalStarts}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day.day,
                                    "intervalStarts",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`intervalEnds-${day.day}`}>
                                Fim do Intervalo
                              </Label>
                              <Input
                                id={`intervalEnds-${day.day}`}
                                type="time"
                                value={day.intervalEnds}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day.day,
                                    "intervalEnds",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSaveSettings}
            className="w-full bg-brand-red hover:bg-brand-red/90"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursSettings;

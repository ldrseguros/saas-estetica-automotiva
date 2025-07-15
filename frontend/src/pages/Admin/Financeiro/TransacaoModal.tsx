import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getTenantId } from "@/utils/tenantUtils";

interface Categoria {
  id: string;
  name: string;
}

interface Metodo {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  value: number;
  category?: {
    id: string;
    name: string;
  };
  method?: {
    id: string;
    name: string;
  };
}

interface TransacaoForm {
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  value: number;
  categoryId: string;
  methodId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  transacao?: Transaction;
  onSaved: () => void;
}

const fetchCategorias = async () => {
  const tenantId = getTenantId();
  const { data } = await axios.get(
    `/api/finance/categories?tenantId=${tenantId}`
  );
  return data as Categoria[];
};

const fetchMetodos = async () => {
  const tenantId = getTenantId();
  const { data } = await axios.get(`/api/finance/methods?tenantId=${tenantId}`);
  return data as Metodo[];
};

const TransacaoModal: React.FC<Props> = ({
  open,
  onClose,
  transacao,
  onSaved,
}) => {
  const { control, handleSubmit, reset } = useForm<TransacaoForm>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      description: "",
      type: "INCOME",
      value: 0,
      categoryId: "",
      methodId: "",
    },
  });

  useEffect(() => {
    if (transacao) {
      reset({
        ...transacao,
        date: transacao.date?.slice(0, 10),
        categoryId: transacao.category?.id || "",
        methodId: transacao.method?.id || "",
      });
    } else {
      reset({
        date: new Date().toISOString().slice(0, 10),
        description: "",
        type: "INCOME",
        value: 0,
        categoryId: "",
        methodId: "",
      });
    }
  }, [transacao, reset]);

  const { data: categorias, isLoading: loadingCategorias } = useQuery({
    queryKey: ["categoriasFinanceiras"],
    queryFn: fetchCategorias,
  });

  const { data: metodos, isLoading: loadingMetodos } = useQuery({
    queryKey: ["metodosFinanceiros"],
    queryFn: fetchMetodos,
  });

  const onSubmit = async (values: TransacaoForm) => {
    try {
      const tenantId = getTenantId();

      console.log("🔍 Debug TransacaoModal - values:", values);
      console.log("🔍 Debug TransacaoModal - tenantId:", tenantId);

      // Validações básicas
      if (!values.description.trim()) {
        alert("Descrição é obrigatória");
        return;
      }

      if (!values.categoryId) {
        alert("Categoria é obrigatória");
        return;
      }

      if (!values.methodId) {
        alert("Método de pagamento é obrigatório");
        return;
      }

      if (values.value <= 0) {
        alert("Valor deve ser maior que zero");
        return;
      }

      // Preparar payload com conversões necessárias
      const payload = {
        type: values.type,
        description: values.description.trim(),
        value: parseFloat(values.value.toString()), // Garantir que é número
        date: new Date(values.date).toISOString(), // Converter para ISO string
        categoryId: values.categoryId,
        methodId: values.methodId,
        tenantId,
      };

      console.log("Debug TransacaoModal - payload final:", payload);

      if (transacao) {
        await axios.put(`/api/finance/transactions/${transacao.id}`, payload);
      } else {
        await axios.post(`/api/finance/transactions`, payload);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Detalhes do erro:", error.response?.data);
        console.error("📋 Status do erro:", error.response?.status);
      }
      // Mostrar erro para o usuário
      alert(
        "Erro ao salvar transação. Verifique o console para mais detalhes."
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transacao ? "Editar Transação" : "Nova Transação"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Data"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descrição"
                fullWidth
                margin="normal"
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-label">Tipo</InputLabel>
                <Select {...field} labelId="type-label" label="Tipo">
                  <MenuItem value="INCOME">Receita</MenuItem>
                  <MenuItem value="EXPENSE">Despesa</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Valor"
                type="number"
                fullWidth
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel id="categoria-label">Categoria</InputLabel>
                <Select
                  {...field}
                  labelId="categoria-label"
                  label="Categoria"
                  disabled={loadingCategorias}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {categorias?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="methodId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel id="metodo-label">Método de Pagamento</InputLabel>
                <Select
                  {...field}
                  labelId="metodo-label"
                  label="Método de Pagamento"
                  disabled={loadingMetodos}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {metodos?.map((met) => (
                    <MenuItem key={met.id} value={met.id}>
                      {met.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransacaoModal;

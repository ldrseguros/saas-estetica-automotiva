import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { getTenantId } from "@/utils/tenantUtils";

interface Categoria {
  id?: string;
  name: string;
  color?: string;
}
interface Props {
  open: boolean;
  onClose: () => void;
  categoria?: Categoria;
  onSaved: () => void;
}

const CategoriaModal: React.FC<Props> = ({
  open,
  onClose,
  categoria,
  onSaved,
}) => {
  const { control, handleSubmit, reset } = useForm<Categoria>({
    defaultValues: { name: "", color: "" },
  });

  useEffect(() => {
    if (categoria) {
      reset({ name: categoria.name, color: categoria.color || "" });
    } else {
      reset({ name: "", color: "" });
    }
  }, [categoria, reset]);

  const onSubmit = async (values: Categoria) => {
    const tenantId = getTenantId();
    if (categoria && categoria.id) {
      await axios.put(`/api/finance/categories/${categoria.id}`, {
        ...values,
        tenantId,
      });
    } else {
      await axios.post(`/api/finance/categories`, {
        ...values,
        tenantId,
      });
    }
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {categoria ? "Editar Categoria" : "Nova Categoria"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome"
                fullWidth
                margin="normal"
                required
              />
            )}
          />
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cor (hex)"
                fullWidth
                margin="normal"
              />
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

export default CategoriaModal;

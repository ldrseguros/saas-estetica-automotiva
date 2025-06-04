import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { validateUserForm, formatWhatsApp } from "../../utils/validation";
import { toast } from "sonner";
import axios from "axios";

interface Cliente {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  createdAt: string;
  password?: string;
}

interface EditClientModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onSaveSuccess: () => void; // Callback para quando a edição for bem sucedida
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  open,
  onClose,
  cliente,
  onSaveSuccess,
}) => {
  const [editedCliente, setEditedCliente] = useState<Cliente | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setEditedCliente(cliente);
    setPassword("");
    // Limpar erros de validação ao abrir o modal
    setValidationErrors({});
  }, [cliente, open]);

  const handleSaveEdit = async () => {
    if (!editedCliente) return;

    const validation = validateUserForm({
      name: editedCliente.name,
      email: editedCliente.email,
      whatsapp: editedCliente.whatsapp,
      ...(password && { password }),
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `/api/admin/users/${editedCliente.id}`,
        {
          ...editedCliente,
          role: "CLIENT", // Garantir que mantenha a role de cliente
          whatsapp: formatWhatsApp(editedCliente.whatsapp),
          ...(password && { password }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Cliente atualizado com sucesso");
      onSaveSuccess(); // Chamar o callback de sucesso
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      const errorMessage =
        error.response?.data?.message || "Erro ao atualizar cliente";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgb(30, 41, 59)",
          color: "rgb(203, 213, 225)",
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle sx={{ color: "white" }}>Editar Cliente</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nome"
          type="text"
          fullWidth
          variant="outlined"
          value={editedCliente?.name || ""}
          onChange={(e) =>
            setEditedCliente({ ...editedCliente!, name: e.target.value })
          }
          error={!!validationErrors.name}
          helperText={validationErrors.name}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": { borderColor: "rgb(71, 85, 105)" },
              "&:hover fieldset": { borderColor: "rgb(100, 116, 139)" },
              "&.Mui-focused fieldset": { borderColor: "rgb(222, 18, 38)" },
            },
            "& .MuiInputBase-input": { color: "white" },
            "& .MuiInputLabel-root": { color: "rgb(148, 163, 184)" },
          }}
        />
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={editedCliente?.email || ""}
          onChange={(e) =>
            setEditedCliente({ ...editedCliente!, email: e.target.value })
          }
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": { borderColor: "rgb(71, 85, 105)" },
              "&:hover fieldset": { borderColor: "rgb(100, 116, 139)" },
              "&.Mui-focused fieldset": { borderColor: "rgb(222, 18, 38)" },
            },
            "& .MuiInputBase-input": { color: "white" },
            "& .MuiInputLabel-root": { color: "rgb(148, 163, 184)" },
          }}
        />
        <TextField
          margin="dense"
          label="Whatsapp"
          type="text"
          fullWidth
          variant="outlined"
          value={editedCliente?.whatsapp || ""}
          onChange={(e) =>
            setEditedCliente({ ...editedCliente!, whatsapp: e.target.value })
          }
          error={!!validationErrors.whatsapp}
          helperText={validationErrors.whatsapp}
          placeholder="Ex: (99) 99999-9999"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": { borderColor: "rgb(71, 85, 105)" },
              "&:hover fieldset": { borderColor: "rgb(100, 116, 139)" },
              "&.Mui-focused fieldset": { borderColor: "rgb(222, 18, 38)" },
            },
            "& .MuiInputBase-input": { color: "white" },
            "& .MuiInputLabel-root": { color: "rgb(148, 163, 184)" },
          }}
        />
        <TextField
          margin="dense"
          label="Nova Senha (deixe em branco para não alterar)"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": { borderColor: "rgb(71, 85, 105)" },
              "&:hover fieldset": { borderColor: "rgb(100, 116, 139)" },
              "&.Mui-focused fieldset": { borderColor: "rgb(222, 18, 38)" },
            },
            "& .MuiInputBase-input": { color: "white" },
            "& .MuiInputLabel-root": { color: "rgb(148, 163, 184)" },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px", gap: "8px" }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            color: "rgb(148, 163, 184)",
            borderColor: "rgb(71, 85, 105)",
            "&:hover": {
              borderColor: "rgb(100, 116, 139)",
              backgroundColor: "rgba(71, 85, 105, 0.1)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveEdit}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            borderRadius: "8px",
            backgroundColor: "rgb(232, 26, 39)",
            "&:hover": { backgroundColor: "rgb(179, 20, 30)" },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Salvar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClientModal;

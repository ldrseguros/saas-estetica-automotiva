import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import axios from "axios";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import { toast } from "sonner";
import { validateUserForm, formatWhatsApp } from "../../utils/validation";
import EditClientModal from "../../components/Admin/EditClientModal";

interface Cliente {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  createdAt: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [email, setEmail] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Estado para edição de cliente
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Estado para indicador de carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClientes = useCallback(
    async (page = 1) => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/admin/users", {
          params: {
            email,
            role: "CLIENT",
            page,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        setClientes(response.data.users);
        setPagination(response.data.pagination);
      } catch (error) {
        toast.error("Erro ao buscar clientes");
        console.error("Erro ao buscar clientes:", error);
      }
    },
    [email]
  );

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleSearch = () => {
    fetchClientes();
  };

  const handlePageChange = (page: number) => {
    fetchClientes(page);
  };

  // Funções de edição e exclusão
  const handleEditCliente = (cliente: Cliente) => {
    setEditCliente(cliente);
    setOpenEditModal(true);
    handleCloseMenu();
    // Limpar erros de validação
    setValidationErrors({});
  };

  const handleDeleteCliente = async () => {
    if (!editCliente) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`/api/admin/users/${editCliente.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Cliente excluído com sucesso");
      fetchClientes(pagination.currentPage);
      setConfirmDelete(false);
      handleCloseMenu();
    } catch (error) {
      toast.error("Erro ao excluir cliente");
      console.error("Erro ao excluir cliente:", error);
    }
  };

  // Controle de menu de ações
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    cliente: Cliente
  ) => {
    setAnchorEl(event.currentTarget);
    setEditCliente(cliente);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Salvar edições
  const handleSaveEdit = async () => {
    if (!editCliente) return;

    // Validar dados
    const validation = validateUserForm({
      name: editCliente.name,
      email: editCliente.email,
      whatsapp: editCliente.whatsapp,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      // Mostrar indicador de carregamento enquanto salva
      setIsSubmitting(true);

      await axios.put(
        `/api/admin/users/${editCliente.id}`,
        {
          ...editCliente,
          role: "CLIENT", // Garantir que mantenha a role de cliente
          whatsapp: formatWhatsApp(editCliente.whatsapp),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Cliente atualizado com sucesso");
      fetchClientes(pagination.currentPage);
      setOpenEditModal(false);
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
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <TextField
          label="Buscar por email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Buscar
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>WhatsApp</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.name}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.whatsapp || "Não informado"}</TableCell>
                <TableCell>
                  {new Date(cliente.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Editar cliente">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditCliente(cliente)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir cliente">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setEditCliente(cliente);
                          setConfirmDelete(true);
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, cliente)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Menu de Ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditCliente(editCliente!)}>
          <EditIcon sx={{ marginRight: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => setConfirmDelete(true)}>
          <DeleteIcon sx={{ marginRight: 1, color: "red" }} /> Excluir
        </MenuItem>
      </Menu>

      {/* Modal de Edição de Cliente */}
      <EditClientModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        cliente={editCliente}
        onSaveSuccess={() => fetchClientes(pagination.currentPage)}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteCliente}
        onCancel={() => setConfirmDelete(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </Box>
  );
};

export default Clientes;

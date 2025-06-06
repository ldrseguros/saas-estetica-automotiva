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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import { toast } from "sonner";
import { validateUserForm, formatWhatsApp } from "../../utils/validation";
import AdminLayout from "@/components/Admin/AdminLayout";
import API from "@/utils/apiService";

interface User {
  id: string;
  email: string;
  name: string;
  role: "TENANT_ADMIN" | "EMPLOYEE";
  createdAt: string;
}

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Estado para edição de usuário
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const fetchUsersData = useCallback(
    async (page = 1) => {
      try {
        const response = await API.get("/admin/users", {
          params: {
            email,
            role: ["TENANT_ADMIN", "EMPLOYEE"],
            page,
          },
        });

        // Aplicar filtro adicional no frontend para garantir que apenas admin e funcionários apareçam
        const filteredUsers = (response.data.users || response.data).filter(
          (user) => user.role === "TENANT_ADMIN" || user.role === "EMPLOYEE"
        );
        setUsers(filteredUsers);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalUsers: 0,
          }
        );
      } catch (error) {
        toast.error("Erro ao buscar usuários");
        console.error("Erro ao buscar usuários:", error);
      }
    },
    [email]
  );

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleSearch = () => {
    fetchUsersData();
  };

  const handlePageChange = (page: number) => {
    fetchUsersData(page);
  };

  // Funções de edição e exclusão
  const handleEditUser = (user: User) => {
    setEditUser(user);
    setOpenEditModal(true);
    handleCloseMenu();
    // Limpar erros de validação
    setValidationErrors({});
  };

  const handleDeleteUser = async () => {
    if (!editUser) return;

    try {
      await API.delete(`/admin/users/${editUser.id}`);

      toast.success("Usuário excluído com sucesso");
      fetchUsersData(pagination.currentPage);
      setConfirmDelete(false);
      handleCloseMenu();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
      console.error("Erro ao excluir usuário:", error);
    }
  };

  // Controle de menu de ações
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setEditUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Salvar edições
  const handleSaveEdit = async () => {
    if (!editUser) return;

    // Validar dados
    const validation = validateUserForm({
      name: editUser.name,
      email: editUser.email,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      await API.put(`/admin/users/${editUser.id}`, editUser);

      toast.success("Usuário atualizado com sucesso");
      fetchUsersData(pagination.currentPage);
      setOpenEditModal(false);
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Usuários (Admin e Funcionários)
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
                <TableCell>Função</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleOpenMenu(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
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
          <MenuItem onClick={() => handleEditUser(editUser!)}>
            <EditIcon sx={{ marginRight: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={() => setConfirmDelete(true)}>
            <DeleteIcon sx={{ marginRight: 1, color: "red" }} /> Excluir
          </MenuItem>
        </Menu>

        {/* Modal de Edição */}
        <Dialog
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nome"
              fullWidth
              value={editUser?.name || ""}
              onChange={(e) =>
                setEditUser((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={editUser?.email || ""}
              onChange={(e) =>
                setEditUser((prev) =>
                  prev ? { ...prev, email: e.target.value } : null
                )
              }
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditModal(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Confirmação de Exclusão */}
        <ConfirmDialog
          open={confirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDelete(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      </Box>
    </AdminLayout>
  );
};

export default Usuarios;

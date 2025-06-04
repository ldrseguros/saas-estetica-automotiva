import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];

  // Gerar números de página
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        marginTop: 2,
      }}
    >
      <Button
        variant="outlined"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </Button>

      {pageNumbers.map((number) => (
        <Button
          key={number}
          variant={currentPage === number ? "contained" : "outlined"}
          color={currentPage === number ? "primary" : "inherit"}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Button>
      ))}

      <Button
        variant="outlined"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próximo
      </Button>

      <Typography variant="body2">
        Página {currentPage} de {totalPages}
      </Typography>
    </Box>
  );
};

export default Pagination;

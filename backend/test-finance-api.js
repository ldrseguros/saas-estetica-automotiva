import axios from "axios";

const API_URL = "http://localhost:3000/api/finance";
const tenantId = "1b608680-216b-4df3-96b7-ce94366ac96e"; // Substitua pelo tenantId válido do seu banco

async function testFinanceAPI() {
  try {
    // 1. Categorias
    console.log("--- Testando Categorias ---");
    let res = await axios.post(`${API_URL}/categories`, {
      name: "Categoria Teste",
      color: "#FF0000",
      tenantId,
    });
    const category = res.data;
    console.log("Categoria criada:", category);

    res = await axios.get(`${API_URL}/categories`, { params: { tenantId } });
    console.log("Categorias:", res.data);

    res = await axios.put(`${API_URL}/categories/${category.id}`, {
      name: "Categoria Editada",
      color: "#00FF00",
    });
    console.log("Categoria editada:", res.data);

    // 2. Métodos de Pagamento
    console.log("--- Testando Métodos de Pagamento ---");
    res = await axios.post(`${API_URL}/methods`, {
      name: "Cartão de Crédito",
      tenantId,
    });
    const method = res.data;
    console.log("Método criado:", method);

    res = await axios.get(`${API_URL}/methods`, { params: { tenantId } });
    console.log("Métodos:", res.data);

    res = await axios.put(`${API_URL}/methods/${method.id}`, {
      name: "Cartão Editado",
    });
    console.log("Método editado:", res.data);

    // 3. Transações
    console.log("--- Testando Transações ---");
    res = await axios.post(`${API_URL}/transactions`, {
      type: "INCOME",
      description: "Receita Teste",
      value: 100.5,
      date: new Date().toISOString(),
      categoryId: category.id,
      methodId: method.id,
      tenantId,
    });
    const transaction = res.data;
    console.log("Transação criada:", transaction);

    res = await axios.get(`${API_URL}/transactions`, { params: { tenantId } });
    console.log("Transações:", res.data);

    res = await axios.put(`${API_URL}/transactions/${transaction.id}`, {
      type: "EXPENSE",
      description: "Despesa Editada",
      value: 50.25,
      date: new Date().toISOString(),
      categoryId: category.id,
      methodId: method.id,
    });
    console.log("Transação editada:", res.data);

    // Limpeza: deletar tudo
    await axios.delete(`${API_URL}/transactions/${transaction.id}`);
    await axios.delete(`${API_URL}/categories/${category.id}`);
    await axios.delete(`${API_URL}/methods/${method.id}`);
    console.log("Limpeza concluída.");
    console.log("--- Teste finalizado com sucesso! ---");
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:");
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Erro: Sem resposta do servidor");
      console.error(error.request);
    } else {
      console.error("Erro:", error.message);
    }
    if (error.stack) {
      console.error("Stack:", error.stack);
    }
  }
}

testFinanceAPI();

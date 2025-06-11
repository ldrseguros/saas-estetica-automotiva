export const getTenantId = () => {
  try {
    // Primeiro tenta pegar do usuário logado (mais confiável)
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user.tenantId) {
      console.log("🟢 TenantId encontrado no user:", user.tenantId);
      return user.tenantId;
    }

    // Fallback para localStorage/sessionStorage
    let tenantId = localStorage.getItem("tenantId");
    if (!tenantId) {
      tenantId = sessionStorage.getItem("tenantId");
    }

    if (tenantId) {
      console.log("🟢 TenantId encontrado no storage:", tenantId);
      return tenantId;
    }

    // TEMPORÁRIO: Para testar enquanto o tenantId não está no banco
    const tempTenantId = "temp-tenant-id";
    console.log("⚠️ Usando tenantId temporário:", tempTenantId);
    return tempTenantId;
  } catch (error) {
    console.error("❌ Erro ao obter tenantId:", error);
    // TEMPORÁRIO: Para testar
    const tempTenantId = "temp-tenant-id";
    console.log("⚠️ Usando tenantId temporário por erro:", tempTenantId);
    return tempTenantId;
  }
};

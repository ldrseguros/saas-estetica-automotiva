import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const TenantContext = createContext(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [tenantError, setTenantError] = useState(null);

  // Efeito para carregar os dados do tenant
  useEffect(() => {
    const loadTenant = async () => {
      try {
        setLoadingTenant(true);
        setTenantError(null);

        const hostname = window.location.hostname;
        let subdomain = null;
        let tenantIdFromSessionStorage = sessionStorage.getItem('x-tenant-id'); // <--- Tenta pegar do sessionStorage primeiro

        // Se já tivermos um tenantId no sessionStorage, usamos ele.
        // Isso é crucial para navegações internas onde o parâmetro de URL é perdido.
        if (tenantIdFromSessionStorage) {
            console.log("[TenantContext] TenantId encontrado no sessionStorage. Usando:", tenantIdFromSessionStorage);
            // Poderíamos fazer uma requisição para 'public/tenant-by-id' para carregar o nome/logo
            // mas por enquanto, apenas setamos o tenantId para liberar o fluxo.
            setTenantInfo({ tenantId: tenantIdFromSessionStorage, tenantName: "Carregando..." });
            setLoadingTenant(false);
            return; // Sai daqui, não precisa buscar pelo subdomínio novamente.
        }

        // Se não tem no sessionStorage, tenta obter pelo subdomínio (apenas na carga inicial/primeiro acesso)
        if (hostname.includes('localhost') || hostname.startsWith('192.168.') || hostname.startsWith('127.0.0.1')) {
          const urlParams = new URLSearchParams(window.location.search);
          subdomain = urlParams.get('devSubdomain');
          if (!subdomain) {
            setTenantError('Em ambiente de desenvolvimento, adicione `?devSubdomain=SEU_SUBDOMINIO_DE_TESTE` na URL ou navegue para uma página que já tenha o TenantId no sessionStorage.');
            setLoadingTenant(false);
            return;
          }
        } else {
          const domainParts = hostname.split('.');
          if (domainParts.length >= 3 && !['www', 'app'].includes(domainParts[0].toLowerCase())) {
            subdomain = domainParts[0].toLowerCase();
          } else {
            setTenantError('Nenhum subdomínio de estética válido encontrado na URL.');
            setLoadingTenant(false);
            return;
          }
        }

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("Variável de ambiente REACT_APP_BACKEND_URL não definida!");
        }

        console.log(`[TenantContext] Tentando buscar tenant para subdomínio: ${subdomain} na URL: ${backendUrl}/public/tenant-by-subdomain`);
        const response = await axios.get(`${backendUrl}/public/tenant-by-subdomain?subdomain=${subdomain}`);
        console.log("[TenantContext] Dados do tenant recebidos:", response.data);
        setTenantInfo(response.data);

        // Salva o tenantId no sessionStorage assim que for obtido do backend
        if (response.data?.tenantId) {
            sessionStorage.setItem('x-tenant-id', response.data.tenantId);
            console.log("[TenantContext] tenantId salvo em sessionStorage:", response.data.tenantId);
        }

      } catch (err) {
        console.error("[TenantContext] Erro ao carregar dados do tenant:", err);
        setTenantError("Não foi possível carregar os dados da estética.");
      } finally {
        setLoadingTenant(false);
      }
    };

    loadTenant();
  }, []); // Este efeito roda apenas uma vez no carregamento inicial do componente


  // Renderização condicional
  if (loadingTenant) {
    return <div>Carregando dados da estética...</div>;
  }

  if (tenantError) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red', border: '1px solid red', margin: '20px' }}>
        <h1>Erro ao carregar a estética!</h1>
        <p>{tenantError}</p>
        <p>Por favor, verifique o endereço ou entre em contato com o suporte da plataforma.</p>
      </div>
    );
  }

  if (!tenantInfo) {
      return <div>Nenhuma estética carregada.</div>;
  }

  return (
    <TenantContext.Provider value={tenantInfo}>
      {children}
    </TenantContext.Provider>
  );
};
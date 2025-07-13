import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // Garanta que esta é a instância correta do Prisma Client

export const resolveTenantId = async (req, res, next) => {
    
    const subdomain = req.headers['x-tenant-id'];

    if (!subdomain) {
        // Se não há subdomínio no header, e a rota precisa de um, retorne erro.
        // Para rotas de serviço (GET /api/services), o subdomínio é obrigatório.
        if (req.path.startsWith('/api/services')) {
            return res.status(400).json({ message: "X-Tenant-ID header (subdomain) is required for public services." });
        }
        // Para outras rotas que não precisam de um tenantId resolvido (ex: login global, cadastro de novo tenant)
        return next();
    }

    try {
        // Buscar o tenant no banco de dados pelo subdomínio
        const tenant = await prisma.tenant.findUnique({
            where: { subdomain: subdomain }, 
            select: { id: true, subdomain: true }, 
        });

        if (!tenant) {
            // Se o subdomínio não corresponder a nenhum tenant
            return res.status(404).json({ message: `Tenant not found for subdomain: ${subdomain}` });
        }

        
        req.tenantId = tenant.id;
        console.log(`[TenantResolver] Subdomain '${subdomain}' resolved to Tenant ID: '${req.tenantId}'`);

        next(); 
    } catch (error) {
        console.error("[TenantResolver] Error resolving tenant ID:", error);
        res.status(500).json({ message: "Internal server error during tenant resolution." });
    }
};
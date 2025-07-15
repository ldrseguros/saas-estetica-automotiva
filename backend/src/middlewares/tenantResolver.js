import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const resolveTenantId = async (req, res, next) => {
    const subdomain = req.headers['x-tenant-id'];
    console.log(`[TenantResolver] Verificando X-Tenant-ID: ${subdomain}`); // Adicione este log

    // Se o X-Tenant-ID não for fornecido, não há nada para resolver.
    // Simplesmente chame next() para que rotas sem tenant-specific possam funcionar,
    // e rotas que exigem tenant ID (como as de serviço) possam validar `req.tenantId` (que será undefined).
    if (!subdomain) {
        console.warn("[TenantResolver] X-Tenant-ID header não fornecido.");
        return next();
    }

    try {
        const tenant = await prisma.tenant.findUnique({ where: { subdomain: subdomain } });

        if (tenant) {
            req.tenantId = tenant.id;
            console.log(`[TenantResolver] Subdomain '${subdomain}' resolvido para Tenant ID: '${tenant.id}'`);
        } else {
            console.warn(`[TenantResolver] Nenhum tenant encontrado para o subdomínio: '${subdomain}'`);
            // Se um X-Tenant-ID foi fornecido mas não corresponde a nenhum tenant,
            // é um erro de "Tenant Não Encontrado" para chamadas que exigem um tenant válido.
            return res.status(404).json({ message: "Tenant não encontrado para o subdomínio fornecido." });
        }
    } catch (error) {
        console.error("[TenantResolver] Erro ao resolver tenant:", error);
        return res.status(500).json({ message: "Erro interno do servidor ao resolver tenant." });
    }

    next();
};
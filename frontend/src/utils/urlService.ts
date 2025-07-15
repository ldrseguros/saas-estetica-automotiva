import { ENV_CONFIG } from '@/config/environment';

export const getSubdomainFromUrl = (): string | null => {
    const hostname = window.location.hostname;
    const baseDomain = ENV_CONFIG.BASE_DOMAIN;

    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        
        const cleanHostname = hostname.split(':')[0];
  
        if (cleanHostname.endsWith(`.${baseDomain}`) || cleanHostname.endsWith(`.localhost`)) {
            const parts = cleanHostname.split('.');
            
            if (parts.length > 0 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== '127') {
                return parts[0];
            }
        }
        return null; 
    }

    // Lógica para produção (domínio real)
    if (hostname.includes(baseDomain)) {
        const cleanHostname = hostname.split(':')[0];
        const baseDomainRegex = new RegExp(`\\.?${baseDomain.replace(/\./g, '\\.')}$`);
        const subdomainMatch = cleanHostname.replace(baseDomainRegex, '');

        if (subdomainMatch && subdomainMatch.length > 0 && subdomainMatch !== 'www') {
           
            return subdomainMatch.endsWith('.') ? subdomainMatch.slice(0, -1) : subdomainMatch;
        }
    }

    return null; // Não foi possível determinar um subdomínio de tenant válido
};

export const buildTenantLoginUrl = (subdomain: string): string => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const baseDomain = ENV_CONFIG.BASE_DOMAIN;

    if (ENV_CONFIG.IS_PRODUCTION) {
        return `${protocol}//${subdomain}.${baseDomain}/login`;
    } else {
        return `${protocol}//${subdomain}.${baseDomain}${port}/login`;
    }
};
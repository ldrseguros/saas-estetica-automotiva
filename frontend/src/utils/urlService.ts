import ENV_CONFIG from '../config/environment';

export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname; // Ex: "esteticaas.meusaas.com.br", "localhost"


  if (hostname === 'localhost') {
    const urlParams = new URLSearchParams(window.location.search);
    const devSubdomain = urlParams.get('devSubdomain');
    if(devSubdomain){
      return devSubdomain;
    }
    // console.log("Dev subdomain detected:", devSubdomain); // Para debug
    return devSubdomain;
  }

  const baseDomain = ENV_CONFIG.BASE_DOMAIN;

  if (!baseDomain) {
    console.warn("BASE_DOMAIN não configurado no envirnment.js para detecção de subdomínio.");
    return null;
  }

  const parts = hostname.split('.');


  if (hostname.endsWith(baseDomain) && parts.length > baseDomain.split('.').length) {
    const subdomain = parts[0];

    if (subdomain && !['www', 'admin', 'painel'].includes(subdomain)) {
      // console.log("Subdomain from hostname:", subdomain); // Para debug
      return subdomain;
    }
  }

  // console.log("No valid tenant subdomain found in hostname."); // Para debug
  return null;
};
/***************** Handle dates ISO or NOT */
/**
 * Helper pour traiter les valeurs de `from` et `to`.
 * Si la valeur est une date ISO valide, elle est entourée de guillemets.
 * Si c'est une expression relative, elle est renvoyée telle quelle.
 * 
 * @param value - La valeur à traiter (`now()-1d` ou `2024-12-27T09:00:00.000Z`)
 * @returns La valeur formatée pour l'injection dans la requête
 */
export const formatTimeValue = (value: string): string => {
    return isDate(value) ? `"${value}"` : value;
  };
  
  /**
   * Vérifie si une chaîne est une date ISO valide.
   * 
   * @param value - La chaîne à vérifier
   * @returns `true` si c'est une date ISO, sinon `false`
   */
  const isDate = (value: string): boolean => {
    return !isNaN(Date.parse(value));
  };


  /***************** Handle Continent based on country list as ISO-XX */
export const countriesByContinent: Record<string, string[]> = {
    "AF": ["DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CD", "CG", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW"],
    "AS": ["AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TM", "AE", "UZ", "VN", "YE"],
    "EU": ["AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "VA"],
    "NA": ["AG", "BS", "BB", "BZ", "CA", "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM", "MX", "NI", "PA", "US", "KN", "LC", "VC", "TT"],
    "SA": ["AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", "UY", "VE"],
    "OC": ["AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU"]
  };

  export const TAG_ONE_CORE = "ONE CORE";

  

  
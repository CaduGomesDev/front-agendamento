// Barrel dos serviços. Importe funções direto do módulo específico
// (ex.: `import { getBarbers } from "@/services/barbers"`) ou via namespace:
//   import { authService } from "@/services";
export * as appointmentsService from "./appointments";
export * as barbersService from "./barbers";
export * as clientsService from "./clients";
export * as servicesService from "./services";
export * as settingsService from "./settings";
export * as authService from "./auth";
export { api, API_BASE_URL, tokenStore, ApiError } from "./api";

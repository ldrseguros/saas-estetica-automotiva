import { AxiosInstance } from 'axios';

export declare const fetchMyVehicles: () => Promise<any>;
export declare const addMyVehicle: (vehicleData: any) => Promise<any>;

declare const API: AxiosInstance;
export default API;
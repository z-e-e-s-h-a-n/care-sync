declare module "airports-data/airports.json" {
  export interface AirportData {
    id: string;
    name: string;
    city: string;
    country: string;
    iata: string;
    icao: string;
    latitude: string;
    longitude: string;
    altitude: string;
    timezone: string;
    dst: string;
    tz: string;
    type: string;
    source: string;
  }

  const airports: AirportData[];
  export default airports;
}

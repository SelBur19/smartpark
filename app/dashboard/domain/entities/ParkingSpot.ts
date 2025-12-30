export class ParkingSpot {
  constructor(
    public id: number,
    public location: string,
    public available: number,
    public total: number,
    public price: string
  ) {}
}

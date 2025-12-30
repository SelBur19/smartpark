export class Booking {
  constructor(
    public id: number,
    public location: string,
    public date: string,
    public time: string,
    public status: "Active" | "Completed"
  ) {}
}

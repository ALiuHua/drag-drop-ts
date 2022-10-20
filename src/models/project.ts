export enum ProjectStatus {
  Active,
  Finished,
}
//Project type
//In this case we dont want custom type or interface, because we want to instinanitail it
// then we can use this class to new instance(之前是用字面量的形式，现在可以直接传入参数来new)
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public numOfPeople: number,
    public status: ProjectStatus
  ) {}
  get people() {
    return this.numOfPeople > 1
      ? `${this.numOfPeople} persons asssigned`
      : "1 person assigned";
  }
}

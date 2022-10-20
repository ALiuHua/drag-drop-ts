import { Project, ProjectStatus } from "../models/project";
//Alternative to render projects, without listeners!
// we just need the identifier insead of actual value of them. so it's very good place to useing enum

type Listener<T> = (items: T[]) => void;

//Class State
class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
///Project state management
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updataListeners();
  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      (project.status = newStatus), this.updataListeners();
    }
  }
  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }
  private updataListeners() {
    for (const listenerFn of this.listeners) {
      console.log(this);
      listenerFn(this.projects.slice());
    }
  }
}
//如何实现class间的数据交换
export const projectState = ProjectState.getInstance(); //this is a global variable instance, so we can use it within the entire file

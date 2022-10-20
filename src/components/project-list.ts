import { Component } from "./base-component";
import { DragTarget } from "../models/drag-drop";
import { Project } from "../models/project";
import { autobindDecorator } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";
import { ProjectStatus } from "../models/project";
//ProjectList class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`); // 继承所需要接收的参数只需要写在super（）里面即可
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }
  @autobindDecorator
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }
  @autobindDecorator
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
  @autobindDecorator
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }
  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECT";
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    //best sollutioin is doing dom comparision to deside which one already in the dom
    // in this small application, we just clear everything in each render, and rerender everything again
    listEl.innerHTML = "";

    for (const item of this.assignedProjects) {
      //   const listItem = document.createElement("li");
      //   listItem.innerHTML = item.title;
      //   listEl.appendChild(listItem);
      console.log(this.element.id);
      new ProjectItem(item, listEl.id);
    }
  }
  //   private attach() {
  //     this.hostElement.insertAdjacentElement("beforeend", this.element);
  //     // this.hostElement.insertAdjacentElement("beforeend", this.element);
  //     //即是我多次添加也只有一次，他是如何追踪的？ 这可能可以回答为什么我在attach后修改this.element.id仍然有效
  //   }
}

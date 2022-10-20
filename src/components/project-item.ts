import { Draggable } from "../models/drag-drop";
import { Component } from "./base-component";
import { autobindDecorator } from "../decorators/autobind";
import { Project } from "../models/project";

//
export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  constructor(project: Project, hostElementId: string) {
    super("single-project", hostElementId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }
  @autobindDecorator
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/Plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  @autobindDecorator
  dragEndHandler(event: DragEvent): void {
    console.log("DragEnd");
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.project.people;
    this.element.querySelector("p")!.textContent = this.project.description;
    this.hostElement.appendChild(this.element);
  }
}

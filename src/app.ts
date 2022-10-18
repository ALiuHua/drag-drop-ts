//Drag and Drop interfaces

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateID: string,
    hostElmentId: string,
    insertAtStart: boolean,
    newElementId?: string // newElementId?: string 等同于 newElementId: string ｜ undefined
  ) {
    this.templateElement = document.getElementById(
      templateID
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElmentId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    // importedNode is document frament, and which is live; once we append or insert will all or part it will update this frament anywhere
    /**
       * A common use for DocumentFragment is to create one, assemble a DOM subtree within it, then append or insert the fragment into the DOM using Node interface methods such as appendChild(), append(), or insertBefore(). Doing this moves the fragment's nodes into the DOM, leaving behind an empty DocumentFragment.
       This interface is also of great use with Web components: <template> elements contain a DocumentFragment in their HTMLTemplateElement.content property.
       */
    this.element = importedNode.firstElementChild! as U;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
    // this.hostElement.insertAdjacentElement("beforeend", this.element);
    //即是我多次添加也只有一次，他是如何追踪的？ 这可能可以回答为什么我在attach后修改this.element.id仍然有效
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

//Alternative to render projects, without listeners!
// we just need the identifier insead of actual value of them. so it's very good place to useing enum
enum ProjectStatus {
  Active,
  Finished,
}
//Project type
//In this case we dont want custom type or interface, because we want to instinanitail it
// then we can use this class to new instance(之前是用字面量的形式，现在可以直接传入参数来new)
type Listener<T> = (items: T[]) => void;

class Project {
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
const projectState = ProjectState.getInstance(); //this is a global variable instance, so we can use it within the entire file
//
class ProjectItem
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
//ProjectList class
class ProjectList
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

//Auto-bind decorator
//对method的属性读取method函数变成get函数返回绑定this值的函数
//如果方法装饰器返回一个值，则该值作为被装饰的方法的修饰符

//Validation function
//起名字，因为形容词
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
function validation(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  // value != null 或者 value ！= undefined 可以用来排除 value 为undefined 和 null的情况
  if (
    validatableInput.minLength != undefined &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != undefined &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

function autobindDecorator(
  _: any,
  _2: string | Symbol,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    enumerable: true,
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  //   private templateElement: HTMLTemplateElement;
  //   private hostElement: HTMLDivElement;
  titleInput: HTMLInputElement;
  peopleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  //   element: HTMLFormElement; // why we need this insead of using node directly? insertAdjacentElement 不接受node insert？
  constructor() {
    super("project-input", "app", true, "user-input");
    //Form input element
    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;

    this.configure();
  }

  private getUserInput(): [string, string, number] | void {
    //return a tuple
    const enteredTitle = this.titleInput.value;
    const enteredDescription = this.descriptionInput.value;
    const enteredPeople = this.peopleInput.value;
    const validatableTitle: Validatable = {
      value: enteredTitle,
      required: true,
      minLength: 2,
      maxLength: 6,
    };
    const validatableDescription: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const validatablePeople: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 6,
    };
    if (
      !validation(validatableTitle) ||
      !validation(validatableDescription) ||
      !validation(validatablePeople)
    ) {
      alert("Invalid input, please try again.");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInput.value = "";
    this.descriptionInput.value = "";
    this.peopleInput.value = "";
  }

  @autobindDecorator
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler); //利用auto-bind decorator
  }
  renderContent() {}
}

const project = new ProjectInput();
const finishedProjectList = new ProjectList("finished");
const activeProjectList2 = new ProjectList("active");
